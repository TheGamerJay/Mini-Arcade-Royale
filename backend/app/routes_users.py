"""User profile and settings routes"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import base64
from app.database import get_db
from app.models import User
from app.schemas import UserResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/users", tags=["users"])

# Avatar stored as base64 data URL directly in Postgres —
# no filesystem dependency, survives Railway deploys.
ALLOWED_AVATAR_TYPES = {
    "image/png":  "png",
    "image/jpeg": "jpeg",
    "image/gif":  "gif",
    "image/webp": "webp",
    "video/mp4":  "mp4",
}
MAX_AVATAR_BYTES = 8 * 1024 * 1024   # 8 MB — base64 inflates ~33%, keeps DB sane
MAX_VIDEO_BYTES  = 8 * 1024 * 1024   # same limit for MP4 previews


class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
def update_profile(
    update: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile"""
    if update.username is not None and update.username != current_user.username:
        existing = db.query(User).filter(User.username == update.username).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = update.username

    if update.display_name is not None:
        current_user.display_name = update.display_name

    if update.avatar_url is not None:
        current_user.avatar_url = update.avatar_url

    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload profile avatar — stored as base64 data URL in Postgres.
    Supported: PNG, JPG, JPEG, GIF, WebP, MP4. Max 8 MB per file.
    No external storage needed — works on Railway across deploys.
    """
    mime = file.content_type or ""
    if mime not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Allowed: PNG, JPG, JPEG, GIF, WebP, MP4",
        )

    content = await file.read()
    limit = MAX_VIDEO_BYTES if mime == "video/mp4" else MAX_AVATAR_BYTES
    if len(content) > limit:
        mb = limit // (1024 * 1024)
        raise HTTPException(status_code=400, detail=f"File too large. Maximum is {mb} MB.")

    # Encode as base64 data URL — stored in the avatar_url column
    b64 = base64.b64encode(content).decode("utf-8")
    data_url = f"data:{mime};base64,{b64}"

    current_user.avatar_url = data_url
    current_user.updated_at = datetime.utcnow()
    db.commit()

    # Return just the mime type confirmation, not the full data URL (too large for JSON log)
    return {"avatar_url": data_url, "message": "Avatar updated"}


@router.get("/profile/{username}", response_model=UserResponse)
def get_user_profile(username: str, db: Session = Depends(get_db)):
    """Get public user profile by username"""
    user = db.query(User).filter(User.username == username, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)
