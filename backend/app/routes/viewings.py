from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.database import get_db
from backend.app.models import ViewingBooking
from backend.app.schemas import ViewingBookingOut

router = APIRouter(prefix="/api/viewings", tags=["Viewings"])

@router.get("", response_model=List[ViewingBookingOut])
def list_viewings(db: Session = Depends(get_db)):
    """List all scheduled and past student group viewings."""
    return db.query(ViewingBooking).options(joinedload(ViewingBooking.property)).order_by(ViewingBooking.scheduled_time.desc()).all()

@router.post("/{viewing_id}/cancel")
def cancel_viewing(viewing_id: str, db: Session = Depends(get_db)):
    """Cancel a scheduled viewing."""
    booking = db.query(ViewingBooking).filter(ViewingBooking.id == viewing_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Viewing not found")
    booking.status = "cancelled"
    db.commit()
    return {"success": True, "message": "Viewing marked as cancelled"}

@router.post("/{viewing_id}/complete")
def complete_viewing(viewing_id: str, db: Session = Depends(get_db)):
    """Mark a viewing as successfully completed."""
    booking = db.query(ViewingBooking).filter(ViewingBooking.id == viewing_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Viewing not found")
    booking.status = "completed"
    db.commit()
    return {"success": True, "message": "Viewing marked as completed"}
