import re
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any, Union

# Characters not allowed in problem description
DANGEROUS_PATTERN = re.compile(r'[<>{}\[\]`]')

class ParametersSchema(BaseModel):
    impact: Optional[int] = Field(None, ge=1, le=10, description="Impact score between 1 and 10")
    likelihood: Optional[int] = Field(None, ge=1, le=10, description="Likelihood score between 1 and 10")
    urgency: Optional[int] = Field(None, ge=1, le=10, description="Urgency score between 1 and 10")
    confidence: Optional[int] = Field(None, ge=1, le=10, description="Confidence score between 1 and 10")

class AnalyzeRequest(BaseModel):
    problem_description: str = Field(
        ..., 
        min_length=10, 
        max_length=5000,
        description="Description of the problem to analyze"
    )
    parameters: Optional[ParametersSchema] = None
    auto_detect: bool = Field(default=False, description="Whether to infer parameters automatically")
    mode: str = Field(default="governance", description="Mode: 'governance' or 'problem_solving'")

    @field_validator('mode')
    @classmethod
    def validate_mode(cls, v: str) -> str:
        if v not in ["governance", "problem_solving"]:
            raise ValueError("Mode must be 'governance' or 'problem_solving'")
        return v
    
    @field_validator('problem_description')
    @classmethod
    def validate_description(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Problem description cannot be empty or whitespace only")
        if DANGEROUS_PATTERN.search(v):
            raise ValueError("Problem description contains invalid characters: < > { } [ ] `")
        return v.strip()

class AgentOutput(BaseModel):
    agent: str
    score: float
    confidence: Optional[float] = None
    feature_breakdown: Optional[Dict[str, Any]] = None
    decision: Optional[str] = None
    reason: str

class TaskDecomposerOutput(AgentOutput):
    subtasks: Optional[list] = []

class ResearchOutput(AgentOutput):
    findings: Optional[list] = []
    context: Optional[str] = ""
    references: Optional[list] = []

class ExecutionOutput(AgentOutput):
    solution: Optional[str] = ""
    steps: Optional[list] = []

class ValidationOutput(AgentOutput):
    is_complete: Optional[bool] = True
    is_correct: Optional[bool] = True
    gaps: Optional[list] = []
    suggestions: Optional[list] = []

class AttackScenario(BaseModel):
    attack_type: str
    severity: str
    description: str
    mitigation: str

class AdversarialOutput(AgentOutput):
    critique: str
    worst_case_scenario: str
    confidence_in_critique: int
    attack_scenarios: Optional[List[AttackScenario]] = []

class ExplanationOutput(AgentOutput):
    summary: str
    detailed_reasoning: str
    policy_justification: str
    real_world_consequences: Union[str, List[str]]
    mitigation_strategies: Union[str, List[str]]

    @field_validator('real_world_consequences', 'mitigation_strategies', mode='before')
    @classmethod
    def convert_list_to_str(cls, v: Union[str, List[str]]) -> str:
        if isinstance(v, list):
            return " ".join(str(item) for item in v)
        return str(v)

class AnalyzeResponse(BaseModel):
    mode: str
    final_decision: str
    explanation: str
    query_id: int
    suggested_prompt: Optional[str] = None
    # Governance mode outputs
    analysis_output: Optional[AgentOutput] = None
    risk_output: Optional[AgentOutput] = None
    adversarial_output: Optional[AdversarialOutput] = None
    governance_output: Optional[AgentOutput] = None
    explanation_output: Optional[ExplanationOutput] = None
    inferred_parameters: Optional[dict] = None
    # Problem solving mode outputs
    decomposer_output: Optional[TaskDecomposerOutput] = None
    research_output: Optional[ResearchOutput] = None
    execution_output: Optional[ExecutionOutput] = None
    validation_output: Optional[ValidationOutput] = None

class HealthResponse(BaseModel):
    status: str
    message: str
    database_connected: bool

# Authentication Schemas
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")
    full_name: Optional[str] = Field(None, max_length=100, description="Full name")
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not all(c.isalnum() or c == '_' for c in v):
            raise ValueError("Username must contain only letters, numbers, and underscores")
        return v.lower()
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

class UserLogin(BaseModel):
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")

class ForgotPasswordRequest(BaseModel):
    username_or_email: str = Field(..., description="Username or email address")

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Reset token from email")
    new_password: str = Field(..., min_length=8, description="New Password (min 8 characters)")

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: str


class PolicyRule(BaseModel):
    decision: str = Field(..., description="BLOCK, REVIEW, or ALLOW")
    score: float = Field(..., ge=0, le=10)
    reason: str = Field(..., min_length=5, max_length=500)
    actions: List[str] = Field(default_factory=list)

    @field_validator("decision")
    @classmethod
    def validate_decision(cls, v: str) -> str:
        valid = {"BLOCK", "REVIEW", "ALLOW"}
        if v not in valid:
            raise ValueError("Decision must be one of BLOCK, REVIEW, ALLOW")
        return v


class GovernancePolicyResponse(BaseModel):
    policies: Dict[str, PolicyRule]


class GovernancePolicyUpdate(BaseModel):
    policies: Dict[str, PolicyRule]

    @field_validator("policies")
    @classmethod
    def validate_policy_levels(cls, v: Dict[str, PolicyRule]) -> Dict[str, PolicyRule]:
        required = {"HIGH", "MEDIUM", "LOW"}
        keys = set(v.keys())
        if keys != required:
            raise ValueError("Policies must include exactly HIGH, MEDIUM, and LOW")
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

class AdminUserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_admin: bool
    is_active: bool
    created_at: datetime
    query_count: int = 0

class AdminStatsResponse(BaseModel):
    total_users: int
    total_queries: int
    total_admins: int
    decisions: Dict[str, int]
