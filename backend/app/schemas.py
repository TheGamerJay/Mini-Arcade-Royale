"""Pydantic schemas for request/response validation"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


# User schemas
class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    display_name: Optional[str] = None


class UserRegister(UserBase):
    """User registration request"""
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """User response (no password)"""
    id: int
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Credit wallet schemas
class CreditWalletResponse(BaseModel):
    """Credit wallet response"""
    id: int
    balance: float
    lifetime_earned: float
    lifetime_spent: float
    last_updated: datetime
    
    class Config:
        from_attributes = True


# Transaction schemas
class CreditTransactionResponse(BaseModel):
    """Credit transaction response"""
    id: int
    transaction_type: str
    amount: float
    description: Optional[str] = None
    reference_id: Optional[str] = None
    balance_before: float
    balance_after: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Auth response schemas
class AuthResponse(BaseModel):
    """Authentication response (user + token)"""
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenRefreshRequest(BaseModel):
    """Token refresh request"""
    refresh_token: str
