"""Analytics and monitoring routes"""
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import GamePlay, CreditTransaction, User
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    """Get analytics overview"""
    # Games today
    today = datetime.utcnow().date()
    games_today = db.query(func.count(GamePlay.id)).filter(
        func.date(GamePlay.created_at) == today
    ).scalar()
    
    # Revenue today
    revenue_today = db.query(func.sum(CreditTransaction.amount)).filter(
        CreditTransaction.transaction_type == "purchase",
        func.date(CreditTransaction.created_at) == today
    ).scalar() or 0
    
    # New users today
    new_users_today = db.query(func.count(User.id)).filter(
        func.date(User.created_at) == today
    ).scalar()
    
    return {
        "games_today": games_today,
        "revenue_today": float(revenue_today),
        "new_users_today": new_users_today,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/games/stats")
def get_game_stats(db: Session = Depends(get_db)):
    """Get game statistics"""
    stats = db.query(
        GamePlay.game_key,
        func.count(GamePlay.id).label("plays"),
        func.sum(GamePlay.bet_amount).label("total_bet"),
        func.sum(GamePlay.payout_amount).label("total_payout"),
    ).group_by(GamePlay.game_key).all()
    
    return {
        "game_statistics": [
            {
                "game_key": s[0],
                "plays": s[1],
                "total_bet": float(s[2] or 0),
                "total_payout": float(s[3] or 0),
            }
            for s in stats
        ]
    }


@router.get("/health")
def get_system_health():
    """Get system health status"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0",
    }
