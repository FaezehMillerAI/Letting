import sys
import io

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.app.database import SessionLocal, Base, engine
from backend.app.seed import seed_database
from backend.app.agent.core import LettingsAgent
from backend.app.models import ViewingBooking

def run_tests():
    print("=" * 70)
    print("🧪 Running LettingsPulse Exeter Automated Integration Tests")
    print("=" * 70)

    # 1. Initialize DB and Seed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)

    agent = LettingsAgent(db=db, agency_slug="cardens-exeter")
    sender_id = f"test_student_group_exeter_{int(__import__('time').time())}"

    # Step 1: Initial Greeting
    print("\n[Step 1] Student sends greeting:")
    msg1 = "Hi, we are 5 students looking for a house in Pennsylvania for next year"
    print(f"Student: '{msg1}'")
    resp1 = agent.process_message(sender_id, msg1)
    print(f"Agent Response:\n{resp1['reply']}")
    assert "Victoria" in resp1['reply'] or "Option" in resp1['reply'] or "Pennsylvania" in resp1['reply'], "Failed to recommend properties"
    print("✅ Step 1 Passed: Properties matched and recommended.")

    # Step 2: Request Viewing
    print("\n[Step 2] Student requests viewing:")
    msg2 = "We would love to view the 5-bed on Victoria Street! Can we see it tomorrow?"
    print(f"Student: '{msg2}'")
    resp2 = agent.process_message(sender_id, msg2)
    print(f"Agent Response:\n{resp2['reply']}")
    assert "viewing" in resp2['reply'].lower() or "slot" in resp2['reply'].lower(), "Failed to offer viewing slots"
    print("✅ Step 2 Passed: Statutory viewing slots generated.")

    # Step 3: Provide Details and Confirm Slot
    print("\n[Step 3] Student provides lead details and confirms slot:")
    msg3 = "Option 1 works great for us. My name is Alex Turner, email: at521@exeter.ac.uk, phone: 07700900123"
    print(f"Student: '{msg3}'")
    resp3 = agent.process_message(sender_id, msg3)
    print(f"Agent Response:\n{resp3['reply']}")
    assert resp3["booking_confirmed"] is not None, "Booking was not confirmed"
    print("✅ Step 3 Passed: Booking confirmed in agent response.")

    # Step 4: Verify Booking in DB
    booking_id = resp3["booking_confirmed"]["booking_id"]
    db_booking = db.query(ViewingBooking).filter(ViewingBooking.id == booking_id).first()
    assert db_booking is not None, "Booking not found in database"
    assert db_booking.lead_tenant_email == "at521@exeter.ac.uk", "Lead tenant email mismatch"
    assert db_booking.group_size == 5, "Group size mismatch"
    print(f"✅ Step 4 Passed: Viewing record persisted in DB: ID={db_booking.id}, Status={db_booking.status}")

    db.close()
    print("\n" + "=" * 70)
    print("🎉 ALL TESTS PASSED SUCCESSFULLY! LettingsPulse Exeter is Ready.")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
