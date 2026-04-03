"""Test suite for Mini Arcade Royale API"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import create_app
from app.database import Base, get_db

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Create app with testing database
app = create_app()
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


class TestHealth:
    def test_health_check(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
    
    def test_root_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        assert "Mini Arcade Royale" in response.json()["app"]


class TestAuth:
    def test_register_user(self):
        response = client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "SecurePassword123",
        })
        assert response.status_code == 201
        assert "access_token" in response.json()
        assert response.json()["user"]["email"] == "test@example.com"
    
    def test_register_duplicate_email(self):
        # Register first user
        client.post("/api/v1/auth/register", json={
            "email": "dup@example.com",
            "username": "user1",
            "password": "SecurePassword123",
        })
        # Try to register again with same email
        response = client.post("/api/v1/auth/register", json={
            "email": "dup@example.com",
            "username": "user2",
            "password": "SecurePassword123",
        })
        assert response.status_code == 400
    
    def test_login_user(self):
        # Register user first
        client.post("/api/v1/auth/register", json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "SecurePassword123",
        })
        # Login
        response = client.post("/api/v1/auth/login", json={
            "email": "login@example.com",
            "password": "SecurePassword123",
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
    
    def test_login_wrong_password(self):
        response = client.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "WrongPassword",
        })
        assert response.status_code == 401


class TestStore:
    def test_get_credit_packages(self):
        response = client.get("/api/v1/store/packages")
        assert response.status_code == 200
        assert "packages" in response.json()
        assert len(response.json()["packages"]) > 0
    
    def test_get_specific_package(self):
        response = client.get("/api/v1/store/packages/starter")
        assert response.status_code == 200
        assert response.json()["name"] == "Starter Pack"


class TestContent:
    def test_get_all_games(self):
        response = client.get("/api/v1/content/games")
        assert response.status_code == 200
        assert "games" in response.json()
        assert len(response.json()["games"]) > 0
    
    def test_get_specific_game(self):
        response = client.get("/api/v1/content/games/flappy_bird")
        assert response.status_code == 200
        assert response.json()["name"] == "Flappy Bird"


if __name__ == "__main__":
    pytest.main(["-v", __file__])
