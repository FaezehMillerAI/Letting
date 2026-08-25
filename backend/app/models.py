import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Agency(Base):
    __tablename__ = "agencies"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    calendar_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    properties = relationship("Property", back_populates="agency", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="agency")
    viewings = relationship("ViewingBooking", back_populates="agency")


class Property(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True, default=generate_uuid)
    agency_id = Column(String, ForeignKey("agencies.id"), nullable=False)
    title = Column(String, nullable=False)
    street_address = Column(String, nullable=False)
    postcode = Column(String, nullable=False)
    area = Column(String, nullable=False)  # e.g., Pennsylvania, Mount Pleasant, St James, St Davids, Heavitree
    campus_proximity = Column(String, default="Streatham")  # Streatham, St Lukes, Both
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Integer, default=2)
    price_pppw = Column(Float, nullable=False)  # price per person per week in GBP
    bills_included = Column(Boolean, default=True)
    tenancy_length_weeks = Column(Integer, default=48)
    is_available = Column(Boolean, default=True)
    image_urls = Column(JSON, default=list)
    virtual_tour_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    agency = relationship("Agency", back_populates="properties")
    viewings = relationship("ViewingBooking", back_populates="property")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    agency_id = Column(String, ForeignKey("agencies.id"), nullable=True)
    channel = Column(String, default="whatsapp")  # whatsapp or web
    sender_id = Column(String, index=True, nullable=False)  # phone number or session token
    state = Column(JSON, default=dict)  # group_size, budget, target_area, campus, interested_property_id
    history = Column(JSON, default=list)  # list of {role: str, content: str, timestamp: str}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    agency = relationship("Agency", back_populates="conversations")


class ViewingBooking(Base):
    __tablename__ = "viewing_bookings"

    id = Column(String, primary_key=True, default=generate_uuid)
    agency_id = Column(String, ForeignKey("agencies.id"), nullable=False)
    property_id = Column(String, ForeignKey("properties.id"), nullable=False)
    lead_tenant_name = Column(String, nullable=False)
    lead_tenant_email = Column(String, nullable=False)
    lead_tenant_phone = Column(String, nullable=False)
    group_size = Column(Integer, default=1)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String, default="confirmed")  # confirmed, cancelled, completed
    notes = Column(Text, nullable=True)
    calendar_event_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    agency = relationship("Agency", back_populates="viewings")
    property = relationship("Property", back_populates="viewings")
