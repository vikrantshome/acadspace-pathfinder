from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class CareerExplanation(BaseModel):
    """Structured career explanation output"""
    career_name: str = Field(description="Name of the career")
    explanation: str = Field(description="Detailed explanation of why this career fits the student")
    key_alignment_factors: List[str] = Field(description="Top 3 factors that make this career a good match")
    potential_challenges: List[str] = Field(description="Potential challenges or areas to improve")
    confidence_level: str = Field(description="Confidence level: High, Medium, or Low")

class StudyPathRecommendation(BaseModel):
    """Structured study path recommendation"""
    career_name: str = Field(description="Name of the career")
    immediate_steps: List[str] = Field(description="2-3 immediate steps for current grade level")
    medium_term_goals: List[str] = Field(description="2-3 medium-term goals (1-2 years)")
    long_term_path: List[str] = Field(description="2-3 long-term educational path recommendations")
    priority_subjects: List[str] = Field(description="Most important subjects to focus on")

class SkillRecommendation(BaseModel):
    """Structured skill recommendation"""
    skill_name: str = Field(description="Name of the skill")
    category: str = Field(description="Category: Technical, Soft Skills, or Academic")
    importance_level: str = Field(description="Importance: Critical, High, Medium, or Low")
    development_method: str = Field(description="How to develop this skill")
    timeline: str = Field(description="Suggested timeline for development")

class CareerTrajectory(BaseModel):
    """Structured career trajectory insights"""
    career_name: str = Field(description="Name of the primary career")
    immediate_focus: str = Field(description="What to focus on immediately")
    educational_pathway: str = Field(description="Recommended educational pathway")
    career_progression: str = Field(description="Long-term career progression possibilities")
    key_milestones: List[str] = Field(description="Important milestones to achieve")

class PersonalizedSummary(BaseModel):
    """Structured personalized summary"""
    student_name: str = Field(description="Name of the student")
    personality_analysis: str = Field(description="Analysis of student's personality and strengths")
    top_career_fit: str = Field(description="Explanation of why the top career fits")
    actionable_advice: str = Field(description="Encouraging and actionable advice")
    skills_to_develop: List[str] = Field(description="Top 3-5 skills to focus on developing")
    motivation_message: str = Field(description="Motivational message for the student")

class ConfidenceExplanation(BaseModel):
    """Structured confidence explanation"""
    career_name: str = Field(description="Name of the career")
    match_score: int = Field(description="Match score percentage")
    primary_factors: List[str] = Field(description="Top 3 factors contributing to this score")
    strength_areas: List[str] = Field(description="Areas where student shows strong alignment")
    improvement_areas: List[str] = Field(description="Areas that could improve the match")
    overall_confidence: str = Field(description="Overall confidence assessment")

class CareerInsights(BaseModel):
    """Comprehensive career insights structure"""
    career_name: str = Field(description="Name of the career")
    explanation: CareerExplanation
    study_path: StudyPathRecommendation
    confidence: ConfidenceExplanation

class StructuredReportOutput(BaseModel):
    """Complete structured report output"""
    personalized_summary: PersonalizedSummary
    career_insights: List[CareerInsights] = Field(description="Top 3-5 career insights")
    skill_recommendations: List[SkillRecommendation] = Field(description="5-7 skill recommendations")
    career_trajectory: CareerTrajectory
    overall_assessment: str = Field(description="Overall assessment and next steps")

# Utility classes for different output types
class SimpleListOutput(BaseModel):
    """Simple list output for basic recommendations"""
    items: List[str] = Field(description="List of recommendations or items")

class KeyValueOutput(BaseModel):
    """Key-value pair output"""
    key: str = Field(description="Key or category")
    value: str = Field(description="Value or explanation")

class MultiKeyValueOutput(BaseModel):
    """Multiple key-value pairs output"""
    pairs: List[KeyValueOutput] = Field(description="List of key-value pairs")

class ActionPlanItem(BaseModel):
    """Single action plan item"""
    title: str = Field(description="Title of the action item")
    description: str = Field(description="Description of what to do")
    timeline: str = Field(description="Timeline for the action (e.g., 'This week', 'Next 2 weeks', 'This month', 'Ongoing')")

class ActionPlan(BaseModel):
    """Action plan with exactly 5 items"""
    items: List[ActionPlanItem] = Field(description="List of exactly 5 action plan items", min_length=5, max_length=5)

# Enum for output types to make the system more flexible
class OutputType(str, Enum):
    CAREER_EXPLANATION = "career_explanation"
    STUDY_PATH = "study_path"
    SKILL_RECOMMENDATIONS = "skill_recommendations"
    CAREER_TRAJECTORY = "career_trajectory"
    PERSONALIZED_SUMMARY = "personalized_summary"
    CONFIDENCE_EXPLANATION = "confidence_explanation"
    COMPLETE_REPORT = "complete_report"
    SIMPLE_LIST = "simple_list"
    KEY_VALUE = "key_value"
    MULTI_KEY_VALUE = "multi_key_value"
    ACTION_PLAN = "action_plan"

