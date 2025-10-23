from pydantic import BaseModel
from typing import List
from .career_match import CareerMatch

class CareerBucket(BaseModel):
    """Career bucket data structure"""
    bucket_name: str
    bucket_score: int
    top_careers: List[CareerMatch]
