"""User profile and settings routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/users", tags=["users"])


class UserUpdateRequest(BaseModel):
    """User profile update"""
    display_name: str | None = None
    avatar_url: str | None = None


@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: int, db: Session = Depends(get_db)):
    """Get current authenticated user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/me", response_model=UserResponse)
def update_profile(user_id: int, update: UserUpdateRequest, db: Session = Depends(get_db)):
    """Update user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update.display_name:
        user.display_name = update.display_name
    if update.avatar_url is not None:
        user.avatar_url = update.avatar_url
    
    db.commit()
    db.refresh(user)
    return user


@router.get("/profile/{username}", response_model=UserResponse)
def get_user_profile(username: str, db: Session = Depends(get_db)):
    """Get public user profile by username"""
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/search")
def search_users(q: str, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Search users by username"""
    users = db.query(User).filter(
        User.username.ilike(f"%{q}%"),
        User.is_active == True
    ).offset(skip).limit(limit).all()
    
    return {
        "total": db.query(User).filter(User.username.ilike(f"%{q}%")).count(),
        "users": [UserResponse.from_orm(u) for u in users]
    }
