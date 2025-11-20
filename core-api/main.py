# core-api/main.py
from fastapi import FastAPI, HTTPException, Depends
from contextlib import asynccontextmanager
from sqlmodel import Session, select
import httpx 

# --- IMPORTS ---
# FIX: We only import ScanResult from models. 
# We do NOT import AuditRequest because we define it below.
from database import create_db_and_tables, get_session, engine
from models import ScanResult 

from pydantic import BaseModel
from typing import Optional

# --- APP LIFECYCLE ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="EcoAudit Calculation Engine", lifespan=lifespan)

# --- CONFIG ---
SCANNER_URL = "http://localhost:3000/scan"

# --- DATA MODELS (Input) ---
# We define this HERE, so no need to import it
class AuditRequest(BaseModel):
    url: str
    region: Optional[str] = "global"

# --- CONSTANTS ---
KWH_PER_GB = 0.81 
GRID_INTENSITY_MAP = {
    "global": 442, "us": 380, "in": 725, 
    "fr": 56, "se": 13, "de": 350, "cn": 530
}

@app.get("/")
def root():
    return {"message": "EcoAudit Database & API Ready"}

@app.post("/audit", response_model=ScanResult)
async def perform_full_audit(
    request: AuditRequest, 
    db: Session = Depends(get_session)
):
    print(f"🌐 Starting Audit for: {request.url}")

    # 1. Call Scanner
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(SCANNER_URL, json={"url": request.url}, timeout=30.0)
            response.raise_for_status()
            scan_data = response.json()
            total_bytes = scan_data['metrics']['totalBytes']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scanner Failed: {str(e)}")

    # 2. Calculate Logic
    region_key = request.region.lower()
    carbon_intensity = GRID_INTENSITY_MAP.get(region_key, GRID_INTENSITY_MAP["global"])
    
    size_gb = total_bytes / (1024 * 1024 * 1024)
    energy_kwh = size_gb * KWH_PER_GB
    carbon_grams = energy_kwh * carbon_intensity
    
    grade = "A" if carbon_grams < 0.5 else ("B" if carbon_grams < 1.0 else "F")

    # 3. SAVE TO DATABASE
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

    return scan_entry

@app.get("/history")
def get_history(db: Session = Depends(get_session)):
    """Fetch all past scans"""
    scans = db.exec(select(ScanResult).order_by(ScanResult.timestamp.desc())).all()
    return scans