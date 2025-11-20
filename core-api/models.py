# core-api/models.py
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class ScanResult(SQLModel, table=True):
    """
    This class represents the 'scan_results' table in our database.
    Every time we run an audit, we save a row here.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Inputs
    region: str
    
    # Metrics
    total_bytes: int
    energy_kwh: float
    co2_grams: float
    grade: str