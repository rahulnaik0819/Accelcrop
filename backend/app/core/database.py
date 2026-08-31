import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Retrieve database connection string from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./agrivision.db"
)

# Fix for hosted providers (Render, Heroku, Supabase, Neon) using legacy 'postgres://' schema
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure engine arguments based on database dialect
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator:
    """
    FastAPI dependency yielding a SQLAlchemy session.
    Automatically closes the session after request execution.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
