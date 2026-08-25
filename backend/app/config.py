import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "LettingsPulse Exeter")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lettingspulse.db")
    
    # LLM API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Agency Default Config
    DEFAULT_AGENCY_NAME: str = os.getenv("DEFAULT_AGENCY_NAME", "Students@Cardens")
    DEFAULT_AGENCY_SLUG: str = os.getenv("DEFAULT_AGENCY_SLUG", "cardens-exeter")
    DEFAULT_AGENCY_PHONE: str = os.getenv("DEFAULT_AGENCY_PHONE", "+441392000000")
    DEFAULT_AGENCY_EMAIL: str = os.getenv("DEFAULT_AGENCY_EMAIL", "lettings@cardensestateagents.co.uk")
    DEFAULT_CALENDAR_URL: str = os.getenv("DEFAULT_CALENDAR_URL", "https://cal.com/cardens-exeter/student-viewing")
    
    # Twilio / WhatsApp
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_NUMBER: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

settings = Settings()
