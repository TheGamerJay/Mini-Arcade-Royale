"""User profile and settings routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models import User
from app.schemas import UserResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/users", tags=["users"])


class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
def update_profile(
    update: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile"""
    if update.username is not None and update.username != current_user.username:
        existing = db.query(User).filter(User.username == update.username).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = update.username

    if update.display_name is not None:
        current_user.display_name = update.display_name

    if update.avatar_url is not None:
        current_user.avatar_url = update.avatar_url

    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/profile/{username}", response_model=UserResponse)
def get_user_profile(username: str, db: Session = Depends(get_db)):
    """Get public user profile by username"""
    user = db.query(User).filter(User.username == username, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)
