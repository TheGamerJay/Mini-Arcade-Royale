"""Email service using Resend"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import logging
from app.database import get_db
from app.config import get_settings
from app.models import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/emails", tags=["emails"])

settings = get_settings()

try:
    from resend import Resend
    if settings.resend_api_key:
        client = Resend(api_key=settings.resend_api_key)
    else:
        client = None
except ImportError:
    logger.warning("Resend SDK not installed - email features disabled")
    client = None


def send_email(to: str, subject: str, html: str, text: str = None):
    """Send email via Resend"""
    if not client:
        logger.warning(f"Email not sent (Resend not configured): {to} - {subject}")
        return None
    
    try:
        response = client.emails.send({
            "from": "Mini Arcade Royale <noreply@mini-arcade-royale.com>",
            "to": to,
            "subject": subject,
            "html": html,
            "text": text or subject,
        })
        logger.info(f"Email sent: {response}")
        return response
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return None


def send_verification_email(user: User, verification_token: str):
    """Send email verification link"""
    verification_url = f"https://mini-arcade-royale.com/verify?token={verification_token}"
    
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 30px; border-radius: 8px;">
                <h1 style="color: #FF006E; margin-bottom: 20px;">Verify Your Email</h1>
                <p>Hi {user.username},</p>
                <p>Welcome to Mini Arcade Royale! Please verify your email by clicking the button below:</p>
                <a href="{verification_url}" style="display: inline-block; background: #FF006E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Verify Email
                </a>
                <p>Or copy this link into your browser:</p>
                <p style="word-break: break-all; color: #888;">{verification_url}</p>
                <p>This link expires in 24 hours.</p>
                <p>If you didn't create this account, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #444; margin: 30px 0;">
                <p style="color: #888; font-size: 12px;">© 2026 Mini Arcade Royale. All rights reserved.</p>
            </div>
        </body>
    </html>
    """
    
    return send_email(
        to=user.email,
        subject="Verify Your Mini Arcade Royale Account",
        html=html
    )


def send_password_reset_email(user: User, reset_token: str):
    """Send password reset link"""
    reset_url = f"https://mini-arcade-royale.com/reset-password?token={reset_token}"
    
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 30px; border-radius: 8px;">
                <h1 style="color: #FF006E; margin-bottom: 20px;">Reset Your Password</h1>
                <p>Hi {user.username},</p>
                <p>We received a request to reset your password. Click the button below to set a new password:</p>
                <a href="{reset_url}" style="display: inline-block; background: #FF006E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Reset Password
                </a>
                <p>This link expires in 1 hour.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #444; margin: 30px 0;">
                <p style="color: #888; font-size: 12px;">© 2026 Mini Arcade Royale. All rights reserved.</p>
            </div>
        </body>
    </html>
    """
    
    return send_email(
        to=user.email,
        subject="Reset Your Mini Arcade Royale Password",
        html=html
    )


def send_purchase_receipt_email(user: User, package_name: str, credits: int, cost: float):
    """Send purchase receipt email"""
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 30px; border-radius: 8px;">
                <h1 style="color: #FFBE0B; margin-bottom: 20px;">Receipt</h1>
                <p>Hi {user.username},</p>
                <p>Thank you for your purchase!</p>
                <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #444;">
                        <td style="padding: 10px;">Package</td>
                        <td style="padding: 10px; text-align: right;">{package_name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #444;">
                        <td style="padding: 10px;">Credits</td>
                        <td style="padding: 10px; text-align: right;">{credits}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold;">Total</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold; color: #FFBE0B;">${cost:.2f}</td>
                    </tr>
                </table>
                <p>Your credits have been added to your account.</p>
                <a href="https://mini-arcade-royale.com/dashboard" style="display: inline-block; background: #FF006E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Go to Dashboard
                </a>
                <hr style="border: none; border-top: 1px solid #444; margin: 30px 0;">
                <p style="color: #888; font-size: 12px;">© 2026 Mini Arcade Royale. All rights reserved.</p>
            </div>
        </body>
    </html>
    """
    
    return send_email(
        to=user.email,
        subject=f"Receipt: {package_name} Purchase",
        html=html
    )


@router.post("/send-verification")
def trigger_verification_email(user_id: int, db: Session = Depends(get_db)):
    """Manually trigger verification email"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # In production, generate a proper verification token
    verification_token = f"verify_{user_id}_token"
    result = send_verification_email(user, verification_token)
    
    return {
        "sent": result is not None,
        "email": user.email,
    }


@router.post("/send-password-reset")
def trigger_password_reset_email(email: str, db: Session = Depends(get_db)):
    """Send password reset email"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal if email exists
        return {"sent": True, "email": email}
    
    # In production, generate a proper reset token
    reset_token = f"reset_{user.id}_token"
    result = send_password_reset_email(user, reset_token)
    
    return {
        "sent": result is not None,
        "email": user.email,
    }
