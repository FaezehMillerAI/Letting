from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Property Schemas
class PropertyBase(BaseModel):
    title: str
    street_address: str
    postcode: str
    area: str
    campus_proximity: str = "Streatham"
    bedrooms: int
    bathrooms: int = 2
    price_pppw: float
    bills_included: bool = True
    tenancy_length_weeks: int = 48
    is_available: bool = True
    image_urls: List[str] = []
    virtual_tour_url: Optional[str] = None
    description: Optional[str] = None

class PropertyCreate(PropertyBase):
    agency_id: Optional[str] = None

class PropertyOut(PropertyBase):
    id: str
    agency_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class PropertyFilter(BaseModel):
    bedrooms: Optional[int] = None
    max_pppw: Optional[float] = None
    area: Optional[str] = None
    campus_proximity: Optional[str] = None
    bills_included: Optional[bool] = None

# Viewing Schemas
class ViewingBookingCreate(BaseModel):
    property_id: str
    agency_id: Optional[str] = None
    lead_tenant_name: str
    lead_tenant_email: str
    lead_tenant_phone: str
    group_size: int = 1
    scheduled_time: datetime
    notes: Optional[str] = None

class ViewingBookingOut(BaseModel):
    id: str
    property_id: str
    agency_id: str
    lead_tenant_name: str
    lead_tenant_email: str
    lead_tenant_phone: str
    group_size: int
    scheduled_time: datetime
    status: str
    notes: Optional[str] = None
    property: Optional[PropertyOut] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Chat & Agent Schemas
class ChatMessageIn(BaseModel):
    sender_id: str = "web_user_demo"
    message: str
    agency_slug: Optional[str] = "cardens-exeter"
    channel: str = "web"

class PropertyCard(BaseModel):
    id: str
    title: str
    street_address: str
    area: str
    bedrooms: int
    price_pppw: float
    bills_included: bool
    campus_proximity: str
    image_url: Optional[str] = None

class ChatMessageOut(BaseModel):
    reply: str
    recommended_properties: List[PropertyCard] = []
    available_slots: List[str] = []
    booking_confirmed: Optional[Dict[str, Any]] = None
    conversation_state: Dict[str, Any] = {}

# Dashboard Metrics
class DashboardStatsOut(BaseModel):
    total_inquiries: int
    qualified_groups: int
    total_properties: int
    available_properties: int
    total_booked_viewings: int
    upcoming_viewings_count: int
    estimated_pipeline_commission: float
