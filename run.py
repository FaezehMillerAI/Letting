import sys
import io

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import uvicorn
from backend.app.config import settings

if __name__ == "__main__":
    print("=" * 70)
    print(f"🚀 Starting {settings.PROJECT_NAME} Backend & Interactive Demo")
    print("=" * 70)
    print(f"📍 Location Scope: University of Exeter Student Lettings Market")
    print(f"🌐 Web App & Simulator: http://localhost:{settings.PORT}")
    print(f"📚 OpenAPI Documentation: http://localhost:{settings.PORT}/docs")
    print("=" * 70)
    
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
