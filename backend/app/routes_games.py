"""Game routes for playing games, betting, and payouts"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
from app.database import get_db
from app.models import User, GamePlay, CreditTransaction, CreditWallet
from app.schemas import CreditTransactionResponse
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/v1/games", tags=["games"])


class PlaceBetRequest(BaseModel):
    """Bet placement request"""
    game_key: str
    bet_amount: float


class GameOutcomeRequest(BaseModel):
    """Game outcome submission"""
    game_key: str
    bet_amount: float
    multiplier: float
    outcome: str  # "win", "loss", "tie"


class GameResponse(BaseModel):
    """Game response with credits"""
    game_id: int
    status: str
    balance: float


@router.post("/bet", response_model=GameResponse)
def place_bet(bet: PlaceBetRequest, user_id: int, db: Session = Depends(get_db)):
    """Place a bet on a game"""
    # For now, we'll use a hardcoded user_id. In production, extract from JWT token
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    if wallet.balance < bet.bet_amount:
        raise HTTPException(status_code=400, detail="Insufficient credits")
    
    # Deduct bet from wallet
    wallet.balance -= bet.bet_amount
    wallet.lifetime_spent += bet.bet_amount
    
    # Record as pending transaction
    transaction = CreditTransaction(
        user_id=user_id,
        transaction_type="game_bet",
        amount=-bet.bet_amount,
        description=f"Bet placed on {bet.game_key}",
        balance_before=wallet.balance + bet.bet_amount,
        balance_after=wallet.balance,
        status="completed",
    )
    
    # Create game play record
    gameplay = GamePlay(
        user_id=user_id,
        game_key=bet.game_key,
        bet_amount=bet.bet_amount,
        payout_amount=0,
        outcome="pending",
    )
    
    db.add(transaction)
    db.add(gameplay)
    db.commit()
    db.refresh(gameplay)
    
    return GameResponse(
        game_id=gameplay.id,
        status="bet_placed",
        balance=wallet.balance,
    )


@router.post("/outcome")
def submit_game_outcome(outcome: GameOutcomeRequest, user_id: int, db: Session = Depends(get_db)):
    """Submit game outcome and calculate payout"""
    # Find game play record (in production, verify the game_id from request)
    gameplay = db.query(GamePlay).filter(
        GamePlay.user_id == user_id,
        GamePlay.game_key == outcome.game_key,
    ).order_by(GamePlay.created_at.desc()).first()
    
    if not gameplay:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if gameplay.outcome != "pending":
        raise HTTPException(status_code=400, detail="Game already completed")
    
    # Calculate payout
    payout = 0.0
    if outcome.outcome == "win":
        payout = outcome.bet_amount * outcome.multiplier
    
    # Update wallet
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == user_id).first()
    wallet.balance += payout
    if payout > 0:
        wallet.lifetime_earned += payout
    
    # Update game play record
    gameplay.payout_amount = payout
    gameplay.multiplier = outcome.multiplier
    gameplay.outcome = outcome.outcome
    gameplay.completed_at = datetime.utcnow()
    
    # Record payout transaction
    if payout > 0:
        transaction = CreditTransaction(
            user_id=user_id,
            transaction_type="game_payout",
            amount=payout,
            description=f"Payout from {outcome.game_key} (x{outcome.multiplier})",
            reference_id=str(gameplay.id),
            balance_before=wallet.balance - payout,
            balance_after=wallet.balance,
            status="completed",
        )
        db.add(transaction)
    
    db.commit()
    db.refresh(wallet)
    
    return {
        "game_id": gameplay.id,
        "outcome": outcome.outcome,
        "payout": payout,
        "new_balance": wallet.balance,
    }


@router.get("/history")
def game_history(user_id: int, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get user's game history"""
    games = db.query(GamePlay).filter(
        GamePlay.user_id == user_id
    ).order_by(GamePlay.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": db.query(GamePlay).filter(GamePlay.user_id == user_id).count(),
        "games": [
            {
                "id": g.id,
                "game_key": g.game_key,
                "bet_amount": g.bet_amount,
                "payout_amount": g.payout_amount,
                "multiplier": g.multiplier,
                "outcome": g.outcome,
                "created_at": g.created_at.isoformat(),
            }
            for g in games
        ]
    }
