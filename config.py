from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/mediaidb"
    SECRET_KEY: str = "changeme-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ML_SERVICE_URL: str = "http://localhost:8001"
    RATE_LIMIT_PER_MINUTE: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
