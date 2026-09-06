from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from core.database import engine, Base
from routes import auth, triage, prescriptions, users, reminders
from routes import patients   # NEW

from dotenv import load_dotenv
import os

load_dotenv()

# Create tables (includes new patient_profiles table automatically)
Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="MediAI API",
    description="AI-powered health triage and prescription explanation service",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api")
app.include_router(triage.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(reminders.router, prefix="/api")
app.include_router(patients.router, prefix="/api")   # NEW


@app.get("/")
def root():
    return {"status": "MediAI API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
