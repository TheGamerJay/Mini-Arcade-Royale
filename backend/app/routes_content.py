"""Content management for games and promotions"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db

router = APIRouter(prefix="/api/v1/content", tags=["content"])


class Game(BaseModel):
    """Game content"""
    key: str
    name: str
    description: str
    image_url: str
    category: str
    difficulty: str
    min_bet: float
    max_bet: float
    active: bool = True


# Available games
GAMES = [
    Game(
        key="flappy_bird",
        name="Flappy Bird",
        description="Classic flappy bird game - don't hit the pipes!",
        image_url="/games/flappy-bird.png",
        category="arcade",
        difficulty="medium",
        min_bet=1.0,
        max_bet=100.0,
    ),
    Game(
        key="space_invaders",
        name="Space Invaders",
        description="Defend earth from alien invaders",
        image_url="/games/space-invaders.png",
        category="shooter",
        difficulty="hard",
        min_bet=2.0,
        max_bet=200.0,
    ),
    Game(
        key="pac_man",
        name="Pac Man",
        description="Navigate the maze and collect pellets",
        image_url="/games/pac-man.png",
        category="puzzle",
        difficulty="easy",
        min_bet=0.5,
        max_bet=50.0,
    ),
]


@router.get("/games")
def get_all_games():
    """Get all available games"""
    return {"games": GAMES}


@router.get("/games/{game_key}")
def get_game(game_key: str):
    """Get specific game details"""
    game = next((g for g in GAMES if g.key == game_key), None)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.get("/games/category/{category}")
def get_games_by_category(category: str):
    """Get games by category"""
    games = [g for g in GAMES if g.category == category and g.active]
    return {"category": category, "games": games}
