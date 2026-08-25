import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_database
from backend.app.routes import chat, webhook, properties, viewings, dashboard

# Create tables
Base.metadata.create_all(bind=engine)

# Seed database with Exeter HMO inventory on startup
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="24/7 Autonomous AI Lettings Agent & Booking Suite for Exeter Student Housing",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(chat.router)
app.include_router(webhook.router)
app.include_router(properties.router)
app.include_router(viewings.router)
app.include_router(dashboard.router)

# Mount Static Files for Demo & Simulator
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def serve_root():
    """Serve the interactive Agency Pitch Simulator & Dashboard."""
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "LettingsPulse Exeter API is running. Open /docs for API documentation."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME, "location": "Exeter, UK"}
