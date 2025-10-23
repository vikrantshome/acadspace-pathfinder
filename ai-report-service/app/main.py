from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from .api.endpoints import router as api_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Report Generation Service",
    description="Microservice for generating AI-powered career reports",
    version="1.0.0"
)

# Add CORS middleware for Java backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    return {"status": "healthy", "service": "ai-report-service"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AI Report Generation Service is running"}
