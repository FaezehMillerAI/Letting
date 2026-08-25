from fastapi import APIRouter, Depends, Form, Response
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.agent.core import LettingsAgent

router = APIRouter(prefix="/api/webhook", tags=["Webhook"])

@router.post("/whatsapp")
async def handle_whatsapp_webhook(
    Body: str = Form(default=""),
    From: str = Form(default=""),
    To: str = Form(default=""),
    db: Session = Depends(get_db)
):
    """Twilio WhatsApp Inbound Webhook Handler."""
    sender_phone = From.replace("whatsapp:", "").strip()
    message_text = Body.strip()

    agent = LettingsAgent(db=db, agency_slug="cardens-exeter")
    result = agent.process_message(
        sender_id=sender_phone,
        message_text=message_text,
        channel="whatsapp"
    )

    reply_text = result["reply"]

    # Generate Twilio XML response
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{reply_text}</Message>
</Response>"""

    return Response(content=twiml_response, media_type="application/xml")
