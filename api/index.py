import sys
from pathlib import Path

# Add project root and backend to python path for Vercel Serverless environment
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(root_dir))

from app.main import app

