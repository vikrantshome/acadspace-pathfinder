from pydantic import BaseModel
from typing import List
from .student_profile import StudentProfile
from .career_match import CareerMatch
from .career_bucket import CareerBucket

class ReportGenerationRequest(BaseModel):
    """Input from Java backend"""
    student_profile: StudentProfile
    career_matches: List[CareerMatch]
    top_buckets: List[CareerBucket]
