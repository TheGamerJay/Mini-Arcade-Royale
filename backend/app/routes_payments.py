"""Stripe payment integration"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
import stripe
from app.database import get_db
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/payments", tags=["payments"])

settings = get_settings()

# Initialize Stripe
if settings.stripe_secret_key:
    stripe.api_key = settings.stripe_secret_key


class CreatePaymentIntentRequest(BaseModel):
    """Create Stripe payment intent"""
    package_id: str
    amount_cents: int


class CompletePaymentRequest(BaseModel):
    """Complete payment after client-side confirmation"""
    payment_intent_id: str
    package_id: str


@router.post("/intent")
def create_payment_intent(request: CreatePaymentIntentRequest, user_id: int, db: Session = Depends(get_db)):
    """Create Stripe payment intent"""
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    try:
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=request.amount_cents,
            currency="usd",
            metadata={
                "user_id": user_id,
                "package_id": request.package_id,
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
        }
    except stripe.error.CardError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail="Payment processing error")


@router.post("/confirm")
def confirm_payment(confirm: CompletePaymentRequest, user_id: int, db: Session = Depends(get_db)):
    """Confirm payment and redeem credits"""
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    try:
        # Retrieve payment intent
        intent = stripe.PaymentIntent.retrieve(confirm.payment_intent_id)
        
        if intent.status != "succeeded":
            raise HTTPException(status_code=400, detail="Payment not completed")
        
        if int(intent.metadata["user_id"]) != user_id:
            raise HTTPException(status_code=403, detail="Payment user mismatch")
        
        # Redeem credits via store endpoint
        # (In production, call the redemption logic here)
        from app.routes_store import redeem_credits
        result = redeem_credits(intent.metadata["package_id"], user_id, db)
        
        return result
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail="Payment processing error")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=400, detail="Webhook not configured")
    
    try:
        event = stripe.Webhook.construct_event(
            await request.body(),
            request.headers.get("stripe-signature"),
            settings.stripe_webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle different event types
    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        logger.info(f"Payment succeeded: {intent.id}")
        # Update database here
    
    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]
        logger.warning(f"Payment failed: {intent.id}")
    
    return {"processed": True}


@router.get("/status/{payment_intent_id}")
def get_payment_status(payment_intent_id: str):
    """Get payment intent status"""
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return {
            "id": intent.id,
            "status": intent.status,
            "amount": intent.amount,
            "currency": intent.currency,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving payment")
