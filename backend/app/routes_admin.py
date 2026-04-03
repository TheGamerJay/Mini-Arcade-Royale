"""Admin dashboard and management routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, GamePlay, CreditTransaction, CreditWallet

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def verify_admin(user_id: int, db: Session = Depends(get_db)):
    """Verify user is admin"""
    # In production, check user role/permissions
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user


@router.get("/dashboard", dependencies=[Depends(verify_admin)])
def get_admin_dashboard(db: Session = Depends(get_db)):
    """Get admin dashboard stats"""
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "verified_users": db.query(User).filter(User.is_verified == True).count(),
        "total_credits_issued": db.query(func.sum(CreditWallet.balance)).scalar() or 0,
        "total_revenue": db.query(func.sum(CreditTransaction.amount)).filter(
            CreditTransaction.transaction_type == "purchase"
        ).scalar() or 0,
        "total_games_played": db.query(GamePlay).count(),
        "total_payouts": db.query(func.sum(CreditTransaction.amount)).filter(
            CreditTransaction.transaction_type == "game_payout"
        ).scalar() or 0,
    }


@router.get("/users", dependencies=[Depends(verify_admin)])
def get_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users with pagination"""
    users = db.query(User).offset(skip).limit(limit).all()
    total = db.query(User).count()
    
    return {
        "total": total,
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ]
    }


@router.get("/transactions", dependencies=[Depends(verify_admin)])
def get_all_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all transactions"""
    transactions = db.query(CreditTransaction).order_by(
        CreditTransaction.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    total = db.query(CreditTransaction).count()
    
    return {
        "total": total,
        "transactions": [
            {
                "id": t.id,
                "user_id": t.user_id,
                "type": t.transaction_type,
                "amount": t.amount,
                "status": t.status,
                "created_at": t.created_at.isoformat(),
            }
            for t in transactions
        ]
    }


@router.post("/users/{user_id}/deactivate", dependencies=[Depends(verify_admin)])
def deactivate_user(user_id: int, db: Session = Depends(get_db)):
    """Deactivate user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    
    return {"deactivated": True, "user_id": user_id}


@router.post("/users/{user_id}/verify", dependencies=[Depends(verify_admin)])
def verify_user(user_id: int, db: Session = Depends(get_db)):
    """Manually verify user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_verified = True
    db.commit()
    
    return {"verified": True, "user_id": user_id}
