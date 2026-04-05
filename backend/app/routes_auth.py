"""API routes for authentication"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from app.database import get_db
from app.models import User, CreditWallet, CreditTransaction
from app.schemas import UserRegister, UserLogin, UserResponse, AuthResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

SIGNUP_BONUS_CREDITS = 40  # Free mini credits on new account


# ─── Register ────────────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user and grant 30 free mini credits"""

    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        display_name=user_data.display_name,
        password_hash=hashed_password,
        is_verified=False,
    )
    db.add(new_user)
    db.flush()  # get new_user.id

    # Create wallet with 30 free mini credits
    wallet = CreditWallet(
        user_id=new_user.id,
        balance=float(SIGNUP_BONUS_CREDITS),
        lifetime_earned=float(SIGNUP_BONUS_CREDITS),
        lifetime_spent=0.0,
    )
    db.add(wallet)
    db.flush()

    # Record the signup bonus transaction
    bonus_tx = CreditTransaction(
        user_id=new_user.id,
        transaction_type="SIGNUP_BONUS",
        amount=float(SIGNUP_BONUS_CREDITS),
        description="Welcome bonus — 40 free Mini Credits",
        balance_before=0.0,
        balance_after=float(SIGNUP_BONUS_CREDITS),
        status="completed",
    )
    db.add(bonus_tx)

    try:
        db.commit()
        db.refresh(new_user)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to a database error. Please try again later.",
        )

    access_token = create_access_token(user_id=new_user.id, email=new_user.email)

    return AuthResponse(
        user=UserResponse.model_validate(new_user),
        access_token=access_token,
        token_type="bearer",
        expires_in=24 * 3600,
    )


# ─── Login ────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=AuthResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and return JWT token"""

    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    access_token = create_access_token(user_id=user.id, email=user.email)

    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        token_type="bearer",
        expires_in=24 * 3600,
    )


# ─── Me ───────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return UserResponse.model_validate(current_user)


# ─── Change Password ──────────────────────────────────────────────────────────

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_user.password_hash = hash_password(data.new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Password updated successfully"}


# ─── Forgot / Reset Password (stub — real impl needs email service) ───────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send a password reset email (anti-enumeration: always returns success)"""
    # In production: look up user, generate token, send email
    # We always return 200 to prevent email enumeration
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password via token (stub — implement with token store)"""
    # In production: validate token from DB, update password, invalidate token
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


# ─── Email Verification (stub) ────────────────────────────────────────────────

class VerifyEmailRequest(BaseModel):
    token: str


@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verify email via token (stub)"""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.post("/resend-verification")
def resend_verification(current_user: User = Depends(get_current_user)):
    """Resend verification email (stub)"""
    if current_user.is_verified:
        return {"message": "Email is already verified"}
    return {"message": "Verification email sent"}
