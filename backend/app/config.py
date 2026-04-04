"""Application configuration"""
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # App
    app_name: str = "Mini Arcade Royale"
    app_version: str = "0.1.0"
    app_env: str = "development"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8080  # Railway overrides via PORT env var
    
    # Database
    database_url: str = Field(
        "postgresql://arcade_dev:arcade_pass@localhost:5432/arcade_royale_dev",
        env="DATABASE_URL",
    )

    # JWT
    jwt_secret: str = Field(
        "dev-secret-change-in-production-do-not-use",
        env="JWT_SECRET",
    )
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Session
    session_secret: str = "dev-session-secret-change-in-production"
    
    # CSRF
    csrf_secret: str = "dev-csrf-secret-change-in-production"
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""
    
    # Email
    resend_api_key: str = ""
    
    # Sentry
    sentry_dsn: str = ""
    
    # Logging
    log_level: str = "info"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
