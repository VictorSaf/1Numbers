"""Application configuration from environment variables."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""

    # FastAPI
    app_name: str = "1Numbers"
    app_version: str = "2.0.0"
    fastapi_host: str = "0.0.0.0"
    fastapi_port: int = 8000
    fastapi_reload: bool = True
    debug: bool = True

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "mistral-nemo"
    ollama_embedding_model: str = "nomic-embed-text"
    ollama_timeout: int = 120

    # Database
    database_url: str = "postgresql://numerology_user:secure_password@localhost:5432/numerology"
    database_pool_size: int = 5
    database_max_overflow: int = 10
    database_echo: bool = False

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_ttl: int = 86400  # 24 hours

    # Weaviate
    weaviate_url: str = "http://localhost:8080"
    weaviate_grpc_url: str = "localhost:50051"

    # Security
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Logging
    log_level: str = "INFO"
    log_format: str = "json"

    # LangSmith (optional)
    langsmith_tracing: bool = False
    langchain_tracing_v2: bool = False
    langchain_api_key: str = ""

    # Environment
    environment: str = "development"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment == "development"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
