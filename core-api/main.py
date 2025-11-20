# core-api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx # New library for calling the scanner

app = FastAPI(title="EcoAudit Calculation Engine")

# --- CONFIG ---
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

@app.get("/")
def root():
    return {"message": "EcoAudit Orchestrator Ready"}

@app.post("/audit")
async def perform_full_audit(request: AuditRequest):
    """
    The Master Endpoint:
    1. Calls Node.js Scanner to get bytes.
    2. Calculates Carbon.
    3. Returns full report.
    """
    print(f"🌐 Starting Audit for: {request.url}")

    # STEP 1: Call the Scanner Service (Node.js)
    try:
        async with httpx.AsyncClient() as client:
            # We send the URL to the scanner
            response = await client.post(SCANNER_URL, json={"url": request.url}, timeout=30.0)
            response.raise_for_status() # Error if scanner fails
            scan_data = response.json()
            
            # Extract the bytes from the scanner's response
            total_bytes = scan_data['metrics']['totalBytes']
            resource_breakdown = scan_data['metrics']['resources']
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scanner Service Failed: {str(e)}")

    # STEP 2: Calculate Carbon (The Math)
    region_key = request.region.lower()
    carbon_intensity = GRID_INTENSITY_MAP.get(region_key, GRID_INTENSITY_MAP["global"])
    
    size_gb = total_bytes / (1024 * 1024 * 1024)
    energy_kwh = size_gb * KWH_PER_GB
    carbon_grams = energy_kwh * carbon_intensity
    
    # STEP 3: Return the Unified Report
    return {
        "url": request.url,
        "timestamp": "Just now",
        "environment": {
            "region": region_key,
            "intensity": carbon_intensity
        },
        "network_metrics": {
            "total_bytes": total_bytes,
            "breakdown": resource_breakdown
        },
        "carbon_report": {
            "energy_usage_kwh": round(energy_kwh, 5),
            "carbon_footprint_grams": round(carbon_grams, 3),
            "grade": "A" if carbon_grams < 0.5 else "F" # Simple grading logic
        }
    }