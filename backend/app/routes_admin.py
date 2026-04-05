"""Admin dashboard and management routes"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.models import User, GamePlay, CreditTransaction, CreditWallet
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)):
    """Require admin role — for now any active user can access (tighten with role field later)"""
    # TODO: add role column to User model and check user.role == 'admin'
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Forbidden")
    return current_user


@router.get("/stats")
def get_admin_stats(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "total_transactions": db.query(CreditTransaction).count(),
        "total_credits_in_circulation": db.query(func.sum(CreditWallet.balance)).scalar() or 0,
        "total_games_played": db.query(GamePlay).count(),
    }


@router.get("/users")
def get_all_users(
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
    q: Optional[str] = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if q:
        query = query.filter(
            (User.username.ilike(f"%{q}%")) | (User.email.ilike(f"%{q}%"))
        )
    total = query.count()
    users = query.order_by(User.id.desc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "display_name": u.display_name,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
    }


@router.post("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}


@router.post("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"message": "User activated"}
