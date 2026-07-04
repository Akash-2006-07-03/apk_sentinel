import sys
import os
sys.path.append(os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router

app = FastAPI(
    title="APK Sentinel",
    description="Automated Mod APK Threat Detection Platform",
    version="1.0.0"
)

# Allow the Vite dev server (and any other local frontend) to call the API
# directly. The Vite dev proxy makes this unnecessary for local dev, but
# CORS still needs to be open for cases where the frontend calls the API
# origin directly (e.g. a different port, or a deployed frontend).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "APK Sentinel is running ✅"}
