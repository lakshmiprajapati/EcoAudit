# core-api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="EcoAudit Calculation Engine")

# --- DATA MODELS ---
# This defines what data we expect to receive from the user/scanner
class AuditRequest(BaseModel):
    total_bytes: int
    url: str

# --- CONSTANTS (Standard SWD Model) ---
# kWh per GB of data transfer (Global Average Estimate)
KWH_PER_GB = 0.81 
# Global Carbon Intensity average (gCO2/kWh)
GLOBAL_GRID_INTENSITY = 442 

@app.get("/")
def root():
    return {"message": "Calculation Engine Ready"}

@app.post("/calculate")
def calculate_footprint(data: AuditRequest):
    """
    Calculates the carbon footprint based on file size.
    """
    # 1. Convert bytes to Gigabytes
    size_gb = data.total_bytes / (1024 * 1024 * 1024)
    
    # 2. Calculate Energy (kWh)
    energy_kwh = size_gb * KWH_PER_GB
    
    # 3. Calculate Carbon (grams)
    carbon_grams = energy_kwh * GLOBAL_GRID_INTENSITY
    
    return {
        "url": data.url,
        "metrics": {
            "size_gb": round(size_gb, 5),
            "energy_kwh": round(energy_kwh, 5),
            "co2_grams": round(carbon_grams, 3)
        },
        "message": "Calculation successful based on global averages."
    }