# core-api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="EcoAudit Calculation Engine")

# --- DATA MODELS ---
class AuditRequest(BaseModel):
    total_bytes: int
    url: str
    region: Optional[str] = "global" # Default to global if not specified

# --- CONSTANTS ---
# kWh per GB (The "Energy Cost" of moving data)
KWH_PER_GB = 0.81 

# Carbon Intensity (gCO2 per kWh) - Source: Ember/OurWorldInData (2023 approx)
# This acts as your "Smart Database"
GRID_INTENSITY_MAP = {
    "global": 442,      # World Average
    "us": 380,          # United States
    "in": 725,          # India (Coal heavy)
    "fr": 56,           # France (Nuclear heavy)
    "se": 13,           # Sweden (Renewable heavy)
    "de": 350,          # Germany
    "cn": 530           # China
}

@app.get("/")
def root():
    return {"message": "Smart Calculation Engine Ready"}

@app.post("/calculate")
def calculate_footprint(data: AuditRequest):
    # 1. Determine Carbon Intensity based on Region
    region_key = data.region.lower()
    
    # If region not found, fallback to global
    carbon_intensity = GRID_INTENSITY_MAP.get(region_key, GRID_INTENSITY_MAP["global"])
    
    # 2. The Math
    size_gb = data.total_bytes / (1024 * 1024 * 1024)
    energy_kwh = size_gb * KWH_PER_GB
    carbon_grams = energy_kwh * carbon_intensity
    
    # 3. Benchmarking (Compare to Global Average)
    global_grams = energy_kwh * GRID_INTENSITY_MAP["global"]
    saving = global_grams - carbon_grams
    
    return {
        "url": data.url,
        "meta": {
            "region_used": region_key,
            "carbon_intensity_factor": carbon_intensity
        },
        "metrics": {
            "size_gb": round(size_gb, 5),
            "energy_kwh": round(energy_kwh, 5),
            "co2_grams": round(carbon_grams, 3)
        },
        "benchmark": {
            "vs_global_average": f"{round(saving, 3)}g {'saved' if saving > 0 else 'more'} than average"
        }
    }