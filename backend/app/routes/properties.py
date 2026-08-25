from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Property, Agency
from backend.app.schemas import PropertyOut, PropertyCreate

router = APIRouter(prefix="/api/properties", tags=["Properties"])

@router.get("", response_model=List[PropertyOut])
def list_properties(
    bedrooms: Optional[int] = Query(None),
    area: Optional[str] = Query(None),
    max_pppw: Optional[float] = Query(None),
    campus: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List all student HMO properties with optional filtering."""
    query = db.query(Property)
    if bedrooms:
        query = query.filter(Property.bedrooms == bedrooms)
    if area:
        query = query.filter(Property.area.ilike(f"%{area}%"))
    if max_pppw:
        query = query.filter(Property.price_pppw <= max_pppw)
    if campus and campus.lower() != "both":
        query = query.filter((Property.campus_proximity == "Both") | (Property.campus_proximity.ilike(f"%{campus}%")))
    
    return query.order_by(Property.price_pppw.asc()).all()

@router.get("/{property_id}", response_model=PropertyOut)
def get_property(property_id: str, db: Session = Depends(get_db)):
    """Get single property details."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop

@router.post("", response_model=PropertyOut)
def create_property(payload: PropertyCreate, db: Session = Depends(get_db)):
    """Add a new student property to the agency portfolio."""
    agency = db.query(Agency).first()
    if not agency:
        raise HTTPException(status_code=400, detail="No active agency configured")
    
    prop = Property(
        agency_id=agency.id,
        **payload.model_dump(exclude={"agency_id"})
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop
