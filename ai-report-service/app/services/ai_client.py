import os
import json
import time
import logging
from typing import Dict, List, Optional, Type, TypeVar, Union
from openai import OpenAI, RateLimitError
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

# Configure logging
logger = logging.getLogger(__name__)

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
        Generate content using AI model with retry logic for rate limits
        
        Args:
            prompt: The prompt to send to the AI model
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated content string
        """
        max_retries = 3
        base_delay = 5  # Base delay in seconds
        
        for attempt in range(max_retries):
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
                
            except RateLimitError as e:
                if attempt < max_retries - 1:
                    # Exponential backoff: 5s, 10s, 20s
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Rate limit hit (attempt {attempt + 1}/{max_retries}). Waiting {delay}s before retry...")
                    time.sleep(delay)
                    continue
                else:
                    logger.error(f"Rate limit error after {max_retries} attempts: {e}")
                    return self._get_fallback_content(prompt)
                    
            except Exception as e:
                error_str = str(e).lower()
                # Check if it's a rate limit error (429) from Groq or other providers
                if "429" in error_str or "rate limit" in error_str or "too many requests" in error_str:
                    if attempt < max_retries - 1:
                        # Exponential backoff: 5s, 10s, 20s
                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"Rate limit hit (attempt {attempt + 1}/{max_retries}). Waiting {delay}s before retry...")
                        time.sleep(delay)
                        continue
                    else:
                        logger.error(f"Rate limit error after {max_retries} attempts: {e}")
                        return self._get_fallback_content(prompt)
                else:
                    logger.error(f"Error generating AI content with {self.provider}: {e}")
                    return self._get_fallback_content(prompt)
        
        # Fallback if all retries failed
        return self._get_fallback_content(prompt)
    
    def generate_structured_content(
        self, 
        prompt: str, 
        response_model: Type[T], 
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> T:
        """
        Generate structured content using AI model with Pydantic validation and retry logic
        
        Args:
            prompt: The prompt to send to the AI model
            response_model: Pydantic model class for structured output
            max_tokens: Maximum tokens to generate
            temperature: Temperature for response generation
            
        Returns:
            Parsed Pydantic model instance
        """
        max_retries = 3
        base_delay = 5  # Base delay in seconds
        
        for attempt in range(max_retries):
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
                    
                    # Log the actual response for debugging
                    logger.debug(f"Groq JSON response for {response_model.__name__}: {content[:200]}...")
                    
                    # Try to parse and validate
                    try:
                        parsed_data = response_model.model_validate_json(content)
                        return parsed_data
                    except Exception as parse_error:
                        logger.warning(f"JSON parsing error: {parse_error}")
                        logger.debug(f"Full response content: {content}")
                        # Try to extract just the explanation field if it's a CareerExplanation
                        if response_model.__name__ == "CareerExplanation":
                            import json
                            try:
                                json_data = json.loads(content)
                                # Try to find the explanation field with different possible keys
                                explanation_text = (
                                    json_data.get("explanation") or
                                    json_data.get("career_match_explanation") or
                                    json_data.get("detailed_explanation") or
                                    json_data.get("analysis") or
                                    str(json_data)
                                )
                                if explanation_text and len(explanation_text) > 50:
                                    # Return a valid CareerExplanation with the extracted explanation
                                    return response_model(
                                        career_name=json_data.get("career_name", "Career"),
                                        explanation=explanation_text,
                                        key_alignment_factors=json_data.get("key_alignment_factors", ["Strong profile match", "Academic alignment", "Interest compatibility"]),
                                        potential_challenges=json_data.get("potential_challenges", ["Skill development", "Experience building"]),
                                        confidence_level=json_data.get("confidence_level", "Medium")
                                    )
                            except Exception as e:
                                logger.error(f"Error extracting explanation from JSON: {e}")
                        
                        raise parse_error
                
            except RateLimitError as e:
                if attempt < max_retries - 1:
                    # Exponential backoff: 5s, 10s, 20s
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Rate limit hit (attempt {attempt + 1}/{max_retries}). Waiting {delay}s before retry...")
                    time.sleep(delay)
                    continue
                else:
                    logger.error(f"Rate limit error after {max_retries} attempts: {e}")
                    return self._get_fallback_structured_content(response_model, prompt)
                    
            except Exception as e:
                error_str = str(e).lower()
                # Check if it's a rate limit error (429) from Groq or other providers
                if "429" in error_str or "rate limit" in error_str or "too many requests" in error_str:
                    if attempt < max_retries - 1:
                        # Exponential backoff: 5s, 10s, 20s
                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"Rate limit hit (attempt {attempt + 1}/{max_retries}). Waiting {delay}s before retry...")
                        time.sleep(delay)
                        continue
                    else:
                        logger.error(f"Rate limit error after {max_retries} attempts: {e}")
                        return self._get_fallback_structured_content(response_model, prompt)
                else:
                    logger.error(f"Error generating structured AI content with {self.provider}: {e}")
                    return self._get_fallback_structured_content(response_model, prompt)
        
        # Fallback if all retries failed
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
            Personalized summary paragraph (formatted with bullets + short paragraphs)
        """
        try:
            structured_summary = self.generate_structured_personalized_summary(profile_data, career_matches, top_buckets_data)
            # Combine personality analysis, career fit, and actionable advice into structured format
            # Keep the structured format with bullets and short paragraphs
            summary_parts = []
            
            # Add personality analysis
            if structured_summary.personality_analysis:
                summary_parts.append(structured_summary.personality_analysis)
            
            # Add career fit or skill focus
            if structured_summary.top_career_fit:
                summary_parts.append(structured_summary.top_career_fit)
            
            # Add actionable advice
            if structured_summary.actionable_advice:
                summary_parts.append(structured_summary.actionable_advice)
            
            # Join with line breaks to preserve formatting
            return "\n\n".join(summary_parts)
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
    
    def generate_detailed_skill_recommendations(self, profile_data: Dict, career_matches: List[Dict]) -> List[Dict[str, str]]:
        """
        Generate detailed skill development recommendations for students below 8th standard
        
        Args:
            profile_data: Student profile data
            career_matches: List of career matches (used to extract skills, not shown to student)
            
        Returns:
            List of dicts with 'skill_name' and 'explanation' keys for detailed skill recommendations
        """
        try:
            grade = profile_data.get('grade', 0)
            structured_skills = self.generate_structured_skill_recommendations(profile_data, career_matches)
            
            # For grade < 8, generate detailed skill descriptions
            skill_recommendations = []
            for skill in structured_skills:
                # Skip if skill name is generic (Skill 1, Skill 2, etc.)
                if skill.skill_name.lower().startswith('skill') and skill.skill_name.lower().replace('skill', '').strip().isdigit():
                    # Use a descriptive name based on index
                    skill_index = int(skill.skill_name.lower().replace('skill', '').strip()) - 1
                    skill_names = [
                        "Problem Solving", "Critical Thinking", "Mathematical Reasoning",
                        "Communication Skills", "Teamwork", "Creative Expression",
                        "Research Skills", "Digital Literacy"
                    ]
                    skill.skill_name = skill_names[skill_index % len(skill_names)]
                
                # Generate detailed explanation for each skill
                try:
                    skill_explanation = self.generate_detailed_skill_explanation(
                        skill.skill_name, 
                        profile_data, 
                        {
                            'category': skill.category,
                            'importance_level': skill.importance_level,
                            'development_method': skill.development_method,
                            'timeline': skill.timeline
                        }
                    )
                    
                    # Store as dict with skill_name and explanation (separate for PDF display)
                    skill_recommendations.append({
                        "skill_name": skill.skill_name,
                        "explanation": skill_explanation.strip()
                    })
                except Exception as e:
                    logger.error(f"Error generating detailed explanation for {skill.skill_name}: {e}")
                    # Fallback to basic format with skill name and explanation
                    skill_recommendations.append({
                        "skill_name": skill.skill_name,
                        "explanation": f"{skill.development_method} (Timeline: {skill.timeline})"
                    })
            
            return skill_recommendations[:8]  # Return top 8 detailed skills
            
        except Exception as e:
            logger.error(f"Error generating detailed skill recommendations: {e}")
            # Fallback to basic recommendations
            return self._get_fallback_skill_recommendations(profile_data, career_matches)
    
    def generate_detailed_skill_explanation(
        self, 
        skill_name: str, 
        profile_data: Dict, 
        skill_data: Dict
    ) -> str:
        """
        Generate detailed skill explanation for students below 8th standard
        
        Args:
            skill_name: Name of the skill
            profile_data: Student profile data
            skill_data: Skill data with category, importance, development method, timeline
            
        Returns:
            Detailed skill explanation string
        """
        try:
            grade = profile_data.get('grade', 0)
            
            prompt = f"""
            Generate a detailed, age-appropriate explanation for developing the skill: {skill_name}
            
            Student Profile:
            - Grade: {grade}
            - Subject Scores: {profile_data.get('subject_scores', {})}
            - Extracurriculars: {profile_data.get('extracurriculars', [])}
            - RIASEC Scores: {profile_data.get('riasec_scores', {})}
            
            Skill Information:
            - Category: {skill_data.get('category', 'General')}
            - Importance Level: {skill_data.get('importance_level', 'Medium')}
            - Development Method: {skill_data.get('development_method', 'Practice regularly')}
            - Timeline: {skill_data.get('timeline', '6-12 months')}
            
            IMPORTANT GUIDELINES FOR GRADE < 8:
            1. Use age-appropriate language (simple, encouraging, not technical jargon)
            2. DO NOT mention specific careers or career names
            3. Focus on why this skill is useful for exploring different areas
            4. Provide practical, hands-on development methods
            5. Make it exciting and engaging for young students
            6. MUST be SHORT: 10 lines maximum total
            7. Include 2-3 bullet points for key development methods
            8. Use encouraging language like "This skill helps you explore..." instead of "This skill is needed for [career]"
            9. Be concise and direct - no long explanations
            
            Format:
            "{skill_name} is about [simple explanation in 1-2 sentences]. This skill helps you [why it's useful in 1 sentence].
            
            • [Development method 1 - practical and age-appropriate]
            • [Development method 2 - fun and engaging]
            • [Development method 3 - hands-on activity]
            
            [1-2 short concluding sentences - keep it brief!]"
    
            """
            
            return self.generate_content(prompt, max_tokens=200)
            
        except Exception as e:
            print(f"Error generating detailed skill explanation: {e}")
            # Fallback to basic format
            return f"{skill_name}: {skill_data.get('development_method', 'Practice regularly')} (Timeline: {skill_data.get('timeline', '6-12 months')})"
    
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
    
    def generate_skill_development_trajectory(self, profile_data: Dict, career_matches: List[Dict]) -> str:
        """
        Generate skill development trajectory insights for students below 8th standard
        
        Args:
            profile_data: Student profile data
            career_matches: List of career matches (used to extract skills, not shown to student)
            
        Returns:
            Skill development trajectory insights string
        """
        try:
            if not career_matches:
                return "Complete the assessment to get skill development insights."
            
            grade = profile_data.get('grade', 0)
            
            # Extract skill-related data from career matches (without naming careers)
            primary_subjects = []
            riasec_profiles = []
            buckets = []
            
            for career in career_matches[:3]:
                if career.get('primary_subjects'):
                    primary_subjects.extend(career.get('primary_subjects', []))
                if career.get('riasec_profile'):
                    riasec_profiles.append(career.get('riasec_profile'))
                if career.get('bucket'):
                    buckets.append(career.get('bucket'))
            
            # Get unique values
            primary_subjects = list(set(primary_subjects))[:3]
            
            prompt = f"""
            Generate an encouraging skill development trajectory for a student in grade {grade}.
            
            Student Profile:
            - Grade: {grade}
            - Subject Scores: {profile_data.get('subject_scores', {})}
            - Extracurriculars: {profile_data.get('extracurriculars', [])}
            - RIASEC Scores: {profile_data.get('riasec_scores', {})}
            
            Areas of Interest (based on assessment):
            - Key Subjects: {', '.join(primary_subjects) if primary_subjects else 'Various subjects'}
            - Personality Traits: {', '.join(riasec_profiles) if riasec_profiles else 'Various interests'}
            
            IMPORTANT GUIDELINES FOR GRADE < 8:
            1. Use age-appropriate, encouraging language
            2. DO NOT mention specific careers or career names
            3. Focus on skill-building and exploration
            4. Provide immediate, medium-term, and long-term skill development steps
            5. Make it exciting and engaging
            6. Emphasize exploration and discovery
            7. Use language like "Your skill development journey" instead of "Your career path"
            8. MUST be CONCISE: 12-15 lines maximum total
            9. Less verbose, more on-point and actionable
            10. Use short paragraphs (1-2 sentences each)
            
            Format (12-15 lines max):
            "Your skill development journey can start now! 
            
            • [Immediate step 1]
            • [Immediate step 2]
            
            [1-2 sentences about immediate focus]
            
            • [Medium-term goal 1]
            • [Medium-term goal 2]
            
            [1-2 sentences about medium-term goals]
            
            [1-2 sentences about long-term pathway]"
            """
            
            return self.generate_content(prompt, max_tokens=250)
            
        except Exception as e:
            print(f"Error generating skill development trajectory: {e}")
            # Fallback to basic trajectory
            if not career_matches:
                return "Complete the assessment to get skill development insights."
            
            primary_subjects = []
            for career in career_matches[:3]:
                if career.get('primary_subjects'):
                    primary_subjects.extend(career.get('primary_subjects', []))
            
            primary_subjects = list(set(primary_subjects))[:2]
            grade = profile_data.get('grade', 0)
            
            return f"Your skill development journey can start now! Focus on building strong foundations " \
                   f"in {', '.join(primary_subjects) if primary_subjects else 'relevant subjects'} during your current studies. " \
                   f"Engage in hands-on projects and activities that interest you. " \
                   f"As you progress, continue exploring different areas and building practical skills " \
                   f"through projects, experiments, and real-world experiences."
    
    def generate_skill_focused_summary(self, profile_data: Dict, career_matches: List[Dict]) -> str:
        """
        Generate skill-focused summary for students below 8th standard
        
        Args:
            profile_data: Student profile data
            career_matches: List of career matches (used to extract skills, not shown to student)
            
        Returns:
            Skill-focused summary string
        """
        try:
            grade = profile_data.get('grade', 0)
            name = profile_data.get('name', 'Student')
            
            # Extract skill-related data from career matches (without naming careers)
            primary_subjects = []
            riasec_profiles = []
            buckets = []
            
            for career in career_matches[:3]:
                if career.get('primary_subjects'):
                    primary_subjects.extend(career.get('primary_subjects', []))
                if career.get('riasec_profile'):
                    riasec_profiles.append(career.get('riasec_profile'))
                if career.get('bucket'):
                    buckets.append(career.get('bucket'))
            
            # Get unique values
            primary_subjects = list(set(primary_subjects))[:3]
            
            # Format RIASEC scores for context
            riasec_scores = profile_data.get('riasec_scores', {})
            top_traits = sorted(riasec_scores.items(), key=lambda x: x[1], reverse=True)[:2]
            trait_names = {
                'R': 'practical and hands-on',
                'I': 'analytical and curious',
                'A': 'creative and expressive',
                'S': 'helpful and people-focused',
                'E': 'leadership and business-minded',
                'C': 'organized and detail-oriented'
            }
            top_trait_descriptions = [trait_names.get(trait[0], trait[0]) for trait in top_traits if trait[1] > 20]
            
            prompt = f"""
            Generate an encouraging, skill-focused summary for {name}, a student in grade {grade}.
            
            Student Profile:
            - Name: {name}
            - Grade: {grade}
            - Subject Scores: {profile_data.get('subject_scores', {})}
            - Extracurriculars: {profile_data.get('extracurriculars', [])}
            - Top Personality Traits: {', '.join(top_trait_descriptions) if top_trait_descriptions else 'various interests'}
            
            Areas of Interest (based on assessment, but DO NOT mention careers):
            - Key Subjects: {', '.join(primary_subjects) if primary_subjects else 'Various subjects'}
            - Personality Traits: {', '.join(riasec_profiles) if riasec_profiles else 'Various interests'}
            
            IMPORTANT GUIDELINES FOR GRADE < 8:
            1. Use age-appropriate, encouraging language
            2. DO NOT mention specific careers, career names, or job titles
            3. Focus on skill development and exploration
            4. Highlight their strengths and interests
            5. Provide encouraging, actionable advice
            6. Use language like "skills that help you explore" instead of "skills for [career]"
            7. Make it exciting and engaging for young students
            8. MUST be VERY SHORT: 3-4 lines maximum total
            9. Be concise and direct - one short paragraph only
            10. Focus on key strengths and skill-building encouragement
            
            Format (3-4 lines max):
            "{name} — you have amazing potential! Your [strength] shows you're ready to explore and grow. 
            Focus on building foundational skills like [skill1] and [skill2] through hands-on projects and activities. 
            Keep exploring and learning — every skill you build opens new possibilities!"
            """
            
            return self.generate_content(prompt, max_tokens=150)
            
        except Exception as e:
            print(f"Error generating skill-focused summary: {e}")
            # Fallback to basic skill-focused summary
            name = profile_data.get('name', 'Student')
            grade = profile_data.get('grade', 0)
            
            primary_subjects = []
            for career in career_matches[:3]:
                if career.get('primary_subjects'):
                    primary_subjects.extend(career.get('primary_subjects', []))
            
            primary_subjects = list(set(primary_subjects))[:2]
            
            return f"{name} — you have great potential! Based on your interests and strengths, " \
                   f"we recommend focusing on building foundational skills in {', '.join(primary_subjects) if primary_subjects else 'relevant subjects'}. " \
                   f"These skills will help you explore different areas and discover what you enjoy most. " \
                   f"Keep learning and building your skills through projects and activities you find interesting."
    
    # New structured output methods
    def generate_structured_career_explanation(
        self, 
        career_name: str, 
        profile_data: Dict, 
        career_data: Dict
    ) -> CareerExplanation:
        """Generate structured career explanation"""
        # Format RIASEC scores for better readability
        riasec_scores = profile_data.get('riasec_scores', {})
        riasec_text = ", ".join([f"{k}: {v}%" for k, v in riasec_scores.items()]) if riasec_scores else "Not available"
        
        # Format subject scores
        subject_scores = profile_data.get('subject_scores', {})
        subject_text = ", ".join([f"{k}: {v}%" for k, v in subject_scores.items()]) if subject_scores else "Not available"
        
        # Get top reasons
        top_reasons = career_data.get('top_reasons', [])
        reasons_text = "\n".join([f"- {reason}" for reason in top_reasons[:5]]) if top_reasons else "Strong overall alignment"
        
        prompt = f"""
        You are an expert career counselor analyzing why {career_name} is a strong career match for this student.
        
        STUDENT PROFILE:
        Name: {profile_data.get('name', 'Student')}
        Grade: {profile_data.get('grade', 'N/A')}
        
        PERSONALITY PROFILE (RIASEC Scores):
        {riasec_text}
        
        ACADEMIC PERFORMANCE (Subject Scores):
        {subject_text}
        
        EXTRACURRICULAR ACTIVITIES:
        {', '.join(profile_data.get('extracurriculars', [])) if profile_data.get('extracurriculars') else 'None listed'}
        
        PARENT/PARENTAL CAREER BACKGROUND:
        {', '.join(profile_data.get('parent_careers', [])) if profile_data.get('parent_careers') else 'None listed'}
        
        CAREER MATCH DATA:
        Match Score: {career_data.get('match_score', 0)}%
        Required RIASEC Profile: {career_data.get('riasec_profile', 'N/A')}
        Key Subjects: {', '.join(career_data.get('primary_subjects', [])) if career_data.get('primary_subjects') else 'N/A'}
        
        TOP REASONS FOR THIS MATCH:
        {reasons_text}
        
        TASK:
        Write a DETAILED, PERSONALIZED explanation (2-3 sentences minimum) that:
        1. Specifically mentions the student's actual RIASEC scores and how they align with {career_name}
        2. References their actual subject performance and how it relates to this career
        3. Mentions specific extracurricular activities if relevant
        4. Explains why the {career_data.get('match_score', 0)}% match score is justified
        5. Connects the top reasons listed above to the student's actual profile
        
        DO NOT use generic phrases like "This career aligns well with your profile" or "based on your interests and academic performance."
        Instead, provide SPECIFIC details like "Your 48% Investigative score indicates..." or "Your strong performance in Mathematics (88%) demonstrates..."
        
        
        IMPORTANT: You must respond with a JSON object with EXACTLY these fields:
        {{
            "career_name": "{career_name}",
            "explanation": "Your detailed explanation here (use bullets + short paragraphs, 3-4 sentences total, personalized with specific data)",
            "key_alignment_factors": ["Factor 1", "Factor 2", "Factor 3"],
            "potential_challenges": ["Challenge 1", "Challenge 2"],
            "confidence_level": "High" or "Medium" or "Low"
        }}
        
        The explanation field must be formatted with bullets and short paragraphs for readability.
        """
        
        return self.generate_structured_content(prompt, CareerExplanation, max_tokens=600)
    
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
        
        grade = profile_data.get('grade', 0)
        
        # For grade < 8, use different prompt without mentioning careers
        if grade < 8:
            # Extract skill-related data without naming careers
            primary_subjects = []
            riasec_profiles = []
            buckets = []
            
            for career in career_matches[:5]:
                if career.get('primary_subjects'):
                    primary_subjects.extend(career.get('primary_subjects', []))
                if career.get('riasec_profile'):
                    riasec_profiles.append(career.get('riasec_profile'))
                if career.get('bucket'):
                    buckets.append(career.get('bucket'))
            
            primary_subjects = list(set(primary_subjects))[:5]
            
            prompt = f"""
            Generate 8 specific, structured skill development recommendations for a student in grade {grade}.
            
            Student Profile:
            - Grade: {grade}
            - Subject Scores: {profile_data.get('subject_scores', {})}
            - Extracurriculars: {profile_data.get('extracurriculars', [])}
            - RIASEC Scores: {profile_data.get('riasec_scores', {})}
            
            Areas of Interest (based on assessment, but DO NOT mention careers):
            - Key Subjects: {', '.join(primary_subjects) if primary_subjects else 'Various subjects'}
            - Personality Traits: {', '.join(riasec_profiles) if riasec_profiles else 'Various interests'}
            
            IMPORTANT GUIDELINES FOR GRADE < 8:
            1. DO NOT mention specific careers, career names, or job titles
            2. Focus on foundational skills that help explore different areas
            3. Use age-appropriate language
            4. Make skills exciting and engaging
            5. Focus on skills that are appropriate for their current grade level
            6. Provide practical, hands-on development methods
            7. Use ACTUAL skill names (not "Skill 1", "Skill 2") - e.g., "Problem Solving", "Creative Thinking", "Communication Skills"
            
            For each skill recommendation, provide:
            1. Skill name (ACTUAL skill name like "Problem Solving", "Communication Skills", "Mathematical Reasoning" - NOT "Skill 1")
            2. Category (Technical, Soft Skills, or Academic)
            3. Importance level (High, Medium, or Low)
            4. Development method (age-appropriate, practical, as a descriptive text)
            5. Timeline for development (appropriate for grade {grade})
            
            Focus on skills that are:
            - Foundational and exploratory
            - Appropriate for grade {grade}
            - Actionable through hands-on activities
            - Helpful for exploring different areas of interest
            
            IMPORTANT: Each skill must have a REAL name like:
            - "Problem Solving Skills"
            - "Communication and Presentation"
            - "Creative Thinking"
            - "Mathematical Reasoning"
            - "Teamwork and Collaboration"
            - "Critical Analysis"
            - "Digital Literacy"
            - "Research and Investigation"
            
            Generate 8 skills with ACTUAL skill names (not generic "Skill 1", "Skill 2").
            """
        else:
            # Standard prompt for grade >= 8
            top_careers = [career.get('career_name', '') for career in career_matches[:3]]
            
            prompt = f"""
            Generate 5 specific, structured skill development recommendations for this student.
            
            Student Profile:
            - Grade: {grade}
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
        max_tokens = 800 if grade < 8 else 600
        response = self.generate_structured_content(prompt, SimpleListOutput, max_tokens=max_tokens)
        
        # Convert to individual skill recommendations
        num_skills = 8 if grade < 8 else 5
        skills = []
        
        # Parse skill names and methods from items
        for i, item in enumerate(response.items[:num_skills]):
            # Try to extract skill name and method from item
            # Format might be: "Skill Name: method" or just "Skill Name"
            skill_parts = str(item).split(':', 1)
            skill_name = skill_parts[0].strip() if len(skill_parts) > 0 else f"Skill {i+1}"
            development_method = skill_parts[1].strip() if len(skill_parts) > 1 else item
            
            # Clean up skill name (remove numbers if present)
            if skill_name.startswith(f"{i+1}.") or skill_name.startswith(f"{i+1} "):
                skill_name = skill_name.replace(f"{i+1}.", "").replace(f"{i+1}", "").strip()
            
            # Ensure skill name is not generic
            if skill_name.lower() in ["skill", "skill 1", "skill 2", f"skill {i+1}"]:
                # Generate a descriptive skill name based on category
                if i < 3:
                    skill_name = ["Problem Solving", "Critical Thinking", "Mathematical Reasoning"][i % 3]
                elif i < 6:
                    skill_name = ["Communication Skills", "Teamwork", "Creative Expression"][(i-3) % 3]
                else:
                    skill_name = ["Research Skills", "Digital Literacy"][(i-6) % 2]
            
            skills.append(SkillRecommendation(
                skill_name=skill_name,
                category="Technical" if i < 3 else "Soft Skills" if i < 6 else "Academic",
                importance_level="High" if i < 3 else "Medium",
                development_method=development_method if development_method else item,
                timeline="6-12 months" if grade < 8 else "6-12 months"
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
        grade = profile_data.get('grade', 0)
        is_grade_below_8 = grade < 8
        
        # Build top buckets info
        buckets_info = ""
        if top_buckets_data:
            buckets_info = "\nTop Career Buckets:\n"
            for bucket in top_buckets_data[:3]:
                buckets_info += f"- {bucket.get('bucket_name', 'N/A')} ({bucket.get('bucket_score', 0)}% match)\n"
        
        prompt = f"""
        Write a comprehensive, structured personalized summary for this student.
        
        Student Profile:
        - Name: {profile_data.get('name', 'Student')}
        - Grade: {grade}
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
        
        return self.generate_structured_content(prompt, PersonalizedSummary, max_tokens=600)
    
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
    
    def _get_fallback_skill_recommendations(self, profile_data: Dict, career_matches: List[Dict]) -> List[str]:
        """Get fallback skill recommendations when AI generation fails"""
        grade = profile_data.get('grade', 0)
        
        # Extract skills from career matches
        skills = []
        for career in career_matches[:5]:
            if career.get('primary_subjects'):
                for subject in career.get('primary_subjects', [])[:2]:
                    if grade < 8:
                        skill_name = f"Build strong foundations in {subject}"
                    else:
                        skill_name = f"Master {subject} fundamentals"
                    if skill_name not in skills:
                        skills.append(skill_name)
            
            if career.get('first3_steps'):
                for step in career.get('first3_steps', [])[:2]:
                    if step and step not in skills:
                        skills.append(step)
        
        if not skills:
            if grade < 8:
                return [
                    "Build strong problem-solving skills through puzzles and games",
                    "Develop communication skills through group activities",
                    "Practice creativity through art, writing, or building projects",
                    "Learn basic computer skills and digital literacy",
                    "Build teamwork skills through group projects"
                ]
            else:
                return [
                    "Develop strong problem-solving skills",
                    "Improve communication and presentation abilities",
                    "Build technical skills in your area of interest",
                    "Practice critical thinking and analysis",
                    "Gain hands-on experience through projects"
                ]
        
        return skills[:8] if grade < 8 else skills[:5]
    
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
