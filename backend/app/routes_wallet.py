"""Wallet and credit management routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CreditWallet, CreditTransaction
from app.schemas import CreditWalletResponse, CreditTransactionResponse

router = APIRouter(prefix="/api/v1/wallet", tags=["wallet"])


@router.get("/balance", response_model=CreditWalletResponse)
def get_balance(user_id: int, db: Session = Depends(get_db)):
    """Get user's credit balance"""
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet


@router.get("/transactions")
def get_transactions(user_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Get user's transaction history"""
    transactions = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == user_id
    ).order_by(CreditTransaction.created_at.desc()).offset(skip).limit(limit).all()
    
    total = db.query(CreditTransaction).filter(CreditTransaction.user_id == user_id).count()
    
    return {
        "total": total,
        "transactions": [CreditTransactionResponse.from_orm(t) for t in transactions]
    }


@router.get("/stats")
def get_wallet_stats(user_id: int, db: Session = Depends(get_db)):
    """Get wallet statistics"""
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Calculate stats
    transactions = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == user_id
    ).all()
    
    total_deposited = sum(t.amount for t in transactions if t.amount > 0 and t.transaction_type == "purchase")
    total_spent = sum(abs(t.amount) for t in transactions if t.amount < 0 and t.transaction_type == "game_bet")
    total_won = sum(t.amount for t in transactions if t.amount > 0 and t.transaction_type == "game_payout")
    
    return {
        "current_balance": wallet.balance,
        "lifetime_earned": wallet.lifetime_earned,
        "lifetime_spent": wallet.lifetime_spent,
        "total_deposited": total_deposited,
        "total_won": total_won,
        "num_transactions": len(transactions),
    }
