"""FastAPI application factory and main entry point"""
import logging
import sys
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

settings = get_settings()

logger.info(f"Starting {settings.app_name} v{settings.app_version}")
logger.info(f"Environment: {settings.app_env}")


# Startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    # Startup
    logger.info(f"✓ Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"✓ Environment: {settings.app_env}")
    logger.info(f"✓ Listening on {settings.host}:{settings.port}")
    
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
    
    # Trusted Host middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "mini-arcade-royale-production.up.railway.app"]
    )
    
    # Health check endpoint
    @app.get("/api/health")
    async def health_check():
        """Health check endpoint for load balancers and monitoring"""
        logger.info("Health check request received")
        return {
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "version": settings.app_version,
            "environment": settings.app_env,
        }
    
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
