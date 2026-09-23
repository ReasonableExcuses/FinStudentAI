import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.database import SessionLocal, Base, engine
from backend.app.api.demo import seed_demo_data

def run_seed():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Seeding FinStudent AI realistic demo profile (Alex)...")
        res = seed_demo_data(db)
        print("Demo seed complete!")
        print(f"Message: {res['message']}")
        print(f"Demo Credentials: alex@finstudent.ai / password123")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
