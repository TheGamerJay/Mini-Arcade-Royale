"""Leaderboard and social features"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, GamePlay, CreditWallet

router = APIRouter(prefix="/api/v1/leaderboard", tags=["leaderboard"])


@router.get("/global")
def get_global_leaderboard(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get global leaderboard by balance"""
    users_with_balance = db.query(
        User.id,
        User.username,
        User.display_name,
        User.avatar_url,
        CreditWallet.balance,
        func.count(GamePlay.id).label("games_played"),
    ).join(CreditWallet, User.id == CreditWallet.user_id).outerjoin(
        GamePlay, User.id == GamePlay.user_id
    ).filter(
        User.is_active == True
    ).group_by(
        User.id, CreditWallet.balance
    ).order_by(
        desc(CreditWallet.balance)
    ).offset(skip).limit(limit).all()
    
    leaderboard = []
    for rank, (user_id, username, display_name, avatar_url, balance, games) in enumerate(users_with_balance, 1):
        leaderboard.append({
            "rank": rank + skip,
            "user_id": user_id,
            "username": username,
            "display_name": display_name or username,
            "avatar_url": avatar_url,
            "balance": balance,
            "games_played": games or 0,
        })
    
    return {
        "leaderboard": leaderboard,
        "total_users": db.query(User).filter(User.is_active == True).count(),
    }


@router.get("/earnings")
def get_earnings_leaderboard(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get leaderboard by lifetime earnings"""
    users_with_earnings = db.query(
        User.id,
        User.username,
        User.display_name,
        User.avatar_url,
        CreditWallet.lifetime_earned,
    ).join(CreditWallet, User.id == CreditWallet.user_id).filter(
        User.is_active == True
    ).order_by(
        desc(CreditWallet.lifetime_earned)
    ).offset(skip).limit(limit).all()
    
    leaderboard = []
    for rank, (user_id, username, display_name, avatar_url, earnings) in enumerate(users_with_earnings, 1):
        leaderboard.append({
            "rank": rank + skip,
            "user_id": user_id,
            "username": username,
            "display_name": display_name or username,
            "avatar_url": avatar_url,
            "lifetime_earned": earnings,
        })
    
    return {
        "leaderboard": leaderboard,
        "total_users": db.query(User).filter(User.is_active == True).count(),
    }


@router.get("/user-rank/{user_id}")
def get_user_rank(user_id: int, db: Session = Depends(get_db)):
    """Get specific user's rank"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Get rank by balance
    rank = db.query(func.count(CreditWallet.id)).filter(
        CreditWallet.balance > wallet.balance
    ).scalar() + 1
    
    total_users = db.query(User).filter(User.is_active == True).count()
    
    return {
        "user_id": user_id,
        "username": user.username,
        "rank": rank,
        "total_users": total_users,
        "balance": wallet.balance,
        "lifetime_earned": wallet.lifetime_earned,
    }
