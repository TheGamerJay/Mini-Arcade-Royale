"""Wallet and credit management routes"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User, CreditWallet, CreditTransaction
from app.schemas import CreditWalletResponse, CreditTransactionResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/wallet", tags=["wallet"])


@router.get("/balance", response_model=CreditWalletResponse)
def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's Mini Credit balance"""
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet


@router.get("/transactions")
def get_transactions(
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
    type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get transaction history with optional type filter and pagination"""
    q = db.query(CreditTransaction).filter(CreditTransaction.user_id == current_user.id)
    if type:
        q = q.filter(CreditTransaction.transaction_type == type)

    total = q.count()
    transactions = q.order_by(CreditTransaction.created_at.desc()).offset(offset).limit(limit).all()
    pages = max(1, -(-total // limit))  # ceiling division

    return {
        "total": total,
        "page": (offset // limit) + 1,
        "pages": pages,
        "transactions": [CreditTransactionResponse.model_validate(t) for t in transactions],
    }


@router.get("/purchases")
def get_purchases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get credit purchase history"""
    purchases = (
        db.query(CreditTransaction)
        .filter(
            CreditTransaction.user_id == current_user.id,
            CreditTransaction.transaction_type == "PURCHASE",
        )
        .order_by(CreditTransaction.created_at.desc())
        .all()
    )

    result = []
    for p in purchases:
        result.append({
            "id": p.id,
            "credits_amount": p.amount,
            "price_usd": 0.0,  # will be populated when Stripe integration is complete
            "status": p.status,
            "stripe_payment_intent_id": p.reference_id,
            "created_at": p.created_at.isoformat(),
            "description": p.description,
        })

    return {"purchases": result}
