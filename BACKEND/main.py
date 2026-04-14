from fastapi import FastAPI, Depends, HTTPException, Request, Response as FastAPIResponse, status
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from datetime import datetime
import time
from typing import Optional, List
import json

from config import settings
from orchestration.orchestrator import Orchestrator
from database.database import engine, get_db, Base
from models import Query, Task, Response, Explanation, User, GovernancePolicy
from agents.governance_agent import GovernanceAgent
from schemas import (
    AnalyzeRequest, AnalyzeResponse, HealthResponse,
    UserRegister, UserLogin, Token, UserResponse,
    ForgotPasswordRequest, ResetPasswordRequest,
    GovernancePolicyResponse, GovernancePolicyUpdate, PolicyRule,
    UserUpdate, PasswordUpdate, AdminUserResponse, AdminStatsResponse
)
from auth import verify_password, get_password_hash, create_access_token, decode_access_token
from logger import get_logger

# Automatic database schema migration
def run_migrations():
    import sqlite3
    migrations = [
        "ALTER TABLE queries ADD COLUMN inferred_parameters TEXT;",
        "ALTER TABLE queries ADD COLUMN risk_score FLOAT;",
        "ALTER TABLE queries ADD COLUMN risk_level VARCHAR;",
        "ALTER TABLE queries ADD COLUMN risk_reasoning TEXT;",
    ]
    conn = sqlite3.connect("decision_logs.db")
    try:
        c = conn.cursor()
        for sql in migrations:
            try:
                c.execute(sql)
                conn.commit()
            except sqlite3.OperationalError:
                pass  # Column already exists
    finally:
        conn.close()

run_migrations()

from datetime import timezone
from email_service import send_block_alert, send_password_reset_email
import asyncio

logger = get_logger("api")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    debug=settings.debug
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to create database tables: {str(e)}")

# Initialize orchestrator
orchestrator = Orchestrator()


security = HTTPBearer()


COOKIE_NAME = "access_token"
COOKIE_OPTS = dict(httponly=True, secure=not settings.debug, samesite="lax", max_age=settings.access_token_expire_minutes * 60)


def _set_auth_cookie(response: FastAPIResponse, token: str):
    response.set_cookie(key=COOKIE_NAME, value=token, **COOKIE_OPTS)


# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admin privileges required."
        )
    return current_user


# --- Helper functions ---

def _check_user_uniqueness(db: Session, username: str, email: str):
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")


def _create_user(db: Session, user_data: UserRegister) -> User:
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        is_active=True,
        is_admin=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def _save_analysis_results(db: Session, new_query: Query, result: dict, start_time: float):
    db.add(Explanation(query_id=new_query.query_id, explanation_text=result.get("explanation", "")))
    
    # Extract DB fields
    inferred = result.get("inferred_parameters")
    if inferred:
        new_query.inferred_parameters = json.dumps(inferred)
    
    risk_out = result.get("risk_output")
    if risk_out:
        new_query.risk_score = risk_out.get("score")
        new_query.risk_level = risk_out.get("decision")
        new_query.risk_reasoning = risk_out.get("reason")
        
    agent_outputs = [
        result.get("analysis_output"), result.get("risk_output"), result.get("governance_output"),
        result.get("explanation_output"),
        result.get("decomposer_output"), result.get("research_output"),
        result.get("execution_output"), result.get("validation_output")
    ]
    for agent_output in agent_outputs:
        if agent_output is None:
            continue
        task = Task(
            query_id=new_query.query_id,
            agent_name=agent_output["agent"],
            status="Completed",
            completed_at=datetime.now(timezone.utc)
        )
        db.add(task)
        db.flush()
        db.add(Response(
            task_id=task.task_id,
            response_text=json.dumps(agent_output),
            confidence_score=agent_output.get("score"),
            execution_time=time.time() - start_time
        ))
    new_query.status = "Completed"
    new_query.updated_at = datetime.now(timezone.utc)
    db.commit()


def _mark_query_failed(db: Session, query_id: int):
    try:
        query = db.query(Query).filter(Query.query_id == query_id).first()
        if query:
            query.status = "Failed"
            db.commit()
    except SQLAlchemyError as e:
        logger.error(f"Failed to update query status to Failed: {str(e)}")


def _default_policies() -> dict:
    return {
        level: {
            "decision": data["decision"],
            "score": float(data["score"]),
            "reason": data["reason"],
            "actions": list(data["actions"]),
        }
        for level, data in GovernanceAgent.DEFAULT_POLICIES.items()
    }


def _build_policy_payload(db: Session, user_id: int) -> dict:
    payload = _default_policies()
    rows = db.query(GovernancePolicy).filter(GovernancePolicy.user_id == user_id).all()
    for row in rows:
        if row.risk_level not in payload:
            continue
        try:
            actions = json.loads(row.actions_json)
            if not isinstance(actions, list):
                actions = payload[row.risk_level]["actions"]
        except (json.JSONDecodeError, TypeError, ValueError):
            actions = payload[row.risk_level]["actions"]
        payload[row.risk_level] = {
            "decision": row.decision,
            "score": float(row.score),
            "reason": row.reason,
            "actions": [str(a) for a in actions],
        }
    return payload


# Authentication Endpoints

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, response: FastAPIResponse, user_data: UserRegister, db: Session = Depends(get_db)):
    try:
        logger.info(f"Registration attempt for username: {user_data.username}")
        _check_user_uniqueness(db, user_data.username, user_data.email)
        new_user = _create_user(db, user_data)
        token = create_access_token(data={"sub": new_user.username})
        _set_auth_cookie(response, token)
        logger.info(f"User registered successfully: {new_user.username}")
        return UserResponse(
            user_id=new_user.user_id,
            username=new_user.username,
            email=new_user.email,
            full_name=new_user.full_name,
            is_active=new_user.is_active,
            is_admin=new_user.is_admin,
            created_at=new_user.created_at.isoformat()
        )
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error during registration: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already exists")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed")


@app.post("/auth/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, response: FastAPIResponse, credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        logger.info(f"Login attempt for: {credentials.username}")
        user = db.query(User).filter(
            (User.username == credentials.username) | (User.email == credentials.username)
        ).first()
        if not user or not verify_password(credentials.password, user.hashed_password):
            logger.warning(f"Login failed for: {credentials.username}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
        access_token = create_access_token(data={"sub": user.username})
        _set_auth_cookie(response, access_token)
        logger.info(f"Login successful for user: {user.username}")
        return Token(access_token=access_token, token_type="bearer")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed")


@app.post("/auth/logout")
async def logout(response: FastAPIResponse):
    response.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="lax")
    return {"message": "Logged out successfully"}


@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information
    """
    return UserResponse(
        user_id=current_user.user_id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_admin=current_user.is_admin,
        created_at=current_user.created_at.isoformat()
    )


@app.put("/auth/me", response_model=UserResponse)
async def update_current_user(data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update current user profile"""
    try:
        if data.full_name is not None:
            current_user.full_name = data.full_name
            current_user.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(current_user)
        return UserResponse(
            user_id=current_user.user_id,
            username=current_user.username,
            email=current_user.email,
            full_name=current_user.full_name,
            is_active=current_user.is_active,
            is_admin=current_user.is_admin,
            created_at=current_user.created_at.isoformat()
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile")


@app.post("/auth/password")
@limiter.limit("5/minute")
async def update_password(request: Request, data: PasswordUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update user password"""
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")
    try:
        current_user.hashed_password = get_password_hash(data.new_password)
        current_user.updated_at = datetime.now(timezone.utc)
        db.commit()
        return {"message": "Password updated successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating password: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update password")


@app.delete("/auth/me")
async def delete_current_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Delete the current user's account and all associated data
    """
    try:
        logger.info(f"Deleting user account: {current_user.username}")
        db.delete(current_user)
        db.commit()
        return {"message": "Account deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting user {current_user.username}: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete account")


# ── Admin Routes ──────────────────────────────────────────────────────────────

@app.get("/admin/users", response_model=List[AdminUserResponse])
async def get_all_users(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """List all registered users and their stats (Admin only)"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        q_count = db.query(Query).filter(Query.user_id == u.user_id).count()
        result.append(AdminUserResponse(
            user_id=u.user_id,
            username=u.username,
            email=u.email,
            full_name=u.full_name,
            is_admin=u.is_admin,
            is_active=u.is_active,
            created_at=u.created_at,
            query_count=q_count
        ))
    return result

@app.delete("/admin/users/{user_id}")
async def delete_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Delete a user account by ID (Admin only)"""
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="Admins cannot delete themselves")
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    try:
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Admin {admin.user_id} failed to delete user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete user")

@app.get("/admin/stats", response_model=AdminStatsResponse)
async def get_admin_stats(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get system-wide analytical metrics (Admin only)"""
    total_users = db.query(User).count()
    total_admins = db.query(User).filter(User.is_admin == True).count()
    total_queries = db.query(Query).count()
    
    # Calculate overarching decision distributions via parsing stored JSON responses, or simply counting keywords
    decisions = {}
    for d in ["ALLOW", "REVIEW", "BLOCK", "APPROVED", "NEEDS_IMPROVEMENT", "REJECTED"]:
        count = db.query(Response).filter(Response.response_text.like(f'%"{d}"%')).count()
        decisions[d] = count

    return AdminStatsResponse(
        total_users=total_users,
        total_queries=total_queries,
        total_admins=total_admins,
        decisions=decisions
    )


@app.post("/auth/refresh", response_model=Token)
async def refresh_token(response: FastAPIResponse, current_user: User = Depends(get_current_user)):
    access_token = create_access_token(data={"sub": current_user.username})
    _set_auth_cookie(response, access_token)
    logger.info(f"Token refreshed for user: {current_user.username}")
    return Token(access_token=access_token, token_type="bearer")


@app.post("/auth/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(
            (User.username == data.username_or_email) | (User.email == data.username_or_email)
        ).first()
        
        # Always return success to prevent user enumeration
        if not user or not user.is_active:
            await asyncio.sleep(0.5)
            return {"message": "If the account exists, a reset link will be sent."}
            
        # Create reset token valid for 15 mins
        from datetime import timedelta
        reset_token = create_access_token(
            data={"sub": user.username, "purpose": "reset_password"},
            expires_delta=timedelta(minutes=15)
        )
        
        reset_link = f"{settings.frontend_url}/?reset_token={reset_token}"
        
        logger.info(f"Password reset requested for user: {user.username}")
        
        asyncio.create_task(send_password_reset_email(
            to_email=user.email,
            username=user.username,
            reset_link=reset_link
        ))
        
        return {"message": "If the account exists, a reset link will be sent."}
    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred processing your request")


@app.post("/auth/reset-password")
@limiter.limit("5/minute")
async def reset_password(request: Request, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_access_token(data.token)
        if not payload or payload.get("purpose") != "reset_password":
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
            
        username = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
        
        if not user or not user.is_active:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
            
        user.hashed_password = get_password_hash(data.new_password)
        db.commit()
        logger.info(f"Password reset successfully for user: {user.username}")
        
        return {"message": "Password has been successfully reset"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Reset password error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred resetting your password")


@app.get("/policy/governance", response_model=GovernancePolicyResponse)
async def get_governance_policy(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    policies = _build_policy_payload(db, current_user.user_id)
    return GovernancePolicyResponse(
        policies={level: PolicyRule(**rule) for level, rule in policies.items()}
    )


@app.put("/policy/governance", response_model=GovernancePolicyResponse)
async def update_governance_policy(
    payload: GovernancePolicyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        for level, rule in payload.policies.items():
            row = db.query(GovernancePolicy).filter(
                GovernancePolicy.user_id == current_user.user_id,
                GovernancePolicy.risk_level == level,
            ).first()
            if row is None:
                row = GovernancePolicy(user_id=current_user.user_id, risk_level=level)
                db.add(row)
            row.decision = rule.decision
            row.score = float(rule.score)
            row.reason = rule.reason
            row.actions_json = json.dumps(rule.actions)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Policy update failed for user {current_user.username}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update governance policy")

    policies = _build_policy_payload(db, current_user.user_id)
    return GovernancePolicyResponse(
        policies={level: PolicyRule(**rule) for level, rule in policies.items()}
    )

# Protected Analysis Endpoint

@app.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def analyze(
    request: Request,
    data: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze a problem using the multi-agent system (Protected endpoint)
    """
    start_time = time.time()
    query_id = None
    
    try:
        logger.info(f"User {current_user.username} - Analysis request: {data.problem_description[:50]}...")
        
        # Store Query with actual user ID
        new_query = Query(
            user_id=current_user.user_id,
            query_text=data.problem_description,
            status="Processing"
        )
        db.add(new_query)
        db.commit()
        db.refresh(new_query)
        query_id = new_query.query_id
        
        logger.info(f"Created query {query_id} for user {current_user.username}")
        
        # Run Multi-Agent Orchestrator
        result = orchestrator.process({
            "problem_description": data.problem_description,
            "parameters": data.parameters.model_dump() if data.parameters else {},
            "auto_detect": getattr(data, "auto_detect", False),
            "mode": data.mode,
            "policy_overrides": _build_policy_payload(db, current_user.user_id),
        })
        
        _save_analysis_results(db, new_query, result, start_time)
        
        execution_time = time.time() - start_time
        logger.info(f"Query {query_id} completed in {execution_time:.2f}s for user {current_user.username}")
        
        # Send email alert for BLOCK decisions (governance mode only)
        if result["final_decision"] == "BLOCK" and result.get("risk_output"):
            asyncio.create_task(send_block_alert(
                to_email=current_user.email,
                username=current_user.username,
                problem=data.problem_description,
                risk_score=result["risk_output"]["score"]
            ))

        return AnalyzeResponse(
            **result,
            query_id=query_id
        )
    
    except ValueError as e:
        logger.warning(f"Validation error for query {query_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
    except SQLAlchemyError as e:
        logger.error(f"Database error for query {query_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    
    except Exception as e:
        logger.error(f"Unexpected error for query {query_id}: {str(e)}", exc_info=True)
        db.rollback()
        if query_id:
            _mark_query_failed(db, query_id)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


# Public Endpoints

@app.get("/history")
async def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0
):
    """
    Get paginated decision history for the current user
    """
    queries = (
        db.query(Query)
        .filter(Query.user_id == current_user.user_id, Query.status == "Completed")
        .order_by(Query.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    total = db.query(Query).filter(Query.user_id == current_user.user_id, Query.status == "Completed").count()

    history = []
    for q in queries:
        tasks = db.query(Task).filter(Task.query_id == q.query_id).all()
        final_decision = None
        mode = None
        for task in tasks:
            if task.agent_name == "GovernanceAgent":
                mode = "governance"
                resp = db.query(Response).filter(Response.task_id == task.task_id).first()
                if resp:
                    try:
                        data = json.loads(resp.response_text)
                        final_decision = data.get("decision")
                    except (json.JSONDecodeError, ValueError, KeyError) as parse_err:
                        logger.warning(f"Failed to parse response for task {task.task_id}: {str(parse_err)}")
            elif task.agent_name == "ValidationAgent":
                mode = "problem_solving"
                resp = db.query(Response).filter(Response.task_id == task.task_id).first()
                if resp:
                    try:
                        data = json.loads(resp.response_text)
                        final_decision = data.get("decision")
                    except (json.JSONDecodeError, ValueError, KeyError) as parse_err:
                        logger.warning(f"Failed to parse response for task {task.task_id}: {str(parse_err)}")
        history.append({
            "query_id": q.query_id,
            "query_text": q.query_text,
            "final_decision": final_decision,
            "mode": mode,
            "created_at": q.created_at.isoformat()
        })

    return {"total": total, "limit": limit, "offset": offset, "history": history}


@app.get("/history/all")
async def get_all_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 1000
):
    """Get decision history for CSV export (max 1000 records)"""
    limit = min(limit, 1000)
    queries = (
        db.query(Query)
        .filter(Query.user_id == current_user.user_id, Query.status == "Completed")
        .order_by(Query.created_at.desc())
        .limit(limit)
        .all()
    )

    history = []
    for q in queries:
        tasks = db.query(Task).filter(Task.query_id == q.query_id).all()
        final_decision = None
        mode = None
        for task in tasks:
            if task.agent_name == "GovernanceAgent":
                mode = "governance"
                resp = db.query(Response).filter(Response.task_id == task.task_id).first()
                if resp:
                    try:
                        data = json.loads(resp.response_text)
                        final_decision = data.get("decision")
                    except Exception:
                        pass
            elif task.agent_name == "ValidationAgent":
                mode = "problem_solving"
                resp = db.query(Response).filter(Response.task_id == task.task_id).first()
                if resp:
                    try:
                        data = json.loads(resp.response_text)
                        final_decision = data.get("decision")
                    except Exception:
                        pass
        history.append({
            "query_id": q.query_id,
            "query_text": q.query_text,
            "final_decision": final_decision,
            "mode": mode,
            "created_at": q.created_at.isoformat()
        })

    return {"total": len(history), "history": history}


@app.get("/analytics")
async def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = db.query(Query).filter(Query.user_id == current_user.user_id, Query.status == "Completed").count()

    decisions = {"BLOCK": 0, "REVIEW": 0, "ALLOW": 0, "APPROVED": 0, "NEEDS_IMPROVEMENT": 0, "REJECTED": 0}
    risk_scores = []
    daily_counts = {}

    queries = db.query(Query).filter(
        Query.user_id == current_user.user_id,
        Query.status == "Completed"
    ).all()

    for q in queries:
        day = q.created_at.strftime("%Y-%m-%d")
        daily_counts[day] = daily_counts.get(day, 0) + 1

        tasks = db.query(Task).filter(Task.query_id == q.query_id).all()
        for task in tasks:
            resp = db.query(Response).filter(Response.task_id == task.task_id).first()
            if not resp:
                continue
            try:
                data = json.loads(resp.response_text)
                if task.agent_name in ("GovernanceAgent", "ValidationAgent"):
                    decision = data.get("decision")
                    if decision in decisions:
                        decisions[decision] += 1
                if task.agent_name == "RiskAgent":
                    score = data.get("score")
                    if score is not None:
                        risk_scores.append(float(score))
            except (json.JSONDecodeError, ValueError, KeyError) as parse_err:
                logger.warning(f"Failed to parse response text: {str(parse_err)}")

    avg_risk = round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else 0
    trend = sorted([{"date": k, "count": v} for k, v in daily_counts.items()], key=lambda x: x["date"])

    return {
        "total_analyses": total,
        "decisions": decisions,
        "avg_risk_score": avg_risk,
        "trend": trend
    }


# Public Endpoints
@app.get("/", response_model=HealthResponse)
def root():
    return HealthResponse(
        status="healthy",
        message="Multi-Agent AI Orchestration API is running",
        database_connected=True
    )


@app.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_connected = True
        logger.info("Health check passed")
    except Exception as e:
        db_connected = False
        logger.error(f"Health check failed: {str(e)}")
    
    return HealthResponse(
        status="healthy" if db_connected else "unhealthy",
        message="Multi-Agent AI Orchestration API",
        database_connected=db_connected
    )