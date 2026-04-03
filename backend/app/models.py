"""SQLAlchemy ORM models for Mini Arcade Royale"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class User(Base):
    """User account model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    wallet = relationship("CreditWallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("CreditTransaction", back_populates="user", cascade="all, delete-orphan")
    gameplay_records = relationship("GamePlay", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class CreditWallet(Base):
    """User's credit wallet (balance)"""
    __tablename__ = "credit_wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    balance = Column(Float, default=0.0, nullable=False)  # Credits available
    lifetime_earned = Column(Float, default=0.0, nullable=False)  # Total earned all-time
    lifetime_spent = Column(Float, default=0.0, nullable=False)  # Total spent all-time
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="wallet")


class CreditTransaction(Base):
    """Immutable credit transaction ledger"""
    __tablename__ = "credit_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    transaction_type = Column(String(50), nullable=False, index=True)  # e.g., "purchase", "game_bet", "game_payout"
    amount = Column(Float, nullable=False)  # Positive = credit, Negative = debit
    description = Column(Text, nullable=True)
    reference_id = Column(String(255), nullable=True, index=True)  # Link to game ID, purchase ID, etc.
    balance_before = Column(Float, nullable=False)  # Snapshot before transaction
    balance_after = Column(Float, nullable=False)  # Snapshot after transaction
    status = Column(String(50), default="completed", nullable=False)  # completed, pending, failed
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="transactions")


class GamePlay(Base):
    """Game play records (for auditing and analytics)"""
    __tablename__ = "gameplays"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    game_key = Column(String(100), nullable=False, index=True)  # e.g., "flappy_arcade", "space_invaders"
    bet_amount = Column(Float, nullable=False)
    payout_amount = Column(Float, nullable=False)
    multiplier = Column(Float, nullable=True)  # Actual multiplier achieved
    outcome = Column(String(50), nullable=False, index=True)  # "win", "loss", "tie"
    game_data = Column(Text, nullable=True)  # JSON with game-specific data
    playback_hash = Column(String(255), nullable=True)  # For replay protection/verification
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="gameplay_records")


class AuditLog(Base):
    """Audit log for all important actions"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., "user_created", "bet_placed", "payout_issued"
    resource_type = Column(String(100), nullable=True)  # e.g., "User", "Transaction", "GamePlay"
    resource_id = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)  # JSON with action details
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    status = Column(String(50), default="success", nullable=False)  # success, failure
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
