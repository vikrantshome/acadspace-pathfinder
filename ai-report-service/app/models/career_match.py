from pydantic import BaseModel
from typing import List, Optional

class CareerMatch(BaseModel):
    """Career match data structure"""
    career_name: str
    match_score: int
    bucket: str
    riasec_profile: str
    primary_subjects: List[str]
    top_reasons: List[str]
    study_path: List[str]
    first3_steps: List[str]
    confidence: str
    what_would_change_recommendation: str
