from typing import Dict, List
from ..models import StudentProfile, CareerMatch, CareerBucket, EnhancedCareerInsights
from .ai_client import AIClient

class AIGenerationService:
    """AI-powered report generation service"""
    
    def __init__(self):
        """Initialize the AI generation service"""
        try:
            self.ai_client = AIClient()
        except ValueError as e:
            print(f"Warning: AI client initialization failed: {e}")
            print("Falling back to placeholder content generation")
            self.ai_client = None
    
    def generate_detailed_report(
        self, 
        profile: StudentProfile, 
        career_matches: List[CareerMatch], 
        top_buckets: List[CareerBucket] = None
    ) -> Dict:
        """
        Generate detailed AI-enhanced report using structured outputs
        
        Args:
            profile: Student profile data (includes riasec_scores)
            career_matches: List of career matches
            top_buckets: List of career buckets (optional)
            
        Returns:
            Dictionary containing enhanced report data
        """
        # Generate AI-enhanced report using structured outputs
        return {
            "career_insights": self.enhance_career_insights(career_matches, profile),
            "summary": self.generate_personalized_summary(profile, career_matches, top_buckets),
            "skills": self.generate_skill_recommendations(profile, career_matches),
            "trajectory": self.generate_career_trajectory(profile, career_matches)
        }
    
    def enhance_career_insights(self, career_matches: List[CareerMatch], profile: StudentProfile = None) -> EnhancedCareerInsights:
        """
        Enhance career insights with AI-generated content
        
        Args:
            career_matches: List of career matches
            profile: Student profile data (optional, for AI generation)
            
        Returns:
            Enhanced career insights
        """
        detailed_explanations = {}
        personalized_study_paths = {}
        confidence_explanations = {}
        
        for career in career_matches[:5]:  # Top 5 careers
            career_name = career.career_name
            
            if self.ai_client and profile:
                # Use AI to generate content
                try:
                    profile_data = {
                        'name': profile.name,
                        'grade': profile.grade,
                        'riasec_scores': profile.riasec_scores,
                        'subject_scores': profile.subject_scores,
                        'extracurriculars': profile.extracurriculars,
                        'parent_careers': profile.parent_careers
                    }
                    
                    career_data = {
                        'match_score': career.match_score,
                        'riasec_profile': career.riasec_profile,
                        'primary_subjects': career.primary_subjects,
                        'top_reasons': career.top_reasons,
                        'study_path': career.study_path,
                        'first3_steps': career.first3_steps
                    }
                    
                    # Generate AI content
                    detailed_explanations[career_name] = self.ai_client.generate_career_explanation(
                        career_name, profile_data, career_data
                    )
                    
                    personalized_study_paths[career_name] = self.ai_client.generate_study_path(
                        career_name, profile_data, career_data
                    )
                    
                    confidence_explanations[career_name] = self.ai_client.generate_confidence_explanation(
                        career_name, career.match_score, profile_data
                    )
                    
                except Exception as e:
                    print(f"Error generating AI content for {career_name}: {e}")
                    # Fallback to placeholder content
                    detailed_explanations[career_name] = f"Based on your profile, {career_name} is a strong match due to your analytical skills and relevant background."
                    personalized_study_paths[career_name] = career.first3_steps[:3]
                    confidence_explanations[career_name] = f"High confidence ({career.match_score}%) due to strong alignment in your profile."
            else:
                # Fallback to placeholder content
                detailed_explanations[career_name] = f"Based on your profile, {career_name} is a strong match due to your analytical skills and relevant background."
                personalized_study_paths[career_name] = [
                    f"Focus on {career.primary_subjects[0] if career.primary_subjects else 'relevant subjects'} in your current studies",
                    f"Complete {career.first3_steps[0] if career.first3_steps else 'practical projects'}",
                    f"Consider {career.study_path[0] if career.study_path else 'higher education'} for advanced learning"
                ]
                confidence_explanations[career_name] = f"High confidence ({career.match_score}%) due to strong alignment in your profile."
        
        return EnhancedCareerInsights(
            detailed_explanations=detailed_explanations,
            personalized_study_paths=personalized_study_paths,
            confidence_explanations=confidence_explanations
        )
    
    def generate_personalized_summary(
        self, 
        profile: StudentProfile, 
        career_matches: List[CareerMatch],
        top_buckets: List[CareerBucket] = None
    ) -> str:
        """
        Generate personalized summary paragraph
        
        Args:
            profile: Student profile data
            career_matches: List of career matches
            top_buckets: List of career buckets (optional)
            
        Returns:
            Personalized summary string
        """
        if not career_matches:
            return f"{profile.name} — complete the assessment to get personalized career recommendations."
        
        if self.ai_client:
            try:
                profile_data = {
                    'name': profile.name,
                    'grade': profile.grade,
                    'riasec_scores': profile.riasec_scores,
                    'subject_scores': profile.subject_scores,
                    'extracurriculars': profile.extracurriculars,
                    'parent_careers': profile.parent_careers
                }
                
                career_matches_data = []
                for career in career_matches[:3]:  # Top 3 careers
                    career_matches_data.append({
                        'career_name': career.career_name,
                        'match_score': career.match_score,
                        'bucket': career.bucket
                    })
                
                # Include top buckets data if available
                top_buckets_data = []
                if top_buckets:
                    for bucket in top_buckets[:3]:  # Top 3 buckets
                        top_buckets_data.append({
                            'bucket_name': bucket.bucket_name,
                            'bucket_score': bucket.bucket_score
                        })
                
                return self.ai_client.generate_personalized_summary(profile_data, career_matches_data, top_buckets_data)
                
            except Exception as e:
                print(f"Error generating AI summary: {e}")
                # Fallback to basic summary
        
        # Fallback to basic summary
        top_career = career_matches[0]
        top_bucket = top_career.bucket
        
        return f"{profile.name} — your profile shows strong alignment with {top_bucket} careers. " \
               f"We recommend focusing on building relevant skills and gaining practical experience " \
               f"in your top-matched fields like {top_career.career_name}."
    
    def generate_skill_recommendations(
        self, 
        profile: StudentProfile, 
        career_matches: List[CareerMatch]
    ) -> List[str]:
        """
        Generate skill development recommendations
        
        Args:
            profile: Student profile data
            career_matches: List of career matches
            
        Returns:
            List of skill recommendations
        """
        if self.ai_client:
            try:
                profile_data = {
                    'name': profile.name,
                    'grade': profile.grade,
                    'riasec_scores': profile.riasec_scores,
                    'subject_scores': profile.subject_scores,
                    'extracurriculars': profile.extracurriculars,
                    'parent_careers': profile.parent_careers
                }
                
                career_matches_data = []
                for career in career_matches[:3]:  # Top 3 careers
                    career_matches_data.append({
                        'career_name': career.career_name,
                        'match_score': career.match_score,
                        'primary_subjects': career.primary_subjects
                    })
                
                return self.ai_client.generate_skill_recommendations(profile_data, career_matches_data)
                
            except Exception as e:
                print(f"Error generating AI skill recommendations: {e}")
                # Fallback to basic recommendations
        
        # Fallback to basic skill extraction
        skills = []
        
        # Extract skills from top career matches
        for career in career_matches[:3]:  # Top 3 careers
            for subject in career.primary_subjects:
                if subject not in skills:
                    skills.append(f"Master {subject} fundamentals")
            
            # Add general skills based on career type
            if "Data" in career.career_name or "AI" in career.career_name:
                skills.append("Learn Python programming")
                skills.append("Develop statistical analysis skills")
            elif "Software" in career.career_name or "Developer" in career.career_name:
                skills.append("Build full-stack development skills")
                skills.append("Practice coding projects")
        
        return skills[:5]  # Return top 5 skills
    
    def generate_career_trajectory(
        self, 
        profile: StudentProfile, 
        career_matches: List[CareerMatch]
    ) -> str:
        """
        Generate career trajectory insights
        
        Args:
            profile: Student profile data
            career_matches: List of career matches
            
        Returns:
            Career trajectory insights string
        """
        if not career_matches:
            return "Complete the assessment to get career trajectory insights."
        
        if self.ai_client:
            try:
                profile_data = {
                    'name': profile.name,
                    'grade': profile.grade,
                    'riasec_scores': profile.riasec_scores,
                    'subject_scores': profile.subject_scores,
                    'extracurriculars': profile.extracurriculars,
                    'parent_careers': profile.parent_careers
                }
                
                career_matches_data = []
                for career in career_matches[:3]:  # Top 3 careers
                    career_matches_data.append({
                        'career_name': career.career_name,
                        'match_score': career.match_score,
                        'primary_subjects': career.primary_subjects
                    })
                
                return self.ai_client.generate_career_trajectory(profile_data, career_matches_data)
                
            except Exception as e:
                print(f"Error generating AI career trajectory: {e}")
                # Fallback to basic trajectory
        
        # Fallback to basic trajectory
        top_career = career_matches[0]
        
        return f"Your path to {top_career.career_name} could start with building a strong foundation " \
               f"in {', '.join(top_career.primary_subjects)} during {profile.grade}th grade, " \
               f"followed by pursuing relevant higher education and gaining practical experience."
    
