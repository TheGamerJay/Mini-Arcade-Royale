"""Store and shop endpoints for buying credits"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import User, CreditWallet, CreditTransaction

router = APIRouter(prefix="/api/v1/store", tags=["store"])


class CreditPackage(BaseModel):
    """Credit package for sale"""
    id: str
    name: str
    credits: float
    price_usd: float
    bonus_credits: float = 0
    description: str


# Available credit packages
CREDIT_PACKAGES = [
    CreditPackage(
        id="starter",
        name="Starter Pack",
        credits=100,
        price_usd=9.99,
        bonus_credits=10,
        description="100 credits + 10 bonus credits",
    ),
    CreditPackage(
        id="player",
        name="Player Pack",
        credits=500,
        price_usd=39.99,
        bonus_credits=75,
        description="500 credits + 75 bonus credits",
    ),
    CreditPackage(
        id="champion",
        name="Champion Pack",
        credits=1000,
        price_usd=69.99,
        bonus_credits=200,
        description="1000 credits + 200 bonus credits",
    ),
    CreditPackage(
        id="legend",
        name="Legend Pack",
        credits=5000,
        price_usd=299.99,
        bonus_credits=1500,
        description="5000 credits + 1500 bonus credits",
    ),
]


@router.get("/packages")
def get_credit_packages():
    """Get all available credit packages"""
    return {
        "packages": CREDIT_PACKAGES
    }


@router.get("/packages/{package_id}")
def get_package(package_id: str):
    """Get specific credit package"""
    package = next((p for p in CREDIT_PACKAGES if p.id == package_id), None)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package


class PurchaseRequest(BaseModel):
    """Credit purchase request"""
    package_id: str
    payment_method: str = "stripe"  # For future expansion


@router.post("/purchase")
def purchase_credits(purchase: PurchaseRequest, user_id: int, db: Session = Depends(get_db)):
    """Initiate credit purchase (create payment intent)"""
    # Find package
    package = next((p for p in CREDIT_PACKAGES if p.id == purchase.package_id), None)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # In a real app, this would create a Stripe payment intent
    # For now, return mock response
    return {
        "purchase_id": f"purchase_{user_id}_{package.id}",
        "package": package,
        "user_id": user_id,
        "status": "pending",
        "next_action": "redirect_to_payment",
        "payment_url": f"https://stripe.example.com/pay/{user_id}",
    }


@router.post("/redeem")
def redeem_credits(package_id: str, user_id: int, db: Session = Depends(get_db)):
    """Redeem credits after successful payment (webhook callback)"""
    # Find package
    package = next((p for p in CREDIT_PACKAGES if p.id == package_id), None)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Get wallet
    wallet = db.query(CreditWallet).filter(CreditWallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Calculate total credits (including bonus)
    total_credits = package.credits + package.bonus_credits
    
    # Update wallet
    wallet.balance += total_credits
    wallet.lifetime_earned += total_credits
    
    # Record transaction
    transaction = CreditTransaction(
        user_id=user_id,
        transaction_type="purchase",
        amount=total_credits,
        description=f"Purchased {package.name} (${package.price_usd})",
        reference_id=package_id,
        balance_before=wallet.balance - total_credits,
        balance_after=wallet.balance,
        status="completed",
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(wallet)
    
    return {
        "success": True,
        "package": package,
        "total_credits_added": total_credits,
        "new_balance": wallet.balance,
        "bonus_credits": package.bonus_credits,
    }


@router.get("/receipts")
def get_purchase_receipts(user_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Get user's purchase history"""
    purchases = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == user_id,
        CreditTransaction.transaction_type == "purchase"
    ).order_by(CreditTransaction.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": db.query(CreditTransaction).filter(
            CreditTransaction.user_id == user_id,
            CreditTransaction.transaction_type == "purchase"
        ).count(),
        "purchases": [
            {
                "id": str(p.id),
                "amount": p.amount,
                "date": p.created_at.isoformat(),
                "description": p.description,
            }
            for p in purchases
        ]
    }
