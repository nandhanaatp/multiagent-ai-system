from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", case_sensitive=False)

    # Database
    database_url: str

    # CORS
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # API
    api_title: str = "Multi-Agent AI Orchestration API"
    api_version: str = "1.0.0"
    debug: bool = True

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Rate Limiting
    rate_limit_per_minute: int = 10

    # Bcrypt
    bcrypt_rounds: int = 12

    # Groq
    groq_api_key: str = ""

    # Frontend
    frontend_url: str = "http://localhost:3000"

    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = ""
    email_enabled: bool = False

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

settings = Settings()
