import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Starting database seeding...")
    
    existing_admin = await db.users.find_one({"email": "admin@naijafinance.ng"})
    if existing_admin:
        print("Admin user already exists, skipping seed.")
        return
    
    admin_user = {
        "id": "admin-001",
        "email": "admin@naijafinance.ng",
        "password": pwd_context.hash("admin123"),
        "full_name": "System Administrator",
        "phone": "+234 800 000 0001",
        "role": "super_admin",
        "branch_id": "main",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin_user)
    print("✓ Created admin user: admin@naijafinance.ng / admin123")
    
    sample_users = [
        {
            "id": "agent-001",
            "email": "agent1@naijafinance.ng",
            "password": pwd_context.hash("agent123"),
            "full_name": "John Okafor",
            "phone": "+234 800 000 0002",
            "role": "agent",
            "branch_id": "main",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "cashier-001",
            "email": "cashier@naijafinance.ng",
            "password": pwd_context.hash("cashier123"),
            "full_name": "Amina Ibrahim",
            "phone": "+234 800 000 0003",
            "role": "cashier",
            "branch_id": "main",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "loan-officer-001",
            "email": "loans@naijafinance.ng",
            "password": pwd_context.hash("loans123"),
            "full_name": "Chidi Adeyemi",
            "phone": "+234 800 000 0004",
            "role": "loan_officer",
            "branch_id": "main",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.users.insert_many(sample_users)
    print("✓ Created sample users (agent, cashier, loan officer)")
    
    main_branch = {
        "id": "main",
        "name": "Main Branch",
        "address": "123 Lagos Street, Lagos, Nigeria",
        "phone": "+234 800 000 0000",
        "manager_id": "admin-001",
        "is_active": True
    }
    
    await db.branches.insert_one(main_branch)
    print("✓ Created main branch")
    
    print("\\n=== Database seeding completed successfully! ===")
    print("\\nDefault credentials:")
    print("Admin: admin@naijafinance.ng / admin123")
    print("Agent: agent1@naijafinance.ng / agent123")
    print("Cashier: cashier@naijafinance.ng / cashier123")
    print("Loan Officer: loans@naijafinance.ng / loans123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
