import sys
import os

# Add app directory to path
app_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, app_dir)

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(app_dir, '.env'))

# Import the FastAPI app
from server import app as fastapi_app

# Convert ASGI (FastAPI) to WSGI for cPanel Passenger
from a2wsgi import ASGIMiddleware
application = ASGIMiddleware(fastapi_app)
