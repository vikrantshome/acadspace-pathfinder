import os
import json
from typing import Dict, List, Optional, Type, TypeVar, Union
from openai import OpenAI
from groq import Groq
from dotenv import load_dotenv
from pydantic import BaseModel
from ..models.structured_outputs import (
    CareerExplanation, StudyPathRecommendation, SkillRecommendation,
    CareerTrajectory, PersonalizedSummary, ConfidenceExplanation,
    CareerInsights, StructuredReportOutput, SimpleListOutput,
    KeyValueOutput, MultiKeyValueOutput, OutputType
)

T = TypeVar('T', bound=BaseModel)

# Load environment variables
load_dotenv()

class AIClient:
    """AI client for interacting with language models (OpenAI and Groq)"""
    
    def __init__(self):
        """Initialize the AI client"""
        self.model_name = os.getenv("AI_MODEL_NAME", "gpt-3.5-turbo")
        self.provider = os.getenv("AI_MODEL_PROVIDER", "openai").lower()
        
        # Get provider-specific API key
        if self.provider == "openai":
            self.api_key = os.getenv("OPENAI_API_KEY")
            if not self.api_key:
                raise ValueError("OPENAI_API_KEY environment variable is required")
            self.client = OpenAI(api_key=self.api_key)
        elif self.provider == "groq":
            self.api_key = os.getenv("GROQ_API_KEY")
            if not self.api_key:
                raise ValueError("GROQ_API_KEY environment variable is required")
            self.client = Groq(api_key=self.api_key)
        else:
            raise ValueError(f"Unsupported AI provider: {self.provider}. Supported providers: openai, groq")
    
    def generate_content(self, prompt: str, max_tokens: int = 500) -> str:
        """
        Generate content using AI model
        
        Args:
            prompt: The prompt to send to the AI model
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated content string
        """
        try:
            messages = [
                {"role": "system", "content": "You are an expert career counselor and educational advisor. Provide detailed, personalized, and actionable career guidance based on student profiles and career assessment data."},
                {"role": "user", "content": prompt}
            ]
            
            # Both OpenAI and Groq use the same API interface
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating AI content with {self.provider}: {e}")
            # Return fallback content if AI fails
            return self._get_fallback_content(prompt)
    
    def generate_structured_content(
        self, 
        prompt: str, 
        response_model: Type[T], 
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> T:
        """
        Generate structured content using AI model with Pydantic validation
        
        Args:
            prompt: The prompt to send to the AI model
            response_model: Pydantic model class for structured output
            max_tokens: Maximum tokens to generate
            temperature: Temperature for response generation
            
        Returns:
            Parsed Pydantic model instance
        """
        try:
            system_prompt = f"""You are an expert career counselor and educational advisor. 
            Provide detailed, personalized, and actionable career guidance based on student profiles and career assessment data.
            
            IMPORTANT: You must respond with valid JSON that matches the required schema exactly.
            Do not include any text outside the JSON response.
            Ensure all required fields are present and properly formatted."""
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
            
            if self.provider == "openai":
                # OpenAI supports structured output with response_format
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    response_format=response_model
                )
                
                # Parse the structured response
                if hasattr(response.choices[0].message, 'parsed') and response.choices[0].message.parsed:
                    return response.choices[0].message.parsed
                else:
                    # Fallback to JSON parsing if parsed attribute not available
                    content = response.choices[0].message.content.strip()
                    return response_model.model_validate_json(content)
                    
            elif self.provider == "groq":
                # Groq uses JSON mode for structured output
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    response_format={"type": "json_object"}
                )
                
                # Parse JSON response into Pydantic model
                content = response.choices[0].message.content.strip()
                return response_model.model_validate_json(content)
            
        except Exception as e:
            print(f"Error generating structured AI content with {self.provider}: {e}")
            # Return fallback structured content
            return self._get_fallback_structured_content(response_model, prompt)
    
    def generate_career_explanation(self, career_name: str, profile_data: Dict, career_data: Dict) -> str:
        """
        Generate detailed career explanation
        
        Args:
            career_name: Name of the career
            profile_data: Student profile data
            career_data: Career match data
            
        Returns:
            Detailed career explanation
        """
        try:
            structured_explanation = self.generate_structured_career_explanation(career_name, profile_data, career_data)
            return structured_explanation.explanation
        except Exception as e:
            print(f"Error generating structured career explanation: {e}")
            return self._get_fallback_content(f"career explanation for {career_name}")
    
    def generate_study_path(self, career_name: str, profile_data: Dict, career_data: Dict) -> List[str]:
        """
        Generate personalized study path
        
        Args:
            career_name: Name of the career
            profile_data: Student profile data
            career_data: Career match data
            
        Returns:
            List of study path recommendations
        """
        try:
            structured_study_path = self.generate_structured_study_path(career_name, profile_data, career_data)
            # Combine immediate steps and medium-term goals
            all_steps = structured_study_path.immediate_steps + structured_study_path.medium_term_goals
            return all_steps[:4]  # Return first 4 items
        except Exception as e:
            print(f"Error generating structured study path: {e}")
            return career_data.get('first3_steps', [])[:3]  # Fallback to existing data
    
    def generate_confidence_explanation(self, career_name: str, match_score: int, profile_data: Dict) -> str:
        """
        Generate confidence explanation
        
        Args:
            career_name: Name of the career
            match_score: Match score percentage
            profile_data: Student profile data
            
        Returns:
            Confidence explanation
        """
        try:
            structured_confidence = self.generate_structured_confidence_explanation(career_name, match_score, profile_data)
            return structured_confidence.overall_confidence
        except Exception as e:
            print(f"Error generating structured confidence explanation: {e}")
            return self._get_fallback_content(f"confidence explanation for {career_name}")
    
    def generate_personalized_summary(self, profile_data: Dict, career_matches: List[Dict], top_buckets_data: List[Dict] = None) -> str:
        """
        Generate personalized summary paragraph
        
        Args:
            profile_data: Student profile data
            career_matches: List of top career matches
            top_buckets_data: List of top career buckets (optional)
            
        Returns:
            Personalized summary paragraph
        """
        try:
            structured_summary = self.generate_structured_personalized_summary(profile_data, career_matches, top_buckets_data)
            # Combine personality analysis, career fit, and actionable advice into a paragraph
            summary_parts = [
                structured_summary.personality_analysis,
                structured_summary.top_career_fit,
                structured_summary.actionable_advice
            ]
            return " ".join(summary_parts)
        except Exception as e:
            print(f"Error generating structured personalized summary: {e}")
            if not career_matches:
                return f"{profile_data.get('name', 'Student')} — complete the assessment to get personalized career recommendations."
            return self._get_fallback_content("personalized summary")
    
    def generate_skill_recommendations(self, profile_data: Dict, career_matches: List[Dict]) -> List[str]:
        """
        Generate skill development recommendations
        
        Args:
            profile_data: Student profile data
            career_matches: List of top career matches
            
        Returns:
            List of skill recommendations
        """
        try:
            structured_skills = self.generate_structured_skill_recommendations(profile_data, career_matches)
            # Extract skill names and development methods
            skill_recommendations = []
            for skill in structured_skills:
                skill_recommendations.append(f"{skill.skill_name}: {skill.development_method}")
            return skill_recommendations
        except Exception as e:
            print(f"Error generating structured skill recommendations: {e}")
            # Fallback to basic recommendations
            return [
                "Develop strong problem-solving skills",
                "Improve communication and presentation abilities",
                "Build technical skills in your area of interest",
                "Practice critical thinking and analysis",
                "Gain hands-on experience through projects"
            ]
    
    def generate_career_trajectory(self, profile_data: Dict, career_matches: List[Dict]) -> str:
        """
        Generate career trajectory insights
        
        Args:
            profile_data: Student profile data
            career_matches: List of top career matches
            
        Returns:
            Career trajectory insights
        """
        try:
            if not career_matches:
                return "Complete the assessment to get career trajectory insights."
            
            top_career = career_matches[0]
            
            # Create a simple career trajectory using structured approach
            career_trajectory = CareerTrajectory(
                career_name=top_career.get('career_name', 'Career'),
                immediate_focus=f"Focus on building strong foundations in {', '.join(top_career.get('primary_subjects', ['relevant subjects'])[:2])} during {profile_data.get('grade', 'current')}th grade",
                educational_pathway=f"Pursue relevant higher education in {top_career.get('bucket', 'your chosen field')} fields",
                career_progression=f"Progress from entry-level to senior positions in {top_career.get('career_name', 'your chosen field')}",
                key_milestones=[
                    f"Complete {profile_data.get('grade', 'current')}th grade with strong performance",
                    "Gain practical experience through projects",
                    "Pursue relevant higher education",
                    "Build professional network"
                ]
            )
            
            # Combine into a paragraph
            trajectory_parts = [
                career_trajectory.immediate_focus,
                career_trajectory.educational_pathway,
                career_trajectory.career_progression
            ]
            return " ".join(trajectory_parts)
            
        except Exception as e:
            print(f"Error generating career trajectory: {e}")
            if not career_matches:
                return "Complete the assessment to get career trajectory insights."
            return self._get_fallback_content("career trajectory")
    
    # New structured output methods
    def generate_structured_career_explanation(
        self, 
        career_name: str, 
        profile_data: Dict, 
        career_data: Dict
    ) -> CareerExplanation:
        """Generate structured career explanation"""
        prompt = f"""
        Generate a detailed, structured explanation of why {career_name} is a good career match for this student.
        
        Student Profile:
        - Name: {profile_data.get('name', 'Student')}
        - Grade: {profile_data.get('grade', 'N/A')}
        - RIASEC Scores: {profile_data.get('riasec_scores', {})}
        - Subject Scores: {profile_data.get('subject_scores', {})}
        - Extracurriculars: {profile_data.get('extracurriculars', [])}
        - Parent Careers: {profile_data.get('parent_careers', [])}
        
        Career Data:
        - Match Score: {career_data.get('match_score', 0)}%
        - RIASEC Profile: {career_data.get('riasec_profile', 'N/A')}
        - Primary Subjects: {career_data.get('primary_subjects', [])}
        - Top Reasons: {career_data.get('top_reasons', [])}
        
        Provide a comprehensive analysis including:
        1. Detailed explanation of the career fit
        2. Top 3 key alignment factors
        3. Potential challenges or areas to improve
        4. Confidence level assessment
        """
        
        return self.generate_structured_content(prompt, CareerExplanation, max_tokens=400)
    
    def generate_structured_study_path(
        self, 
        career_name: str, 
        profile_data: Dict, 
        career_data: Dict
    ) -> StudyPathRecommendation:
        """Generate structured study path recommendation"""
        prompt = f"""
        Generate a personalized, structured study path for a student interested in {career_name}.
        
        Student Profile:
        - Grade: {profile_data.get('grade', 'N/A')}
        - Current Subject Scores: {profile_data.get('subject_scores', {})}
        - Extracurriculars: {profile_data.get('extracurriculars', [])}
        
        Career Requirements:
        - Primary Subjects: {career_data.get('primary_subjects', [])}
        - Study Path: {career_data.get('study_path', [])}
        - First 3 Steps: {career_data.get('first3_steps', [])}
        
        Provide a structured study path with:
        1. 2-3 immediate steps for current grade level
        2. 2-3 medium-term goals (1-2 years)
        3. 2-3 long-term educational path recommendations
        4. Priority subjects to focus on
        """
        
        return self.generate_structured_content(prompt, StudyPathRecommendation, max_tokens=500)
    
    def generate_structured_skill_recommendations(
        self, 
        profile_data: Dict, 
        career_matches: List[Dict]
    ) -> List[SkillRecommendation]:
        """Generate structured skill recommendations"""
        if not career_matches:
            return []
        
        top_careers = [career.get('career_name', '') for career in career_matches[:3]]
        
        prompt = f"""
        Generate 5 specific, structured skill development recommendations for this student.
        
        Student Profile:
        - Grade: {profile_data.get('grade', 'N/A')}
        - Subject Scores: {profile_data.get('subject_scores', {})}
        - Extracurriculars: {profile_data.get('extracurriculars', [])}
        
        Top Career Interests: {', '.join(top_careers)}
        
        For each skill recommendation, provide:
        1. Skill name
        2. Category (Technical, Soft Skills, or Academic)
        3. Importance level (Critical, High, Medium, or Low)
        4. Development method
        5. Timeline for development
        
        Focus on skills that are:
        - Relevant to their career interests
        - Appropriate for their current grade level
        - Actionable and specific
        """
        
        # Use SimpleListOutput for multiple skills, then convert
        response = self.generate_structured_content(prompt, SimpleListOutput, max_tokens=600)
        
        # Convert to individual skill recommendations
        skills = []
        for i, item in enumerate(response.items[:5]):
            skills.append(SkillRecommendation(
                skill_name=f"Skill {i+1}",
                category="Technical" if i < 2 else "Soft Skills" if i < 4 else "Academic",
                importance_level="High" if i < 2 else "Medium",
                development_method=item,
                timeline="6-12 months"
            ))
        
        return skills
    
    def generate_structured_personalized_summary(
        self, 
        profile_data: Dict, 
        career_matches: List[Dict], 
        top_buckets_data: List[Dict] = None
    ) -> PersonalizedSummary:
        """Generate structured personalized summary"""
        if not career_matches:
            return PersonalizedSummary(
                student_name=profile_data.get('name', 'Student'),
                personality_analysis="Complete the assessment to get personalized analysis.",
                top_career_fit="Assessment required for career recommendations.",
                actionable_advice="Complete the career assessment to receive personalized guidance.",
                skills_to_develop=["Complete assessment first"],
                motivation_message="Take the assessment to discover your career potential!"
            )
        
        top_career = career_matches[0]
        
        # Build top buckets info
        buckets_info = ""
        if top_buckets_data:
            buckets_info = "\nTop Career Buckets:\n"
            for bucket in top_buckets_data[:3]:
                buckets_info += f"- {bucket.get('bucket_name', 'N/A')} ({bucket.get('bucket_score', 0)}% match)\n"
        
        prompt = f"""
        Write a comprehensive, structured personalized career summary for this student.
        
        Student Profile:
        - Name: {profile_data.get('name', 'Student')}
        - Grade: {profile_data.get('grade', 'N/A')}
        - RIASEC Scores: {profile_data.get('riasec_scores', {})}
        - Subject Scores: {profile_data.get('subject_scores', {})}
        - Extracurriculars: {profile_data.get('extracurriculars', [])}
        - Parent Careers: {profile_data.get('parent_careers', [])}
        
        Top Career Matches:
        - {top_career.get('career_name', 'N/A')} ({top_career.get('match_score', 0)}% match)
        - Bucket: {top_career.get('bucket', 'N/A')}
        {buckets_info}
        
        Provide a structured summary with:
        1. Personality and strengths analysis
        2. Explanation of top career fit
        3. Actionable advice for development
        4. Top 3-5 skills to develop
        5. Motivational message
        """
        
        return self.generate_structured_content(prompt, PersonalizedSummary, max_tokens=500)
    
    def generate_structured_confidence_explanation(
        self, 
        career_name: str, 
        match_score: int, 
        profile_data: Dict
    ) -> ConfidenceExplanation:
        """Generate structured confidence explanation"""
        prompt = f"""
        Explain the confidence level ({match_score}%) for recommending {career_name} to this student.
        
        Student Profile:
        - RIASEC Scores: {profile_data.get('riasec_scores', {})}
        - Subject Scores: {profile_data.get('subject_scores', {})}
        - Extracurriculars: {profile_data.get('extracurriculars', [])}
        
        Provide a structured confidence analysis with:
        1. Top 3 primary factors contributing to this score
        2. Areas where student shows strong alignment
        3. Areas that could improve the match
        4. Overall confidence assessment
        """
        
        return self.generate_structured_content(prompt, ConfidenceExplanation, max_tokens=300)
    
    def _get_fallback_content(self, prompt: str) -> str:
        """Get fallback content when AI generation fails"""
        if "career" in prompt.lower():
            return "This career aligns well with your profile based on your interests and academic performance."
        elif "study" in prompt.lower():
            return "Focus on building relevant skills and gaining practical experience in your area of interest."
        elif "confidence" in prompt.lower():
            return "This recommendation is based on strong alignment with your personality and academic profile."
        else:
            return "Based on your profile, this is a suitable career path for your interests and abilities."
    
    def _get_fallback_structured_content(self, response_model: Type[T], prompt: str) -> T:
        """Get fallback structured content when AI generation fails"""
        try:
            # Create fallback data based on the model type
            if response_model == CareerExplanation:
                return CareerExplanation(
                    career_name="Career",
                    explanation="This career aligns well with your profile based on your interests and academic performance.",
                    key_alignment_factors=["Academic performance", "Interest alignment", "Skill compatibility"],
                    potential_challenges=["Skill development", "Experience building"],
                    confidence_level="Medium"
                )
            elif response_model == StudyPathRecommendation:
                return StudyPathRecommendation(
                    career_name="Career",
                    immediate_steps=["Focus on core subjects", "Build foundational skills"],
                    medium_term_goals=["Gain practical experience", "Develop specialized knowledge"],
                    long_term_path=["Pursue higher education", "Build professional network"],
                    priority_subjects=["Mathematics", "Science", "Language Arts"]
                )
            elif response_model == SkillRecommendation:
                return SkillRecommendation(
                    skill_name="Problem Solving",
                    category="Soft Skills",
                    importance_level="High",
                    development_method="Practice with real-world problems",
                    timeline="6-12 months"
                )
            elif response_model == PersonalizedSummary:
                return PersonalizedSummary(
                    student_name="Student",
                    personality_analysis="You show strong analytical and creative abilities.",
                    top_career_fit="Your profile aligns well with analytical and creative fields.",
                    actionable_advice="Focus on building relevant skills and gaining practical experience.",
                    skills_to_develop=["Critical thinking", "Communication", "Technical skills"],
                    motivation_message="You have great potential to succeed in your chosen field."
                )
            elif response_model == ConfidenceExplanation:
                return ConfidenceExplanation(
                    career_name="Career",
                    match_score=75,
                    primary_factors=["Academic alignment", "Interest match", "Skill compatibility"],
                    strength_areas=["Analytical thinking", "Problem solving"],
                    improvement_areas=["Practical experience", "Specialized knowledge"],
                    overall_confidence="Good match with room for growth"
                )
            elif response_model == SimpleListOutput:
                return SimpleListOutput(
                    items=["Focus on core subjects", "Build practical skills", "Gain experience"]
                )
            else:
                # Generic fallback - try to create with minimal required fields
                return response_model()
        except Exception as e:
            print(f"Error creating fallback structured content: {e}")
            # Return a basic instance if all else fails
            return response_model()
