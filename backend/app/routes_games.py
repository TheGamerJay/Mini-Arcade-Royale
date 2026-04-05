"""Game routes — server-authoritative outcomes for all three games"""
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime
from app.database import get_db
from app.models import User, GamePlay, CreditTransaction, CreditWallet
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/games", tags=["games"])

# ─── Game limits ──────────────────────────────────────────────────────────────
GAME_CONFIG = {
    "scratch-royale": {"min_bet": 1,  "max_bet": 50},
    "royale-spin":    {"min_bet": 1,  "max_bet": 100},
    "mystery-vault":  {"min_bet": 5,  "max_bet": 200},
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _deduct_bet(wallet, user_id, game_key, bet, db):
    balance_before = wallet.balance
    wallet.balance -= bet
    wallet.lifetime_spent += bet
    tx = CreditTransaction(
        user_id=user_id, transaction_type="GAME_SPEND",
        amount=-bet, description=f"Game play: {game_key}",
        balance_before=balance_before, balance_after=wallet.balance, status="completed",
    )
    db.add(tx)


def _pay_reward(wallet, user_id, game_key, payout, db):
    if payout <= 0:
        return
    balance_before = wallet.balance
    wallet.balance += payout
    wallet.lifetime_earned += payout
    tx = CreditTransaction(
        user_id=user_id, transaction_type="GAME_REWARD",
        amount=payout, description=f"Game win: {game_key}",
        balance_before=balance_before, balance_after=wallet.balance, status="completed",
    )
    db.add(tx)


def _record_play(user_id, game_key, bet, payout, outcome, game_data, db):
    import json
    play = GamePlay(
        user_id=user_id, game_key=game_key,
        bet_amount=bet, payout_amount=payout,
        outcome=outcome, game_data=json.dumps(game_data),
        completed_at=datetime.utcnow(),
    )
    db.add(play)
    return play


# ─── Scratch Royale ───────────────────────────────────────────────────────────

SCRATCH_OUTCOMES = [
    (40, 0.0,  "No match"),
    (25, 1.0,  "Break even"),
    (15, 2.0,  "Double up"),
    (10, 3.0,  "Triple!"),
    (6,  5.0,  "Five times!"),
    (3,  10.0, "10×!"),
    (1,  25.0, "JACKPOT!"),
]


class ScratchPlayRequest(BaseModel):
    bet_amount: float = Field(..., ge=1, le=50)


@router.post("/scratch-royale/play")
def play_scratch_royale(
    req: ScratchPlayRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == current_user.id).first()
    if not wallet or wallet.balance < req.bet_amount:
        raise HTTPException(status_code=400, detail="Insufficient Mini Credits")

    weights = [o[0] for o in SCRATCH_OUTCOMES]
    chosen = random.choices(SCRATCH_OUTCOMES, weights=weights, k=1)[0]
    multiplier, label = chosen[1], chosen[2]
    payout = round(req.bet_amount * multiplier, 2)
    outcome = "win" if payout > req.bet_amount else ("push" if payout == req.bet_amount else "loss")

    symbols = ["💎", "⭐", "🍀", "🔥", "💰", "7️⃣", "🎴"]
    if multiplier == 0:
        grid = [random.choice(symbols[:4]) for _ in range(9)]
    else:
        match_sym = random.choice(symbols)
        grid = [random.choice(symbols) for _ in range(6)] + [match_sym, match_sym, match_sym]
        random.shuffle(grid)

    _deduct_bet(wallet, current_user.id, "scratch-royale", req.bet_amount, db)
    if payout > 0:
        _pay_reward(wallet, current_user.id, "scratch-royale", payout, db)

    play = _record_play(current_user.id, "scratch-royale", req.bet_amount, payout, outcome,
                        {"multiplier": multiplier, "label": label, "grid": grid}, db)
    db.commit()

    return {
        "game_id": play.id, "outcome": outcome,
        "multiplier": multiplier, "label": label,
        "bet_amount": req.bet_amount, "payout_amount": payout,
        "net": payout - req.bet_amount, "grid": grid, "balance": wallet.balance,
    }


# ─── Royale Spin ──────────────────────────────────────────────────────────────

SPIN_SEGMENTS = [
    {"label": "0×",   "multiplier": 0.0,  "color": "#ef4444", "weight": 30},
    {"label": "½×",   "multiplier": 0.5,  "color": "#f97316", "weight": 20},
    {"label": "1×",   "multiplier": 1.0,  "color": "#eab308", "weight": 20},
    {"label": "1.5×", "multiplier": 1.5,  "color": "#22c55e", "weight": 12},
    {"label": "2×",   "multiplier": 2.0,  "color": "#3b82f6", "weight": 10},
    {"label": "3×",   "multiplier": 3.0,  "color": "#8b5cf6", "weight": 5},
    {"label": "5×",   "multiplier": 5.0,  "color": "#ec4899", "weight": 2},
    {"label": "10×",  "multiplier": 10.0, "color": "#00C2FF", "weight": 1},
]


class SpinPlayRequest(BaseModel):
    bet_amount: float = Field(..., ge=1, le=100)


@router.get("/royale-spin/config")
def get_spin_config():
    """Return wheel segment config for the frontend to render the wheel correctly"""
    return {"segments": SPIN_SEGMENTS}


@router.post("/royale-spin/play")
def play_royale_spin(
    req: SpinPlayRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == current_user.id).first()
    if not wallet or wallet.balance < req.bet_amount:
        raise HTTPException(status_code=400, detail="Insufficient Mini Credits")

    weights = [s["weight"] for s in SPIN_SEGMENTS]
    segment = random.choices(SPIN_SEGMENTS, weights=weights, k=1)[0]
    segment_index = SPIN_SEGMENTS.index(segment)
    multiplier = segment["multiplier"]
    payout = round(req.bet_amount * multiplier, 2)
    outcome = "win" if payout > req.bet_amount else ("push" if payout == req.bet_amount else "loss")

    _deduct_bet(wallet, current_user.id, "royale-spin", req.bet_amount, db)
    if payout > 0:
        _pay_reward(wallet, current_user.id, "royale-spin", payout, db)

    play = _record_play(current_user.id, "royale-spin", req.bet_amount, payout, outcome,
                        {"segment_index": segment_index, "multiplier": multiplier}, db)
    db.commit()

    return {
        "game_id": play.id, "outcome": outcome,
        "segment_index": segment_index, "segment": segment,
        "bet_amount": req.bet_amount, "payout_amount": payout,
        "net": payout - req.bet_amount, "balance": wallet.balance,
    }


# ─── Mystery Vault ────────────────────────────────────────────────────────────

VAULT_TIERS = [
    {"rarity": "common",    "label": "Common Find",    "multiplier": 0.5,  "weight": 40, "color": "#6b7280"},
    {"rarity": "common",    "label": "Break Even",     "multiplier": 1.0,  "weight": 25, "color": "#6b7280"},
    {"rarity": "uncommon",  "label": "Small Treasure", "multiplier": 1.5,  "weight": 15, "color": "#22c55e"},
    {"rarity": "rare",      "label": "Rare Find!",     "multiplier": 2.5,  "weight": 10, "color": "#3b82f6"},
    {"rarity": "epic",      "label": "Epic Vault!",    "multiplier": 5.0,  "weight": 7,  "color": "#8b5cf6"},
    {"rarity": "legendary", "label": "LEGENDARY!",     "multiplier": 15.0, "weight": 3,  "color": "#f59e0b"},
]


class VaultPlayRequest(BaseModel):
    bet_amount: float = Field(..., ge=5, le=200)


@router.post("/mystery-vault/play")
def play_mystery_vault(
    req: VaultPlayRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == current_user.id).first()
    if not wallet or wallet.balance < req.bet_amount:
        raise HTTPException(status_code=400, detail="Insufficient Mini Credits")

    weights = [t["weight"] for t in VAULT_TIERS]
    tier = random.choices(VAULT_TIERS, weights=weights, k=1)[0]
    payout = round(req.bet_amount * tier["multiplier"], 2)
    outcome = "win" if payout > req.bet_amount else ("push" if payout == req.bet_amount else "loss")

    _deduct_bet(wallet, current_user.id, "mystery-vault", req.bet_amount, db)
    if payout > 0:
        _pay_reward(wallet, current_user.id, "mystery-vault", payout, db)

    play = _record_play(current_user.id, "mystery-vault", req.bet_amount, payout, outcome,
                        {"rarity": tier["rarity"], "multiplier": tier["multiplier"]}, db)
    db.commit()

    return {
        "game_id": play.id, "outcome": outcome,
        "rarity": tier["rarity"], "label": tier["label"], "color": tier["color"],
        "multiplier": tier["multiplier"],
        "bet_amount": req.bet_amount, "payout_amount": payout,
        "net": payout - req.bet_amount, "balance": wallet.balance,
    }
