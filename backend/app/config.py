"""
Application configuration using environment variables.
All secrets must be set in a .env file (never hardcoded).
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # LLM (optional — app works without this)
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai")  # openai | anthropic

    # App
    APP_ENV: str = os.getenv("APP_ENV", "development")
    ALLOWED_ORIGINS: list = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")


settings = Settings()
