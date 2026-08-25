from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import ChatMessageIn, ChatMessageOut
from backend.app.agent.core import LettingsAgent

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("/message", response_model=ChatMessageOut)
def handle_chat_message(payload: ChatMessageIn, db: Session = Depends(get_db)):
    """Handle incoming student web chat message."""
    agent = LettingsAgent(db=db, agency_slug=payload.agency_slug or "cardens-exeter")
    response = agent.process_message(
        sender_id=payload.sender_id,
        message_text=payload.message,
        channel=payload.channel
    )
    return response
