"""API routes for authentication"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.database import get_db
from app.models import User, CreditWallet
from app.schemas import UserRegister, UserLogin, UserResponse, AuthResponse
from app.auth import hash_password, verify_password, create_access_token
from datetime import timedelta

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        display_name=user_data.display_name,
        password_hash=hashed_password,
        is_verified=False,  # Email verification would happen here
    )
    
    db.add(new_user)
    db.flush()  # Flush to get the user ID
    
    # Create credit wallet for user
    wallet = CreditWallet(user_id=new_user.id, balance=0.0)
    db.add(wallet)
    
    try:
        db.commit()
        db.refresh(new_user)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to a database error. Please try again later.",
        )
    
    # Create JWT token
    access_token = create_access_token(user_id=new_user.id, email=new_user.email)
    
    return AuthResponse(
        user=UserResponse.model_validate(new_user),
        access_token=access_token,
        token_type="bearer",
        expires_in=24 * 3600,  # 24 hours in seconds
    )


@router.post("/login", response_model=AuthResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""

    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create JWT token
    access_token = create_access_token(user_id=user.id, email=user.email)

    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        token_type="bearer",
        expires_in=24 * 3600,  # 24 hours in seconds
    )


@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    """Get current authenticated user (placeholder - needs middleware)"""
    # This is a placeholder. In practice, you'd extract user_id from JWT token via dependency
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated"
    )
