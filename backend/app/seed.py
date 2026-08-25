from sqlalchemy.orm import Session
from backend.app.models import Agency, Property
from backend.app.config import settings

def seed_database(db: Session):
    """Seed default Exeter Agency and representative HMO student properties."""
    agency = db.query(Agency).filter(Agency.slug == settings.DEFAULT_AGENCY_SLUG).first()
    if not agency:
        agency = Agency(
            name=settings.DEFAULT_AGENCY_NAME,
            slug=settings.DEFAULT_AGENCY_SLUG,
            phone_number=settings.DEFAULT_AGENCY_PHONE,
            email=settings.DEFAULT_AGENCY_EMAIL,
            calendar_id=settings.DEFAULT_CALENDAR_URL
        )
        db.add(agency)
        db.commit()
        db.refresh(agency)

    # Check if properties exist
    count = db.query(Property).filter(Property.agency_id == agency.id).count()
    if count == 0:
        properties_data = [
            {
                "title": "5-Bed Victorian Student HMO on Victoria Street",
                "street_address": "42 Victoria Street",
                "postcode": "EX4 6JJ",
                "area": "Pennsylvania",
                "campus_proximity": "Streatham",
                "bedrooms": 5,
                "bathrooms": 2,
                "price_pppw": 185.00,
                "bills_included": True,
                "tenancy_length_weeks": 48,
                "is_available": True,
                "image_urls": ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"],
                "description": "Stunning 5 double-bedroom Victorian home in prime Pennsylvania location. Only 8 mins walk to Streatham Campus & Forum. Modern open-plan kitchen/lounge with 55' 4K TV, washer/dryer, high-speed 350Mbps Virgin broadband, and sunny rear garden with BBQ patio."
            },
            {
                "title": "6-Bed Townhouse on Mount Pleasant Road",
                "street_address": "118 Mount Pleasant Road",
                "postcode": "EX4 7AE",
                "area": "Mount Pleasant",
                "campus_proximity": "Both",
                "bedrooms": 6,
                "bathrooms": 3,
                "price_pppw": 168.00,
                "bills_included": True,
                "tenancy_length_weeks": 48,
                "is_available": True,
                "image_urls": ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"],
                "description": "Generous 6-bed student house ideally situated between Streatham and St Luke's campuses. Featuring 3 full bathrooms, spacious communal lounge, separate utility room, and private rear courtyard. Inclusive of all gas, electricity, water, and broadband."
            },
            {
                "title": "4-Bed Luxury Student Home on Longbrook Street",
                "street_address": "15 Longbrook Street",
                "postcode": "EX4 6AB",
                "area": "City Centre",
                "campus_proximity": "Streatham",
                "bedrooms": 4,
                "bathrooms": 2,
                "price_pppw": 195.00,
                "bills_included": True,
                "tenancy_length_weeks": 50,
                "is_available": True,
                "image_urls": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"],
                "description": "High-spec 4-bedroom property located moments from John Lewis, Princesshay, and just 10 mins walk to Streatham Campus. Features designer furnishings, integrated Bosch appliances, and all bills included."
            },
            {
                "title": "7-Bed Substantial HMO on Old Tiverton Road",
                "street_address": "84 Old Tiverton Road",
                "postcode": "EX4 6LG",
                "area": "St James",
                "campus_proximity": "Streatham",
                "bedrooms": 7,
                "bathrooms": 3,
                "price_pppw": 172.00,
                "bills_included": True,
                "tenancy_length_weeks": 48,
                "is_available": True,
                "image_urls": ["https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800"],
                "description": "Huge 7 double-bedroom student house with extra large communal living space. 3 modern bathrooms with rainfall showers. Large south-facing garden, bike storage, and private driveway parking for 2 cars. 12 mins walk to campus."
            },
            {
                "title": "4-Bed Contemporary Apartment on South Street",
                "street_address": "62 South Street",
                "postcode": "EX1 1EE",
                "area": "St Davids",
                "campus_proximity": "St Lukes",
                "bedrooms": 4,
                "bathrooms": 2,
                "price_pppw": 155.00,
                "bills_included": False,
                "tenancy_length_weeks": 44,
                "is_available": True,
                "image_urls": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
                "description": "Affordable 4-bedroom modern flat situated close to Exeter Quay and St Luke's campus. Open plan kitchen-diner, double glazing throughout, energy-efficient heating."
            },
            {
                "title": "5-Bed Period House on Howell Road",
                "street_address": "29 Howell Road",
                "postcode": "EX4 4LQ",
                "area": "Pennsylvania",
                "campus_proximity": "Streatham",
                "bedrooms": 5,
                "bathrooms": 2,
                "price_pppw": 180.00,
                "bills_included": True,
                "tenancy_length_weeks": 48,
                "is_available": True,
                "image_urls": ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800"],
                "description": "Prime location 5-bed house directly behind Exeter St David's Station with a short scenic stroll through the woods up to Streatham Campus. Character features, large bedrooms, high-speed WiFi."
            }
        ]

        for p_data in properties_data:
            prop = Property(agency_id=agency.id, **p_data)
            db.add(prop)
        db.commit()
