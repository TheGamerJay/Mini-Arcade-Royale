"""FastAPI application factory and main entry point"""
import logging
import sys
import traceback
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Configure logging first - ensure it goes to stdout for container visibility
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    stream=sys.stdout,
    force=True
)
logger = logging.getLogger(__name__)

# Load settings
try:
    from app.config import get_settings
    settings = get_settings()
    logger.info(f"✓ Configuration loaded: {settings.app_name} v{settings.app_version}")
    logger.info(f"✓ Environment: {settings.app_env}")
except ImportError as e:
    logger.error(f"✗ Import error loading configuration: {e}")
    logger.error(traceback.format_exc())
    raise
except Exception as e:
    logger.error(f"✗ Failed to load configuration: {e}")
    logger.error(traceback.format_exc())
    raise


# Startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    # Startup
    logger.info(f"✓ Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"✓ Environment: {settings.app_env}")
    logger.info(f"✓ Listening on {settings.host}:{settings.port}")
    logger.info(f"✓ Database URL: {settings.database_url[:50]}...")
    
    # Initialize database tables (gracefully skip if not available)
    try:
        from app.database import create_all_tables
        create_all_tables()
        logger.info("✓ Database tables initialized")
    except Exception as e:
        logger.warning(f"⚠ Database initialization deferred: {str(e)[:100]}")
        logger.info("  (Tables will be created on first use or via migrations)")
    
    yield
    
    # Shutdown
    logger.info("✓ Shutting down application")


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Premium digital arcade entertainment platform",
        lifespan=lifespan,
    )
    
    # Health check endpoint (MUST be first and unprotected)
    from app.database import get_db
    
    @app.get("/api/health")
    def health(db=Depends(get_db)):
        try:
            db.execute(text("SELECT 1"))
        except Exception as exc:
            logger.error(f"✗ Database health check failed: {exc}")
            raise HTTPException(status_code=503, detail="Database unavailable")
        return {"status": "ok"}
    
    # CORS middleware
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "https://mini-arcade-royale-production.up.railway.app",
    ]
    if settings.app_env == "production":
        allowed_origins = [
            "https://mini-arcade-royale.com",
            "https://www.mini-arcade-royale.com",
            "https://mini-arcade-royale-production.up.railway.app",
        ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint"""
        return {
            "app": settings.app_name,
            "version": settings.app_version,
            "message": "API is running. Visit /docs for Swagger UI or /redoc for ReDoc.",
            "docs": "/docs",
            "health": "/api/health",
        }
    
    # API v1 routes (placeholder)
    @app.get("/api/v1")
    async def api_v1_root():
        """API v1 root"""
        return {"version": "1.0", "status": "ready"}
    
    # Add security and performance middleware (Phase 11-13)
    from app.middleware import RateLimitMiddleware, SecurityHeadersMiddleware, PerformanceMonitoringMiddleware
    app.add_middleware(PerformanceMonitoringMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=100)
    
    # Include all route modules
    from app.routes_auth import router as auth_router
    from app.routes_users import router as users_router
    from app.routes_wallet import router as wallet_router
    from app.routes_games import router as games_router
    from app.routes_leaderboard import router as leaderboard_router
    from app.routes_store import router as store_router
    from app.routes_payments import router as payments_router
    from app.routes_emails import router as emails_router
    from app.routes_admin import router as admin_router
    from app.routes_content import router as content_router
    from app.routes_analytics import router as analytics_router
    
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(wallet_router)
    app.include_router(games_router)
    app.include_router(leaderboard_router)
    app.include_router(store_router)
    app.include_router(payments_router)
    app.include_router(emails_router)
    app.include_router(admin_router)
    app.include_router(content_router)
    app.include_router(analytics_router)
    
    logger.info("✓ FastAPI application created successfully")
    return app


# Create app instance
try:
    app = create_app()
    logger.info("✓ Application initialized successfully")
except Exception as e:
    logger.error(f"✗ Failed to initialize application: {e}", exc_info=True)
    raise


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting server on {settings.host}:{settings.port}")
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
