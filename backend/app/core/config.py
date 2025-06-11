from dotenv import load_dotenv
import os

load_dotenv()  # ✅ Loads from .env automatically

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/time_tracker")
