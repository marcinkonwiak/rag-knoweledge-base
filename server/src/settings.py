from dotenv import load_dotenv
from pydantic import AnyHttpUrl, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    DATABASE_URL: str = ""
    BACKEND_CORS_ORIGINS: list[str | AnyHttpUrl] = [
        "http://localhost:8000",
        "http://localhost:5173",
    ]
    GEMINI_API_KEY: str = ""
    LOGFIRE_TOKEN: str = ""

    OPENAPI_CLIENT_ID: str = ""
    APP_CLIENT_ID: str = ""
    TENANT_ID: str = ""
    SCOPE_DESCRIPTION: str = "user_impersonation"
    AZURE_SPEECH_KEY: str = ""
    AZURE_SPEECH_REGION: str = ""

    @computed_field
    @property
    def SCOPE_NAME(self) -> str:
        return f"api://{self.APP_CLIENT_ID}/{self.SCOPE_DESCRIPTION}"

    @computed_field
    @property
    def SCOPES(self) -> dict[str, str]:
        return {
            self.SCOPE_NAME: self.SCOPE_DESCRIPTION,
        }

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()
