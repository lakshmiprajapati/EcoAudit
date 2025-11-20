# core-api/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import Session, select
import httpx 

from database import create_db_and_tables, get_session, engine
from models import ScanResult 
from ml import predictor # <--- IMPORT OUR ML BRAIN

from pydantic import BaseModel
from typing import Optional

# --- APP LIFECYCLE ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    predictor.train_mock_model() # <--- TRAIN ON STARTUP
    yield

app = FastAPI(title="EcoAudit Calculation Engine", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCANNER_URL = "http://localhost:3000/scan"

# --- DATA MODELS ---
class AuditRequest(BaseModel):
    url: str
    region: Optional[str] = "global"

# --- CONSTANTS ---
KWH_PER_GB = 0.81 
GRID_INTENSITY_MAP = {
    "global": 442, "us": 380, "in": 725, 
    "fr": 56, "se": 13, "de": 350, "cn": 530
}

# core-api/main.py (Partial Update)

@app.post("/audit") # Remember: No response_model=ScanResult
async def perform_full_audit(
    request: AuditRequest, 
    db: Session = Depends(get_session)
):
    # ... (Scanning and Math logic remains the same) ...
    # ... (Calculations for size_gb, energy_kwh, carbon_grams are the same) ...

    # --- RE-ADD THIS PART IF YOU DELETED IT IN PREVIOUS STEPS ---
    # 1. Call Scanner
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(SCANNER_URL, json={"url": request.url}, timeout=30.0)
            response.raise_for_status()
            scan_data = response.json()
            
            total_bytes = scan_data['metrics']['totalBytes']
            img_bytes = scan_data['metrics']['resources'].get('image', 0)
            script_bytes = scan_data['metrics']['resources'].get('script', 0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scanner Failed: {str(e)}")
    
    # 2. Math
    region_key = request.region.lower()
    carbon_intensity = GRID_INTENSITY_MAP.get(region_key, GRID_INTENSITY_MAP["global"])
    size_gb = total_bytes / (1024 * 1024 * 1024)
    energy_kwh = size_gb * KWH_PER_GB
    carbon_grams = energy_kwh * carbon_intensity
    grade = "A" if carbon_grams < 0.5 else ("B" if carbon_grams < 1.0 else "F")

    # --- NEW CODE STARTS HERE ---

    # 3. ML Prediction & Analysis
    annual_projection_kg = predictor.predict_annual_kg(total_bytes, img_bytes, script_bytes)
    recommendations = predictor.analyze_improvements(total_bytes, img_bytes, script_bytes, carbon_grams)

    # 4. Save to DB
    scan_entry = ScanResult(
        url=request.url,
        region=region_key,
        total_bytes=total_bytes,
        energy_kwh=energy_kwh,
        co2_grams=carbon_grams,
        grade=grade
    )
    db.add(scan_entry)
    db.commit()
    db.refresh(scan_entry)

    # 5. Return Custom Response
    response_data = scan_entry.model_dump()
    response_data['annual_projection_kg'] = annual_projection_kg
    response_data['recommendations'] = recommendations # <--- Sending the list!
    
    return response_data