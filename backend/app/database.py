"""Database configuration and session management"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

# Create database engine
try:
    engine = create_engine(
        settings.database_url,
        echo=settings.debug,  # Log SQL statements in development
        connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
        pool_pre_ping=True,  # Verify connections before using
    )
    logger.info(f"✓ Database engine created: {settings.database_url[:50]}...")
except Exception as e:
    logger.error(f"✗ Failed to create database engine: {e}")
    engine = None

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db():
    """Dependency for FastAPI to inject database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all_tables():
    """Create all database tables"""
    if engine is None:
        raise RuntimeError("Database engine not initialized")
    Base.metadata.create_all(bind=engine)
