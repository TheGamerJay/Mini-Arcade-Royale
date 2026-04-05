"""Missions routes — daily, weekly, special missions"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.database import get_db
from app.models import User, CreditWallet, CreditTransaction, GamePlay
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/missions", tags=["missions"])

# Static mission definitions — in production these would come from DB
DAILY_MISSIONS = [
    {"id": "daily_play_1", "title": "First Play", "description": "Play any game today", "target": 1, "reward": 5, "type": "daily"},
    {"id": "daily_play_3", "title": "Hat Trick", "description": "Play 3 games today", "target": 3, "reward": 10, "type": "daily"},
    {"id": "daily_win_1", "title": "Lucky Break", "description": "Win a game today", "target": 1, "reward": 15, "type": "daily"},
]

WEEKLY_MISSIONS = [
    {"id": "weekly_play_10", "title": "Regular", "description": "Play 10 games this week", "target": 10, "reward": 30, "type": "weekly"},
    {"id": "weekly_win_5", "title": "Winner", "description": "Win 5 games this week", "target": 5, "reward": 50, "type": "weekly"},
    {"id": "weekly_vault_3", "title": "Vault Hunter", "description": "Open 3 Mystery Vaults this week", "target": 3, "reward": 40, "type": "weekly"},
]

SPECIAL_MISSIONS = [
    {"id": "special_first_spin", "title": "First Spin", "description": "Play Royale Spin for the first time", "target": 1, "reward": 20, "type": "special"},
    {"id": "special_first_scratch", "title": "Scratch Master", "description": "Play Scratch Royale for the first time", "target": 1, "reward": 20, "type": "special"},
]


def _calc_progress(user: User, mission_id: str, db: Session) -> int:
    """Calculate current progress for a mission based on actual game data"""
    today = date.today()

    if mission_id == "daily_play_1" or mission_id == "daily_play_3":
        target = 1 if mission_id == "daily_play_1" else 3
        count = db.query(GamePlay).filter(
            GamePlay.user_id == user.id,
            GamePlay.created_at >= datetime.combine(today, datetime.min.time()),
        ).count()
        return min(count, target)

    elif mission_id == "daily_win_1":
        count = db.query(GamePlay).filter(
            GamePlay.user_id == user.id,
            GamePlay.outcome == "win",
            GamePlay.created_at >= datetime.combine(today, datetime.min.time()),
        ).count()
        return min(count, 1)

    elif mission_id == "weekly_play_10":
        from datetime import timedelta
        week_start = datetime.combine(today - __import__('datetime').timedelta(days=today.weekday()), datetime.min.time())
        count = db.query(GamePlay).filter(
            GamePlay.user_id == user.id,
            GamePlay.created_at >= week_start,
        ).count()
        return min(count, 10)

    elif mission_id == "weekly_win_5":
        from datetime import timedelta
        week_start = datetime.combine(today - __import__('datetime').timedelta(days=today.weekday()), datetime.min.time())
        count = db.query(GamePlay).filter(
            GamePlay.user_id == user.id,
            GamePlay.outcome == "win",
            GamePlay.created_at >= week_start,
        ).count()
        return min(count, 5)

    elif mission_id == "weekly_vault_3":
        from datetime import timedelta
        week_start = datetime.combine(today - __import__('datetime').timedelta(days=today.weekday()), datetime.min.time())
        count = db.query(GamePlay).filter(
            GamePlay.user_id == user.id,
            GamePlay.game_key == "mystery-vault",
            GamePlay.created_at >= week_start,
        ).count()
        return min(count, 3)

    elif mission_id == "special_first_spin":
        count = db.query(GamePlay).filter(
            GamePlay.user_id == user.id,
            GamePlay.game_key == "royale-spin",
        ).count()
        return min(count, 1)

    elif mission_id == "special_first_scratch":
        count = db.query(GamePlay).filter(
            GamePlay.user_id == user.id,
            GamePlay.game_key == "scratch-royale",
        ).count()
        return min(count, 1)

    return 0


@router.get("")
def get_missions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all missions with current progress"""
    all_missions = DAILY_MISSIONS + WEEKLY_MISSIONS + SPECIAL_MISSIONS
    result = []

    for m in all_missions:
        progress = _calc_progress(current_user, m["id"], db)
        completed = progress >= m["target"]
        result.append({
            **m,
            "progress": progress,
            "completed": completed,
            "claimed": False,  # TODO: persist claimed state in DB
        })

    return {"missions": result}


@router.post("/{mission_id}/claim")
def claim_mission(
    mission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Claim a completed mission reward"""
    all_missions = DAILY_MISSIONS + WEEKLY_MISSIONS + SPECIAL_MISSIONS
    mission = next((m for m in all_missions if m["id"] == mission_id), None)

    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    progress = _calc_progress(current_user, mission_id, db)
    if progress < mission["target"]:
        raise HTTPException(status_code=400, detail="Mission not yet completed")

    # Grant reward
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    balance_before = wallet.balance
    wallet.balance += mission["reward"]
    wallet.lifetime_earned += mission["reward"]

    reward_tx = CreditTransaction(
        user_id=current_user.id,
        transaction_type="MISSION_REWARD",
        amount=float(mission["reward"]),
        description=f"Mission reward: {mission['title']}",
        reference_id=mission_id,
        balance_before=balance_before,
        balance_after=wallet.balance,
        status="completed",
    )
    db.add(reward_tx)
    db.commit()

    return {
        "message": f"Reward claimed! +{mission['reward']} Mini Credits",
        "credits_awarded": mission["reward"],
        "new_balance": wallet.balance,
    }
