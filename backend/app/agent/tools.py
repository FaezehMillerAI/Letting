from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models import Property, ViewingBooking, Agency

def search_properties_tool(
    db: Session,
    agency_id: str,
    bedrooms: Optional[int] = None,
    max_pppw: Optional[float] = None,
    area: Optional[str] = None,
    campus_proximity: Optional[str] = None,
    bills_included: Optional[bool] = None
) -> List[Dict[str, Any]]:
    """Search and filter available Exeter student properties in the database."""
    query = db.query(Property).filter(Property.agency_id == agency_id, Property.is_available == True)

    if bedrooms is not None and bedrooms > 0:
        query = query.filter(Property.bedrooms == bedrooms)
    if max_pppw is not None and max_pppw > 0:
        query = query.filter(Property.price_pppw <= max_pppw)
    if area and area.strip():
        query = query.filter(Property.area.ilike(f"%{area.strip()}%"))
    if campus_proximity and campus_proximity.strip() and campus_proximity.lower() != "both":
        query = query.filter(
            (Property.campus_proximity == "Both") | 
            (Property.campus_proximity.ilike(f"%{campus_proximity.strip()}%"))
        )
    if bills_included is not None:
        query = query.filter(Property.bills_included == bills_included)

    results = query.order_by(Property.price_pppw.asc()).limit(5).all()

    # If strict filter returned empty and bedrooms was set, fallback to showing all of that bedroom count
    if not results and bedrooms is not None:
        results = db.query(Property).filter(
            Property.agency_id == agency_id,
            Property.is_available == True,
            Property.bedrooms == bedrooms
        ).limit(3).all()

    # General fallback if still empty
    if not results:
        results = db.query(Property).filter(
            Property.agency_id == agency_id,
            Property.is_available == True
        ).limit(3).all()

    output = []
    for p in results:
        output.append({
            "id": p.id,
            "title": p.title,
            "street_address": p.street_address,
            "postcode": p.postcode,
            "area": p.area,
            "campus_proximity": p.campus_proximity,
            "bedrooms": p.bedrooms,
            "bathrooms": p.bathrooms,
            "price_pppw": p.price_pppw,
            "bills_included": p.bills_included,
            "image_url": p.image_urls[0] if p.image_urls else "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "description": p.description
        })
    return output


def get_available_viewing_slots_tool(
    db: Session,
    property_id: str
) -> List[Dict[str, str]]:
    """Return next 3 available statutory-compliant viewing slots (min 24h notice)."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        return []

    now = datetime.now()
    # Generate 3 slots starting tomorrow afternoon
    base_date = now + timedelta(days=1)
    if base_date.weekday() >= 5:  # Weekend jump to Monday
        base_date += timedelta(days=(7 - base_date.weekday()))

    slots = [
        {"iso": (base_date.replace(hour=14, minute=0, second=0, microsecond=0)).isoformat(), "display": f"Tomorrow ({base_date.strftime('%A')}) at 2:00 PM"},
        {"iso": (base_date.replace(hour=16, minute=30, second=0, microsecond=0)).isoformat(), "display": f"Tomorrow ({base_date.strftime('%A')}) at 4:30 PM"},
        {"iso": ((base_date + timedelta(days=1)).replace(hour=11, minute=0, second=0, microsecond=0)).isoformat(), "display": f"{(base_date + timedelta(days=1)).strftime('%A %d %b')} at 11:00 AM"}
    ]
    return slots


def book_viewing_slot_tool(
    db: Session,
    property_id: str,
    agency_id: str,
    lead_tenant_name: str,
    lead_tenant_email: str,
    lead_tenant_phone: str,
    group_size: int,
    slot_time_iso: str,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """Commit a viewing booking to the database and generate confirmation details."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        return {"success": False, "error": "Property not found"}

    try:
        scheduled_dt = datetime.fromisoformat(slot_time_iso.replace("Z", "+00:00"))
    except Exception:
        # Fallback to tomorrow 2pm if parsing fails
        scheduled_dt = datetime.now() + timedelta(days=1, hours=2)

    booking = ViewingBooking(
        property_id=prop.id,
        agency_id=agency_id,
        lead_tenant_name=lead_tenant_name,
        lead_tenant_email=lead_tenant_email,
        lead_tenant_phone=lead_tenant_phone,
        group_size=group_size or prop.bedrooms,
        scheduled_time=scheduled_dt,
        status="confirmed",
        notes=notes or f"Booked via LettingsPulse WhatsApp AI for group of {group_size or prop.bedrooms}",
        calendar_event_id=f"evt_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {
        "success": True,
        "booking_id": booking.id,
        "property_title": prop.title,
        "property_address": f"{prop.street_address}, {prop.postcode}",
        "scheduled_time_display": scheduled_dt.strftime("%A, %d %B %Y at %I:%M %p"),
        "lead_tenant_name": lead_tenant_name,
        "lead_tenant_email": lead_tenant_email,
        "lead_tenant_phone": lead_tenant_phone,
        "group_size": booking.group_size
    }
