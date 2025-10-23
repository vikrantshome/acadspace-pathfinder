from pydantic import BaseModel
from typing import Dict, List, Optional

class StudentProfile(BaseModel):
    """Student profile data structure"""
    name: str
    grade: int
    board: str
    riasec_scores: Dict[str, int]
    subject_scores: Dict[str, int]
    extracurriculars: List[str]
    parent_careers: List[str]
