import os
import json
import time
import logging
from typing import Dict, List, Optional, Type, TypeVar, Union
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI, RateLimitError
from groq import Groq
from dotenv import load_dotenv
from pydantic import BaseModel
from ..models.structured_outputs import (
    CareerExplanation, StudyPathRecommendation, SkillRecommendation,
    CareerTrajectory, PersonalizedSummary, ConfidenceExplanation,
    CareerInsights, StructuredReportOutput, SimpleListOutput,
    KeyValueOutput, MultiKeyValueOutput, OutputType,
    ActionPlan, ActionPlanItem, CareerSkills, CareerCourses
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
    
    def _get_career_counselor_system_prompt(self, profile_data: Dict = None) -> str:
        """
        Generate the global system prompt for career counseling based on grade and name
        
        Args:
            profile_data: Optional student profile data for grade and name context
            
        Returns:
            System prompt string
        """
        grade = profile_data.get('grade', 0) if profile_data else 0
        name = profile_data.get('name', 'Student') if profile_data else None
        
        # Grade-adaptive tone guidance
        if grade < 8:
            tone_guidance = """- Simple, warm, and exploratory. Short sentences. Focus on curiosity, not decisions. Avoid jargon."""
            grade_context = f"Grade Level: {grade} (Primary/Middle School)"
        elif grade <= 10:
            tone_guidance = """- Clear, engaging, and supportive. Balance encouragement with realism. Use relatable examples."""
            grade_context = f"Grade Level: {grade} (High School - Early Stage)"
        else:
            tone_guidance = """- Mature, direct, and insightful. Empathetic toward academic pressure. Deliver actionable advice."""
            grade_context = f"Grade Level: {grade} (High School - Advanced Stage)"""
        
        name_context = f"\nStudent Name: {name}" if name else ""
        
        system_prompt = f"""You are an **expert career counselor for Indian students**.  
Understand the Indian educational context (CBSE, ICSE, State Boards, competitive exams).

{grade_context}{name_context}

CORE PRINCIPLES:

1. **PERSONALIZATION**
   - Address the student by name.
   - Always cite actual data (e.g., "Your 62% Artistic score shows…" not "You seem creative").
   - Avoid generic language.

2. **EMPATHY & EMOTION**
   - Show care, understanding, and motivation.
   - Recognize academic pressure.
   - Celebrate strengths and reassure during uncertainties.

3. **TONE & STYLE**
   {tone_guidance}
   - Conversational yet professional.
   - Blend short impactful sentences with clear explanations.
   - Always explain the *why* behind each insight.
   - Use vivid, relatable examples and phrasing.

4. **DEPTH & CONTEXT**
   - Link the student's grade, subjects, and scores to their future.
   - Explain *what*, *why*, and *how* of every recommendation.
   - Reference Indian education realities (boards, entrance exams, etc.).

5. **SPECIFICITY**
   - Use real numbers, subject names, and activities.
   - Provide actionable steps — not vague encouragement.

6. **MENTOR APPROACH**
   - Write as a caring mentor who knows them personally.
   - Show excitement about their growth and potential.
   - Balance realism with optimism.

**Goal:** Every message should make the student feel understood, supported, and motivated about their future."""
        
        return system_prompt
    
    def generate_content(self, prompt: str, max_tokens: int = 500, profile_data: Dict = None) -> str:
        """
        Generate content using AI model with retry logic for rate limits
        
        Args:
            prompt: The prompt to send to the AI model
            max_tokens: Maximum tokens to generate
            profile_data: Optional student profile data for system prompt context
            
        Returns:
            Generated content string
        """
        max_retries = 3
        base_delay = 5  # Base delay in seconds
        
        for attempt in range(max_retries):
            try:
                # Log API request
                logger.info(f"[{self.provider.upper()}] API Call - generate_content")
                logger.info(f"  Model: {self.model_name}")
                logger.info(f"  Max Tokens: {max_tokens}, Temperature: 0.7")
                logger.info(f"  Prompt Preview: {prompt[:200]}..." if len(prompt) > 200 else f"  Prompt: {prompt}")
                if attempt > 0:
                    logger.info(f"  Retry Attempt: {attempt + 1}/{max_retries}")
                
                system_prompt = self._get_career_counselor_system_prompt(profile_data)
                
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
                
                # Both OpenAI and Groq use the same API interface
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=0.7
                )
                
                # Log the full response
                response_content = response.choices[0].message.content.strip()
                logger.info(f"[{self.provider.upper()}] API Response - generate_content")
                logger.info(f"  Model: {self.model_name}")
                logger.info(f"  Finish Reason: {response.choices[0].finish_reason}")
                if hasattr(response, 'usage'):
                    logger.info(f"  Token Usage - Prompt: {response.usage.prompt_tokens}, Completion: {response.usage.completion_tokens}, Total: {response.usage.total_tokens}")
                logger.info(f"  Response Content: {response_content[:500]}..." if len(response_content) > 500 else f"  Response Content: {response_content}")
                
                return response_content
                
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
        temperature: float = 0.7,
        profile_data: Dict = None
    ) -> T:
        """
        Generate structured content using AI model with Pydantic validation and retry logic
        
        Args:
            prompt: The prompt to send to the AI model
            response_model: Pydantic model class for structured output
            max_tokens: Maximum tokens to generate
            temperature: Temperature for response generation
            profile_data: Optional student profile data for system prompt context
            
        Returns:
            Parsed Pydantic model instance
        """
        max_retries = 3
        base_delay = 5  # Base delay in seconds
        
        for attempt in range(max_retries):
            try:
                system_prompt = self._get_career_counselor_system_prompt(profile_data)
                
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
                
                # Log API request
                logger.info(f"[{self.provider.upper()}] API Call - generate_structured_content")
                logger.info(f"  Model: {self.model_name}")
                logger.info(f"  Response Model: {response_model.__name__}")
                logger.info(f"  Max Tokens: {max_tokens}, Temperature: {temperature}")
                logger.info(f"  Prompt Preview: {prompt[:200]}..." if len(prompt) > 200 else f"  Prompt: {prompt}")
                if attempt > 0:
                    logger.info(f"  Retry Attempt: {attempt + 1}/{max_retries}")
                
                if self.provider == "openai":
                    # OpenAI Structured Outputs using parse() method
                    completion = self.client.chat.completions.parse(
                        model=self.model_name,
                        messages=messages,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        response_format=response_model
                    )
                    
                    # Log the full response
                    logger.info(f"[{self.provider.upper()}] API Response - generate_structured_content")
                    logger.info(f"  Model: {self.model_name}")
                    logger.info(f"  Response Model: {response_model.__name__}")
                    logger.info(f"  Finish Reason: {completion.choices[0].finish_reason}")
                    if hasattr(completion, 'usage'):
                        logger.info(f"  Token Usage - Prompt: {completion.usage.prompt_tokens}, Completion: {completion.usage.completion_tokens}, Total: {completion.usage.total_tokens}")
                    
                    message = completion.choices[0].message
                    
                    # Log the parsed content if available
                    if hasattr(message, 'parsed') and message.parsed:
                        parsed_json = message.parsed.model_dump_json() if hasattr(message.parsed, 'model_dump_json') else str(message.parsed)
                        logger.info(f"  Parsed Response: {parsed_json[:1000]}..." if len(parsed_json) > 1000 else f"  Parsed Response: {parsed_json}")
                    elif hasattr(message, 'content') and message.content:
                        logger.info(f"  Response Content: {message.content[:1000]}..." if len(message.content) > 1000 else f"  Response Content: {message.content}")
                    
                    # Handle refusals - when the model refuses to fulfill the request
                    if hasattr(message, 'refusal') and message.refusal:
                        logger.warning(f"OpenAI model refused the request: {message.refusal}")
                        return self._get_fallback_structured_content(response_model, prompt)
                    
                    # Handle incomplete responses - when max_tokens is reached
                    if completion.choices[0].finish_reason == "length":
                        logger.warning("OpenAI response was incomplete due to token limit")
                        return self._get_fallback_structured_content(response_model, prompt)
                    
                    # Handle content filter - when content was filtered
                    if completion.choices[0].finish_reason == "content_filter":
                        logger.warning("OpenAI response was filtered due to content policy")
                        return self._get_fallback_structured_content(response_model, prompt)
                    
                    # Access the parsed structured output
                    if hasattr(message, 'parsed') and message.parsed:
                        return message.parsed
                    else:
                        # Fallback to JSON parsing if parsed attribute not available (shouldn't happen with parse())
                        logger.warning("Parsed attribute not available, falling back to JSON parsing")
                        if hasattr(message, 'content') and message.content:
                            content = message.content.strip()
                            return response_model.model_validate_json(content)
                        else:
                            raise ValueError("No parsed content available from OpenAI response")
                        
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
                    
                    # Log the full response
                    logger.info(f"[{self.provider.upper()}] API Response - generate_structured_content")
                    logger.info(f"  Model: {self.model_name}")
                    logger.info(f"  Response Model: {response_model.__name__}")
                    logger.info(f"  Finish Reason: {response.choices[0].finish_reason}")
                    if hasattr(response, 'usage'):
                        logger.info(f"  Token Usage - Prompt: {response.usage.prompt_tokens}, Completion: {response.usage.completion_tokens}, Total: {response.usage.total_tokens}")
                    logger.info(f"  Response Content: {content[:1000]}..." if len(content) > 1000 else f"  Response Content: {content}")
                    
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
            # Prepare all skill data upfront
            skills_to_process = []
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
                
                skills_to_process.append({
                    'skill_name': skill.skill_name,
                    'skill_data': {
                        'category': skill.category,
                        'importance_level': skill.importance_level,
                        'development_method': skill.development_method,
                        'timeline': skill.timeline
                    }
                })
            
            # Define helper function to generate detailed explanation for a single skill
            def generate_skill_explanation(skill_info):
                skill_name = skill_info['skill_name']
                skill_data = skill_info['skill_data']
                
                try:
                    skill_explanation = self.generate_detailed_skill_explanation(
                        skill_name, 
                        profile_data, 
                        skill_data
                    )
                    
                    return {
                        "skill_name": skill_name,
                        "explanation": skill_explanation.strip()
                    }
                except Exception as e:
                    logger.error(f"Error generating detailed explanation for {skill_name}: {e}")
                    # Fallback to basic format with skill name and explanation
                    return {
                        "skill_name": skill_name,
                        "explanation": f"{skill_data.get('development_method', 'Practice regularly')} (Timeline: {skill_data.get('timeline', '6-12 months')})"
                    }
            
            # Generate detailed explanations for all skills in parallel
            skill_recommendations = []
            with ThreadPoolExecutor(max_workers=8) as executor:
                future_results = [executor.submit(generate_skill_explanation, skill_info) for skill_info in skills_to_process[:8]]
                
                # Compile results from all futures
                for future in as_completed(future_results):
                    result = future.result()
                    skill_recommendations.append(result)
            
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
            
            prompt = f"""Create a short, age-appropriate explanation for the skill: {skill_name}

STUDENT PROFILE:
- Grade: {grade}
- Subject Scores: {profile_data.get('subject_scores', {})}
- Extracurriculars: {profile_data.get('extracurriculars', [])}
- RIASEC Scores: {profile_data.get('riasec_scores', {})}

SKILL DETAILS:
- Category: {skill_data.get('category', 'General')}
- Importance Level: {skill_data.get('importance_level', 'Medium')}
- Development Method: {skill_data.get('development_method', 'Practice regularly')}
- Timeline: {skill_data.get('timeline', '6–12 months')}

GUIDELINES:
- Simple, fun, and motivating tone.
- Never mention careers or job names.
- Focus on *exploration and usefulness*.
- Use this format:

"{skill_name} helps you [simple explanation, 1–2 sentences].  
This skill helps you [why it's useful].

• [Fun or hands-on activity]  
• [Practice suggestion]  
• [Team or creative method]

[1–2 line conclusion – encouraging and positive]"
"""
            
            return self.generate_content(prompt, max_tokens=200, profile_data=profile_data)
            
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
            
            # Format RIASEC scores for context
            riasec_scores = profile_data.get('riasec_scores', {})
            sorted_scores = sorted(riasec_scores.items(), key=lambda x: x[1], reverse=True)
            top_3_traits = [f"{code} ({score})" for code, score in sorted_scores[:3]]
            
            prompt = f"""Generate a short, insightful paragraph (2-3 sentences) about this student's work style based **ONLY on their RIASEC personality traits**.
            
            PROFILE:
            - Name: {profile_data.get('name', 'Student')}
            - Grade: {profile_data.get('grade', 'N/A')}
            - Top RIASEC Traits: {', '.join(top_3_traits)}
            
            GUIDELINES:
            - Focus on their natural working style, problem-solving approach, and environment preferences.
            - **DO NOT name specific careers.**
            - **DO NOT give advice or recommendations.**
            - Just provide insights into *who they are* based on their traits (e.g., "You naturally enjoy...", "Your strength lies in...").
            - Be encouraging and professional.
            """
            
            return self.generate_content(prompt, max_tokens=200, profile_data=profile_data)
            
        except Exception as e:
            print(f"Error generating RIASEC insights: {e}")
            if not career_matches:
                return "Complete the assessment to get career trajectory insights."
            return self._get_fallback_content("RIASEC insights")
    
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
            
            prompt = f"""Generate a short, engaging **skill development trajectory** for a grade {grade} student.

PROFILE:
- Grade: {grade}
- Subject Scores: {profile_data.get('subject_scores', {})}
- Extracurriculars: {profile_data.get('extracurriculars', [])}
- RIASEC Scores: {profile_data.get('riasec_scores', {})}

INTEREST AREAS:
- Key Subjects: {', '.join(primary_subjects) or 'Various subjects'}
- Personality Traits: {', '.join(riasec_profiles) or 'Various interests'}

FORMAT (5–6 sentences):
1. Immediate focus — what to start exploring now.  
2. Medium-term growth — next-level challenges or projects.  
3. Long-term vision — how ongoing learning supports broader discovery.

Use simple, motivational tone. Avoid career references."""
            
            return self.generate_content(prompt, max_tokens=350, profile_data=profile_data)
            
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

    def generate_career_skills(self, career_name: str, profile_data: Dict, career_data: Dict) -> List[str]:
        """
        Generate dedicated skills for a specific career
        
        Args:
            career_name: Name of the career
            profile_data: Student profile data
            career_data: Career match data
            
        Returns:
            List of recommended skills
        """
        try:
            structured_skills = self.generate_structured_career_skills(career_name, profile_data, career_data)
            return structured_skills.skills[:5]  # Return top 5 skills
        except Exception as e:
            print(f"Error generating structured career skills: {e}")
            # Fallback to generic skills
            return [
                f"Foundational knowledge in {career_name}",
                "Problem solving",
                "Critical thinking",
                "Communication skills",
                "Technical aptitude"
            ]
    
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
            
            prompt = f"""Generate a short, encouraging skill-focused summary for {name}, a grade {grade} student.

PROFILE:
- Name: {name}
- Grade: {grade}
- Subject Scores: {profile_data.get('subject_scores', {})}
- Extracurriculars: {profile_data.get('extracurriculars', [])}
- Top Traits: {', '.join(top_trait_descriptions) or 'various interests'}

INTERESTS:
- Key Subjects: {', '.join(primary_subjects) or 'Various subjects'}
- Personality Traits: {', '.join(riasec_profiles) or 'Various interests'}

Keep it **3–4 lines maximum**:
"{name}, you have incredible potential! Your [strength] shows how ready you are to explore and grow.  
Keep building skills like [skill1] and [skill2] through fun projects and teamwork.  
Every step you take builds confidence — keep learning and enjoying the journey!"
"""
            
            return self.generate_content(prompt, max_tokens=150, profile_data=profile_data)
            
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
        
        prompt = f"""You are an expert career counselor explaining why {career_name} is a strong match for this student.

CAREER DATA
- Match Score: {career_data.get('match_score', 0)}%
- Required RIASEC Profile: {career_data.get('riasec_profile', 'N/A')}
- Key Subjects: {', '.join(career_data.get('primary_subjects', [])) or 'N/A'}

TOP MATCH REASONS:
{reasons_text}

TASK:
Provide a **concise career explanation** focused solely on {career_name} itself. DO NOT repeat student details, RIASEC scores, or subject scores.

Requirements:
1. Focus ONLY on the career - what it involves, why it's interesting, what makes it a good fit
2. Maximum 4-5 single sentence bullet points
3. Be concise and direct - no verbose explanations
4. Do not mention specific student data or scores
5. Focus on career characteristics, opportunities, and fit

Format the explanation as 3-4 bullet points, each a single sentence explaining an aspect of why {career_name} is a good match.

Respond strictly in JSON with this schema:
{{
  "career_name": "{career_name}",
  "explanation": "3-4 single sentence bullet points explaining the career match (no student data, no RIASEC scores, just career focus)",
  "key_alignment_factors": ["Factor 1", "Factor 2", "Factor 3"],
  "potential_challenges": ["Challenge 1", "Challenge 2"],
  "confidence_level": "High" | "Medium" | "Low"
}}"""
        
        return self.generate_structured_content(prompt, CareerExplanation, max_tokens=300, profile_data=profile_data)
    
    def generate_structured_study_path(
        self, 
        career_name: str, 
        profile_data: Dict, 
        career_data: Dict
    ) -> StudyPathRecommendation:
        """Generate structured study path recommendation"""
        prompt = f"""Generate a structured, personalized **study path** for a student interested in {career_name}.

STUDENT PROFILE:
- Grade: {profile_data.get('grade', 'N/A')}
- Subject Scores: {profile_data.get('subject_scores', {})}
- Extracurriculars: {profile_data.get('extracurriculars', [])}

CAREER REQUIREMENTS:
- Core Subjects: {career_data.get('primary_subjects', [])}
- General Study Path: {career_data.get('study_path', [])}
- Initial Steps: {career_data.get('first3_steps', [])}

Provide a structured plan with:
1. **Immediate Steps (current grade)** — 2–3 short, practical actions.
2. **Medium-Term Goals (1–2 years)** — study milestones or certifications.
3. **Long-Term Path (college & beyond)** — educational trajectory.
4. **Priority Subjects** — highlight top 2–3.

Be specific, motivational, and realistic."""
        
        return self.generate_structured_content(prompt, StudyPathRecommendation, max_tokens=500, profile_data=profile_data)
    
    def generate_structured_career_skills(
        self, 
        career_name: str, 
        profile_data: Dict, 
        career_data: Dict
    ) -> CareerSkills:
        """Generate structured career skills"""
        prompt = f"""Generate 5-7 dedicated skills required for {career_name}.
        
STUDENT PROFILE:
- Grade: {profile_data.get('grade', 'N/A')}
- Subject Scores: {profile_data.get('subject_scores', {})}

CAREER REQUIREMENTS:
- Core Subjects: {career_data.get('primary_subjects', [])}

Provide a list of 5-7 specific skills (technical or soft) that are crucial for this career.
Focus on skills that a student in grade {profile_data.get('grade', 'N/A')} can start developing.

Respond strictly in JSON with this schema:
{{
  "career_name": "{career_name}",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
}}"""
        
        return self.generate_structured_content(prompt, CareerSkills, max_tokens=300, profile_data=profile_data)
    
    def generate_structured_career_courses(
        self, 
        career_name: str, 
        profile_data: Dict, 
        career_data: Dict
    ) -> CareerCourses:
        """Generate structured career courses"""
        prompt = f"""Generate 3 specific courses or certifications for {career_name}.
        
STUDENT PROFILE:
- Grade: {profile_data.get('grade', 'N/A')}
- Subject Scores: {profile_data.get('subject_scores', {})}

CAREER REQUIREMENTS:
- Core Subjects: {career_data.get('primary_subjects', [])}

Provide a list of 3 specific, real-world courses, certifications, or learning paths (e.g., Coursera, edX, specific university degrees, or certifications) relevant to this career.
Focus on what a student in grade {profile_data.get('grade', 'N/A')} can explore or plan for.
**IMPORTANT**: Keep each course name **concise and short** (maximum 6 words). Do NOT add explanations or descriptions.

Respond strictly in JSON with this schema:
{{
  "career_name": "{career_name}",
  "courses": ["Course 1", "Course 2", "Course 3"]
}}"""
        
        return self.generate_structured_content(prompt, CareerCourses, max_tokens=300, profile_data=profile_data)

    def generate_career_courses(self, career_name: str, profile_data: Dict, career_data: Dict) -> List[str]:
        """
        Generate dedicated courses for a specific career
        
        Args:
            career_name: Name of the career
            profile_data: Student profile data
            career_data: Career match data
            
        Returns:
            List of recommended courses
        """
        try:
            structured_courses = self.generate_structured_career_courses(career_name, profile_data, career_data)
            return structured_courses.courses[:3]  # Return top 3 courses
        except Exception as e:
            print(f"Error generating structured career courses: {e}")
            # Fallback to generic courses
            return [
                f"Introductory course in {career_name}",
                "Relevant online certification",
                "University degree program"
            ]
    
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
            
            prompt = f"""Generate 8 **specific skill recommendations** for a student in grade {grade}.

STUDENT PROFILE:
- Grade: {grade}
- Subject Scores: {profile_data.get('subject_scores', {})}
- Extracurriculars: {profile_data.get('extracurriculars', [])}
- RIASEC Scores: {profile_data.get('riasec_scores', {})}

INTEREST AREAS:
- Key Subjects: {', '.join(primary_subjects) or 'Various subjects'}
- Personality Traits: {', '.join(riasec_profiles) or 'Various interests'}

GUIDELINES:
1. Do NOT mention careers or job titles.
2. Use **simple, encouraging language**.
3. Keep it short — **10 lines max total**.
4. Make it fun, actionable, and curiosity-driven.
5. Each skill includes:
   - Skill Name
   - Category (Technical | Soft Skills | Academic)
   - Importance Level (Critical | High | Medium | Low)
   - Development Method (2–3 concise bullet-style suggestions)
   - Timeline (e.g., 3–6 months, 6–12 months)

Ensure every skill feels attainable and exciting for the student."""
        else:
            # Standard prompt for grade >= 8
            top_careers = [career.get('career_name', '') for career in career_matches[:3]]
            
            prompt = f"""Generate 5 specific, actionable skill recommendations for this student.

STUDENT PROFILE:
- Grade: {grade}
- Subject Scores: {profile_data.get('subject_scores', {})}
- Extracurriculars: {profile_data.get('extracurriculars', [])}

Top Career Interests: {', '.join(top_careers)}

Each skill should include:
- Skill Name
- Category (Technical | Soft Skills | Academic)
- Importance Level (Critical | High | Medium | Low)
- Development Method (specific actions)
- Timeline (time to develop)

Focus on:
- Career relevance
- Realistic for current grade
- Concrete and measurable outcomes"""
        
        # Use SimpleListOutput for multiple skills, then convert
        max_tokens = 800 if grade < 8 else 600
        response = self.generate_structured_content(prompt, SimpleListOutput, max_tokens=max_tokens, profile_data=profile_data)
        
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
        
        # Analyze RIASEC scores
        riasec_scores = profile_data.get('riasec_scores', {})
        
        # RIASEC Code Mapping
        riasec_map = {
            'R': 'Realistic (Doers)',
            'I': 'Investigative (Thinkers)',
            'A': 'Artistic (Creators)',
            'S': 'Social (Helpers)',
            'E': 'Enterprising (Persuaders)',
            'C': 'Conventional (Organizers)'
        }
        
        # Sort scores by value descending
        sorted_scores = sorted(riasec_scores.items(), key=lambda x: x[1], reverse=True)
        # Get top 3 codes and their scores with full names
        top_3_traits = [f"{riasec_map.get(code, code)} ({score})" for code, score in sorted_scores[:3]]
        top_3_traits_str = ", ".join(top_3_traits)
        
        # Build top buckets info
        buckets_info = ""
        if top_buckets_data:
            buckets_info = "\nTop Career Buckets:\n"
            for bucket in top_buckets_data[:3]:
                buckets_info += f"- {bucket.get('bucket_name', 'N/A')} ({bucket.get('bucket_score', 0)}% match)\n"
        
        prompt = f"""Write a **short, concise profile summary** for this student (2-3 sentences maximum total).
        
        PROFILE:
        - Name: {profile_data.get('name', 'Student')}
        - Grade: {grade}
        - RIASEC Scores: {profile_data.get('riasec_scores', {})}
        - **TOP 3 PERSONALITY TRAITS**: {top_3_traits_str}
        - Subject Scores: {profile_data.get('subject_scores', {})}
        - Extracurriculars: {profile_data.get('extracurriculars', [])}
        
        STRUCTURE (2-3 sentences max total):
        1. **Personality & Strengths**: Briefly describe their natural working style based on RIASEC traits (e.g., "You are a naturally analytical and organized thinker...").
        2. **General Potential**: A concise statement about their potential for success in fields that value their specific traits.
        
        **CRITICAL CONSTRAINTS**:
        - **Keep it extremely concise and direct.**
        - **DO NOT mention specific career names.**
        - **DO NOT give specific advice or next steps.**
        - Keep it purely descriptive of *who they are* and *what they are good at*.
        - Be encouraging and professional.
        
        Respond in structured JSON:  
        `PersonalizedSummary` model.
        Note: Since we are removing specific career/action advice, fill 'top_career_fit' and 'actionable_advice' with generic encouraging statements or merge the profile description across fields if needed, but the 'personality_analysis' field is the most important."""
        
        return self.generate_structured_content(prompt, PersonalizedSummary, max_tokens=300, profile_data=profile_data)
    
    def generate_structured_confidence_explanation(
        self, 
        career_name: str, 
        match_score: int, 
        profile_data: Dict
    ) -> ConfidenceExplanation:
        """Generate structured confidence explanation"""
        prompt = f"""Explain the confidence level ({match_score}%) for recommending {career_name} to this student.

PROFILE:
- RIASEC Scores: {profile_data.get('riasec_scores', {})}
- Subject Scores: {profile_data.get('subject_scores', {})}
- Extracurriculars: {profile_data.get('extracurriculars', [])}

Include:
1. Top 3 contributing factors.
2. Strong alignment areas.
3. Mismatch or improvement opportunities.
4. Overall confidence assessment (High | Medium | Low).

Respond strictly as structured JSON (`ConfidenceExplanation`)."""
        
        return self.generate_structured_content(prompt, ConfidenceExplanation, max_tokens=300, profile_data=profile_data)
    
    def generate_structured_action_plan(
        self,
        profile_data: Dict,
        career_matches: List[Dict],
        top_buckets_data: List[Dict] = None
    ) -> ActionPlan:
        """Generate structured action plan with exactly 5 items"""
        grade = profile_data.get('grade', 0)
        is_grade_below_8 = grade < 8
        
        if is_grade_below_8:
            # For grade < 8: Focus on skills and exploration
            prompt = f"""Generate exactly 5 action plan items for a grade {grade} student.

PROFILE:
- Name: {profile_data.get('name', 'Student')}
- Grade: {grade}
- Subject Scores: {profile_data.get('subject_scores', {})}
- Extracurriculars: {profile_data.get('extracurriculars', [])}

Focus on: skill-building, exploration, and foundational learning.

Each item must have:
- title: Short action title (4-6 words)
- description: What to do (1-2 sentences max)
- timeline: When to do it (e.g., "This week", "This month", "Ongoing")

Respond as structured JSON with exactly 5 items."""
        else:
            # For grade >= 8: Focus on career exploration
            top_career = career_matches[0] if career_matches else None
            buckets_info = ""
            if top_buckets_data:
                buckets_info = "\nTop Career Buckets:\n"
                for bucket in top_buckets_data[:3]:
                    buckets_info += f"- {bucket.get('bucket_name', 'N/A')}\n"
            
            prompt = f"""Generate exactly 5 action plan items for a grade {grade} student.

PROFILE:
- Name: {profile_data.get('name', 'Student')}
- Grade: {grade}
- Top Career: {top_career.get('career_name', 'N/A') if top_career else 'N/A'}
{buckets_info}

Focus on: career research, educational planning, skill development, and networking.

Each item must have:
- title: Short action title (4-6 words)
- description: What to do (1-2 sentences max)
- timeline: When to do it (e.g., "This week", "Next 2 weeks", "This month", "Ongoing")

Respond as structured JSON with exactly 5 items."""
        
        return self.generate_structured_content(prompt, ActionPlan, max_tokens=400, profile_data=profile_data)
    
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
            elif response_model == ActionPlan:
                # Default to grade >= 8 fallback (grade 11)
                grade = 11
                # Try to extract grade from prompt if available
                if "grade" in prompt.lower():
                    try:
                        import re
                        grade_match = re.search(r'grade\s+(\d+)', prompt.lower())
                        if grade_match:
                            grade = int(grade_match.group(1))
                    except:
                        pass
                
                if grade < 8:
                    return ActionPlan(
                        items=[
                            ActionPlanItem(title="Build Foundational Skills", description="Focus on developing core skills in subjects you enjoy. Practice regularly through fun activities, games, and hands-on projects.", timeline="Ongoing"),
                            ActionPlanItem(title="Explore Different Areas", description="Try different activities and hobbies to discover what interests you most. Join clubs, participate in school activities, and explore new subjects.", timeline="This month"),
                            ActionPlanItem(title="Practice Through Projects", description="Engage in hands-on projects that interest you. Build things, create art, solve puzzles, or work on collaborative projects with friends.", timeline="Next 2 weeks"),
                            ActionPlanItem(title="Develop Communication Skills", description="Practice expressing your ideas through writing, speaking, and presentations. Join debate clubs, writing groups, or drama activities.", timeline="This month"),
                            ActionPlanItem(title="Keep Learning and Growing", description="Continue building your skills through practice and exploration. Every small step counts toward your growth and discovery.", timeline="Ongoing")
                        ]
                    )
                else:
                    return ActionPlan(
                        items=[
                            ActionPlanItem(title="Explore Career Details", description="Research your top 3-5 career recommendations in depth. Understand daily responsibilities, growth opportunities, and industry trends.", timeline="This week"),
                            ActionPlanItem(title="Educational Pathway Planning", description="Research educational requirements, courses, and institutions that align with your career choices. Plan your subject selection for upcoming grades.", timeline="Next 2 weeks"),
                            ActionPlanItem(title="Professional Networking", description="Connect with professionals in your areas of interest through LinkedIn, career events, or through family connections. Conduct informational interviews.", timeline="This month"),
                            ActionPlanItem(title="Gain Experience", description="Look for internships, job shadowing opportunities, or volunteer work in your fields of interest. Consider joining relevant clubs or competitions.", timeline="Next 3 months"),
                            ActionPlanItem(title="Skill Development", description="Identify and develop key skills relevant to your top career choices. Take online courses, attend workshops, or start personal projects.", timeline="Ongoing")
                        ]
                    )
            else:
                # Generic fallback - try to create with minimal required fields
                return response_model()
        except Exception as e:
            print(f"Error creating fallback structured content: {e}")
            # Return a basic instance if all else fails
            return response_model()
