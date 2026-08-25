import re
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models import Agency, Conversation, Property
from backend.app.agent.prompts import EXETER_LETTINGS_SYSTEM_PROMPT
from backend.app.agent.tools import (
    search_properties_tool,
    get_available_viewing_slots_tool,
    book_viewing_slot_tool
)
from backend.app.config import settings

class LettingsAgent:
    """Intelligent conversational AI agent for Exeter student lettings."""

    def __init__(self, db: Session, agency_slug: str = "cardens-exeter"):
        self.db = db
        self.agency = db.query(Agency).filter(Agency.slug == agency_slug).first()
        if not self.agency:
            # Fallback to first available agency
            self.agency = db.query(Agency).first()

    def process_message(
        self,
        sender_id: str,
        message_text: str,
        channel: str = "web"
    ) -> Dict[str, Any]:
        """Process incoming student message, update conversation state, execute tools, and return response."""
        # 1. Retrieve or create conversation
        conversation = self.db.query(Conversation).filter(
            Conversation.sender_id == sender_id,
            Conversation.agency_id == self.agency.id
        ).first()

        if not conversation:
            conversation = Conversation(
                agency_id=self.agency.id,
                channel=channel,
                sender_id=sender_id,
                state={
                    "step": "greeting",
                    "group_size": None,
                    "max_pppw": None,
                    "area": None,
                    "campus": None,
                    "interested_property_id": None,
                    "selected_slot": None,
                    "lead_name": None,
                    "lead_email": None,
                    "lead_phone": None
                },
                history=[]
            )
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)

        state = dict(conversation.state or {})
        history = list(conversation.history or [])

        # Append user message to history
        history.append({
            "role": "user",
            "content": message_text,
            "timestamp": datetime.utcnow().isoformat()
        })

        # 2. State & Intent Extraction (Natural Language Heuristics & Tool Orchestration)
        reply, recommended_properties, available_slots, booking_confirmed = self._run_agent_reasoning(
            message_text, state, history
        )

        # Append assistant reply to history
        history.append({
            "role": "assistant",
            "content": reply,
            "timestamp": datetime.utcnow().isoformat()
        })

        # 3. Persist updated conversation
        conversation.state = state
        conversation.history = history
        self.db.commit()

        return {
            "reply": reply,
            "recommended_properties": recommended_properties,
            "available_slots": available_slots,
            "booking_confirmed": booking_confirmed,
            "conversation_state": state
        }

    def _run_agent_reasoning(
        self,
        msg: str,
        state: Dict[str, Any],
        history: List[Dict[str, Any]]
    ):
        """Execute Exeter-specific conversational flow, extraction, and tool calls."""
        lower_msg = msg.lower().strip()
        recommended_properties = []
        available_slots = []
        booking_confirmed = None

        # --- EXTRACT CRITERIA FROM MESSAGE ---
        # Group size / beds extraction
        bed_match = re.search(r'(\d+)\s*(?:bed|people|students|housemates|persons|pax|mates)', lower_msg)
        if bed_match:
            state["group_size"] = int(bed_match.group(1))
        elif any(w in lower_msg for w in ["five", "5"]):
            if "5" in lower_msg: state["group_size"] = 5
        elif any(w in lower_msg for w in ["four", "4"]):
            if "4" in lower_msg: state["group_size"] = 4
        elif any(w in lower_msg for w in ["six", "6"]):
            if "6" in lower_msg: state["group_size"] = 6
        elif any(w in lower_msg for w in ["seven", "7"]):
            if "7" in lower_msg: state["group_size"] = 7

        # Budget extraction (£pppw)
        budget_match = re.search(r'(?:£|under|max|budget\s*of|around)?\s*(\d{2,3})\s*(?:pppw|pw|per\s*week|pounds|£)?', lower_msg)
        if budget_match and int(budget_match.group(1)) >= 100 and int(budget_match.group(1)) <= 350:
            state["max_pppw"] = float(budget_match.group(1))

        # Campus extraction
        if "luke" in lower_msg:
            state["campus"] = "St Lukes"
        elif "streatham" in lower_msg or "forum" in lower_msg:
            state["campus"] = "Streatham"

        # Area extraction
        for area_name in ["pennsylvania", "mount pleasant", "victoria", "longbrook", "st james", "st davids", "heavitree", "south street"]:
            if area_name in lower_msg:
                state["area"] = area_name.title()

        # Email extraction
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', msg)
        if email_match:
            state["lead_email"] = email_match.group(0)

        # Phone extraction
        phone_match = re.search(r'(?:(?:\+44\s?\(0\)\s?|\+44\s?|0)\d{4}\s?\d{6}|\d{10,11})', msg)
        if phone_match:
            state["lead_phone"] = phone_match.group(0)

        # Name extraction if user provides name
        name_match = re.search(r'(?:my name is|i am|i\'m|name:\s*)([A-Za-z\s]{2,25})', lower_msg)
        if name_match:
            state["lead_name"] = name_match.group(1).strip().title()

        # --- FLOW EXECUTION ---

        # Case A: Booking Confirmation (Student provides details after slot selection)
        if state.get("interested_property_id") and (state.get("lead_email") or state.get("lead_phone") or "book" in lower_msg or "confirm" in lower_msg or "@" in lower_msg or "tomorrow" in lower_msg or "2pm" in lower_msg or "4:30" in lower_msg or "11am" in lower_msg):
            prop_id = state.get("interested_property_id")
            prop = self.db.query(Property).filter(Property.id == prop_id).first()
            
            # Check slot selection
            if "4:30" in lower_msg or "option 2" in lower_msg or "second" in lower_msg:
                slots = get_available_viewing_slots_tool(self.db, prop_id)
                state["selected_slot"] = slots[1]["iso"] if len(slots) > 1 else slots[0]["iso"]
            elif "11" in lower_msg or "option 3" in lower_msg or "third" in lower_msg:
                slots = get_available_viewing_slots_tool(self.db, prop_id)
                state["selected_slot"] = slots[2]["iso"] if len(slots) > 2 else slots[0]["iso"]
            elif not state.get("selected_slot"):
                slots = get_available_viewing_slots_tool(self.db, prop_id)
                state["selected_slot"] = slots[0]["iso"] if slots else None

            # Check if we have contact info to book
            if state.get("lead_email") or ("@" in lower_msg):
                email = state.get("lead_email") or (email_match.group(0) if email_match else "student@exeter.ac.uk")
                name = state.get("lead_name") or "Exeter Student Group"
                phone = state.get("lead_phone") or "07700900123"
                
                # Execute Booking Tool
                booking_result = book_viewing_slot_tool(
                    db=self.db,
                    property_id=prop_id,
                    agency_id=self.agency.id,
                    lead_tenant_name=name,
                    lead_tenant_email=email,
                    lead_tenant_phone=phone,
                    group_size=state.get("group_size") or (prop.bedrooms if prop else 5),
                    slot_time_iso=state.get("selected_slot") or datetime.now().isoformat()
                )
                
                booking_confirmed = booking_result
                reply = (
                    f"🎉 **Viewing Confirmed!**\n\n"
                    f"You're all booked in to view **{booking_result['property_title']}** on **{booking_result['scheduled_time_display']}**.\n\n"
                    f"📍 **Meeting Point:** {booking_result['property_address']}\n"
                    f"👤 **Lead Tenant:** {booking_result['lead_tenant_name']} ({booking_result['lead_tenant_email']})\n"
                    f"👥 **Group Size:** {booking_result['group_size']} students\n\n"
                    f"A calendar invite and WhatsApp reminder have been dispatched. Our lettings negotiator will meet your group outside the property 5 minutes before the slot.\n\n"
                    f"Do you need to view any other houses in Pennsylvania or Mount Pleasant while you're in the area?"
                )
                state["step"] = "completed"
                return reply, recommended_properties, available_slots, booking_confirmed

            else:
                # Prompt for contact info
                slots = get_available_viewing_slots_tool(self.db, prop_id)
                available_slots = [s["display"] for s in slots]
                reply = (
                    f"Brilliant choice! To confirm your group's viewing for **{prop.title if prop else 'the property'}**, "
                    f"could you please reply with:\n\n"
                    f"1. **Your Full Name**\n"
                    f"2. **Exeter Email (@exeter.ac.uk)**\n"
                    f"3. **WhatsApp Mobile Number**\n"
                    f"4. Which slot works best: **{slots[0]['display']}**, **{slots[1]['display']}**, or **{slots[2]['display']}**?"
                )
                return reply, recommended_properties, available_slots, booking_confirmed

        # Case B: Student asks for viewing on a specific property
        if "view" in lower_msg or "book" in lower_msg or "see" in lower_msg or "look around" in lower_msg:
            # Match property if mentioned
            props = search_properties_tool(
                self.db,
                self.agency.id,
                bedrooms=state.get("group_size"),
                max_pppw=state.get("max_pppw"),
                area=state.get("area"),
                campus_proximity=state.get("campus")
            )
            if props:
                chosen_prop = props[0]
                state["interested_property_id"] = chosen_prop["id"]
                slots = get_available_viewing_slots_tool(self.db, chosen_prop["id"])
                available_slots = [s["display"] for s in slots]
                
                reply = (
                    f"Fantastic! I can schedule an in-person viewing for **{chosen_prop['title']}** ({chosen_prop['area']}).\n\n"
                    f"To give current tenants statutory 24-hour notice, here are our next 3 available viewing slots:\n"
                    f"• **1️⃣ {slots[0]['display']}**\n"
                    f"• **2️⃣ {slots[1]['display']}**\n"
                    f"• **3️⃣ {slots[2]['display']}**\n\n"
                    f"Which slot suits your housemates best? Just reply with your preferred slot number and your Exeter email address!"
                )
                recommended_properties = [chosen_prop]
                return reply, recommended_properties, available_slots, booking_confirmed

        # Case C: Property Search (Criteria provided or searched)
        if state.get("group_size") or state.get("max_pppw") or state.get("area") or state.get("campus") or "house" in lower_msg or "flat" in lower_msg or "property" in lower_msg or "looking" in lower_msg:
            props = search_properties_tool(
                self.db,
                self.agency.id,
                bedrooms=state.get("group_size"),
                max_pppw=state.get("max_pppw"),
                area=state.get("area"),
                campus_proximity=state.get("campus")
            )

            if props:
                recommended_properties = props
                state["interested_property_id"] = props[0]["id"]
                
                houses_text = ""
                for i, p in enumerate(props[:2], 1):
                    bills_str = "Bills Included (Gas/Elec/Water/WiFi)" if p["bills_included"] else "Bills Excluded"
                    houses_text += (
                        f"🏡 **Option {i}: {p['title']}**\n"
                        f"• **Rent:** £{p['price_pppw']:.2f} pppw ({bills_str})\n"
                        f"• **Location:** {p['street_address']}, {p['area']} ({p['campus_proximity']} proximity)\n"
                        f"• **Details:** {p['bedrooms']} Double Beds, {p['bathrooms']} Bathrooms\n\n"
                    )

                reply = (
                    f"Great news! We have matching student homes for your group:\n\n"
                    f"{houses_text}"
                    f"Would you and your housemates like to book an in-person viewing for **{props[0]['title']}**?"
                )
                state["step"] = "viewing_selection"
                return reply, recommended_properties, available_slots, booking_confirmed
            else:
                reply = (
                    "I searched our current Exeter HMO stock, but don't have an exact match for those specific filters. "
                    "Would you consider nearby areas like Pennsylvania or Mount Pleasant, or a slightly flexible budget?"
                )
                return reply, recommended_properties, available_slots, booking_confirmed

        # Case D: Initial Greeting / Default
        reply = (
            f"👋 Hi there! Welcome to **{self.agency.name} Student Lettings** in Exeter.\n\n"
            f"I can help your group find and secure student accommodation for the 2026/27 academic year.\n\n"
            f"To show you our best available houses, could you tell me:\n"
            f"1. **How many people are in your group?** (e.g. 4, 5, 6, 7 bed)\n"
            f"2. **What's your maximum budget per person?** (e.g. £175 pppw)\n"
            f"3. **Which campus are you studying at?** (Streatham or St Luke's)?"
        )
        return reply, recommended_properties, available_slots, booking_confirmed
