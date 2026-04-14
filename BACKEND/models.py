from sqlalchemy import Column, Integer, String, Text, ForeignKey, DECIMAL, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database.database import Base


def _utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
    
    # Relationships
    queries = relationship("Query", back_populates="user", cascade="all, delete-orphan")


class Query(Base):
    __tablename__ = "queries"

    query_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    query_text = Column(Text, nullable=False)
    status = Column(String(30), default="Processing")
    inferred_parameters = Column(Text, nullable=True)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String(30), nullable=True)
    risk_reasoning = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="queries")
    tasks = relationship("Task", back_populates="query", cascade="all, delete-orphan")
    explanations = relationship("Explanation", back_populates="query", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("queries.query_id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False)
    status = Column(String(30), default="Pending")
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    completed_at = Column(DateTime)
    
    # Relationships
    query = relationship("Query", back_populates="tasks")
    responses = relationship("Response", back_populates="task", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    response_id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id", ondelete="CASCADE"), nullable=False, index=True)
    response_text = Column(Text, nullable=False)
    confidence_score = Column(Float)
    execution_time = Column(Float)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    
    # Relationships
    task = relationship("Task", back_populates="responses")


class Explanation(Base):
    __tablename__ = "explanations"

    explanation_id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("queries.query_id", ondelete="CASCADE"), nullable=False, index=True)
    explanation_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    
    # Relationships
    query = relationship("Query", back_populates="explanations")


class GovernancePolicy(Base):
    __tablename__ = "governance_policies"

    policy_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    risk_level = Column(String(10), nullable=False, index=True)
    decision = Column(String(30), nullable=False)
    score = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    actions_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)