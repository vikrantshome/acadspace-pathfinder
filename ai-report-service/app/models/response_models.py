from pydantic import BaseModel
from typing import Dict, List

class EnhancedCareerInsights(BaseModel):
    """Enhanced career insights from AI"""
    detailed_explanations: Dict[str, str]
    personalized_study_paths: Dict[str, List[str]]
    confidence_explanations: Dict[str, str]

class ReportGenerationResponse(BaseModel):
    """Output to Java backend"""
    enhanced_career_insights: EnhancedCareerInsights
    personalized_summary: str
    skill_recommendations: List[str]
    career_trajectory_insights: str
    action_plan: List[Dict] = None
