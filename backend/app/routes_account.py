"""Account management routes — stats, game history, sessions, notifications, delete"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models import User, CreditWallet, CreditTransaction, GamePlay
from app.schemas import UserResponse
from app.auth import get_current_user, verify_password, hash_password

router = APIRouter(prefix="/api/v1/account", tags=["account"])


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get player stats overview"""
    plays = db.query(GamePlay).filter(GamePlay.user_id == current_user.id).all()

    total_games = len(plays)
    total_spent = sum(p.bet_amount for p in plays)
    total_won = sum(p.payout_amount for p in plays)
    wins = sum(1 for p in plays if p.outcome == "win")
    win_rate = (wins / total_games * 100) if total_games > 0 else 0.0

    # Games by type
    games_by_type: dict = {}
    for p in plays:
        games_by_type[p.game_key] = games_by_type.get(p.game_key, 0) + 1

    favorite_game = max(games_by_type, key=games_by_type.get) if games_by_type else None

    return {
        "total_games_played": total_games,
        "total_credits_spent": total_spent,
        "total_credits_won": total_won,
        "net_result": total_won - total_spent,
        "win_rate": round(win_rate, 1),
        "favorite_game": favorite_game,
        "current_streak": 0,   # TODO: implement streak tracking
        "longest_streak": 0,
        "games_by_type": games_by_type,
    }


# ─── Game History ─────────────────────────────────────────────────────────────

@router.get("/game-history")
def get_game_history(
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's game play history"""
    q = db.query(GamePlay).filter(GamePlay.user_id == current_user.id)
    total = q.count()
    plays = q.order_by(GamePlay.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "plays": [
            {
                "id": p.id,
                "game_key": p.game_key,
                "bet_amount": p.bet_amount,
                "payout_amount": p.payout_amount,
                "outcome": p.outcome,
                "created_at": p.created_at.isoformat(),
            }
            for p in plays
        ],
    }


# ─── Sessions (stub — real impl needs session table) ─────────────────────────

@router.get("/sessions")
def get_sessions(current_user: User = Depends(get_current_user)):
    """Get active sessions (stub — session table not yet implemented)"""
    return {
        "sessions": [
            {
                "id": "current",
                "device": "Current session",
                "ip_address": "—",
                "last_active": datetime.utcnow().isoformat(),
                "is_current": True,
            }
        ]
    }


@router.delete("/sessions/{session_id}")
def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    """Revoke a session (stub)"""
    if session_id == "current":
        raise HTTPException(status_code=400, detail="Cannot revoke current session here — use logout")
    return {"message": "Session revoked"}


@router.delete("/sessions")
def logout_all(current_user: User = Depends(get_current_user)):
    """Logout all sessions (stub — implement with token blacklist or session table)"""
    return {"message": "All sessions have been logged out"}


# ─── Notification Preferences ────────────────────────────────────────────────

class NotificationPrefsRequest(BaseModel):
    email_game_results: Optional[bool] = None
    email_purchases: Optional[bool] = None
    email_promotions: Optional[bool] = None
    email_security: Optional[bool] = None
    email_policy_updates: Optional[bool] = None
    email_missions: Optional[bool] = None


@router.get("/notifications")
def get_notification_prefs(current_user: User = Depends(get_current_user)):
    """Get notification preferences (returns defaults — persist in DB when User model is extended)"""
    return {
        "email_game_results": False,
        "email_purchases": True,
        "email_promotions": True,
        "email_security": True,
        "email_policy_updates": True,
        "email_missions": False,
    }


@router.patch("/notifications")
def update_notification_prefs(
    prefs: NotificationPrefsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update notification preferences (stub — extend User model to persist)"""
    return {"message": "Preferences saved"}


# ─── Delete Account ───────────────────────────────────────────────────────────

class DeleteAccountRequest(BaseModel):
    password: str


@router.delete("/delete")
def delete_account(
    data: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete user account"""
    if not verify_password(data.password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect password")

    # Soft delete: mark inactive rather than hard delete to preserve transaction history
    current_user.is_active = False
    current_user.email = f"deleted_{current_user.id}_{current_user.email}"
    current_user.username = f"deleted_{current_user.id}"
    current_user.updated_at = datetime.utcnow()
    db.commit()

    return {"message": "Account deleted"}


# ─── Promo Code Redemption ────────────────────────────────────────────────────

class RedeemCodeRequest(BaseModel):
    code: str


# Hardcoded demo codes — in production store these in DB with usage tracking
_PROMO_CODES: dict = {
    "WELCOME2024": 50,
    "ARCADE100":   100,
    "FREEPLAY50":  50,
}


@router.post("/redeem")
def redeem_code(
    data: RedeemCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Redeem a promo code for Mini Credits"""
    code = data.code.upper().strip()
    credits_value = _PROMO_CODES.get(code)

    if not credits_value:
        raise HTTPException(status_code=400, detail="Invalid or expired promo code")

    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    balance_before = wallet.balance
    wallet.balance += credits_value
    wallet.lifetime_earned += credits_value

    tx = CreditTransaction(
        user_id=current_user.id,
        transaction_type="PROMO_REWARD",
        amount=float(credits_value),
        description=f"Promo code: {code}",
        reference_id=code,
        balance_before=balance_before,
        balance_after=wallet.balance,
        status="completed",
    )
    db.add(tx)
    db.commit()

    return {
        "message": f"Code redeemed! +{credits_value} Mini Credits",
        "credits_awarded": credits_value,
        "new_balance": wallet.balance,
    }
