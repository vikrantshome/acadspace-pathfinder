from typing import Dict, List, Any, Optional
from ..models import ReportGenerationRequest, StudentProfile, CareerMatch, CareerBucket
import logging

logger = logging.getLogger(__name__)

class TransformationService:
    """Service for transforming data between Java backend format and internal format"""
    
    def transform_java_to_internal(self, java_data: Dict[str, Any]) -> ReportGenerationRequest:
        """
        Transform Java backend data format to internal Python format
        
        Args:
            java_data: Data from Java backend in StudentReport format
            
        Returns:
            ReportGenerationRequest in internal format
        """
        try:
            # Transform student profile
            student_profile = self._transform_student_profile(java_data)
            
            # Transform career matches from top5Buckets
            career_matches = self._transform_career_matches(java_data.get("top5Buckets", []))
            
            # Transform top buckets
            top_buckets = self._transform_top_buckets(java_data.get("top5Buckets", []))
            
            return ReportGenerationRequest(
                student_profile=student_profile,
                career_matches=career_matches,
                top_buckets=top_buckets
            )
            
        except Exception as e:
            logger.error(f"Error transforming Java data to internal format: {e}")
            raise ValueError(f"Failed to transform Java data: {str(e)}")
    
    def _transform_student_profile(self, java_data: Dict[str, Any]) -> StudentProfile:
        """Transform Java student data to StudentProfile"""
        return StudentProfile(
            name=java_data.get("studentName", ""),
            grade=java_data.get("grade", 0),
            board=java_data.get("board", ""),
            riasec_scores=java_data.get("vibeScores", {}),
            subject_scores=java_data.get("eduStats", {}),
            extracurriculars=java_data.get("extracurriculars", []),
            parent_careers=java_data.get("parents", [])
        )
    
    def _transform_career_matches(self, top5_buckets: List[Dict[str, Any]]) -> List[CareerMatch]:
        """Extract and transform career matches from top5Buckets"""
        career_matches = []
        
        for bucket in top5_buckets:
            bucket_name = bucket.get("bucketName", "")
            for career in bucket.get("topCareers", []):
                career_match = CareerMatch(
                    career_name=career.get("careerName", ""),
                    match_score=career.get("matchScore", 0),
                    bucket=bucket_name,
                    riasec_profile="",  # Not provided in Java data
                    primary_subjects=[],  # Not provided in Java data
                    top_reasons=career.get("topReasons", []),
                    study_path=career.get("studyPath", []),
                    first3_steps=career.get("first3Steps", []),
                    confidence=career.get("confidence", "Medium"),
                    what_would_change_recommendation=career.get("whatWouldChangeRecommendation", "")
                )
                career_matches.append(career_match)
        
        return career_matches
    
    def _transform_top_buckets(self, top5_buckets: List[Dict[str, Any]]) -> List[CareerBucket]:
        """Transform top5Buckets to CareerBucket format"""
        transformed_buckets = []
        
        for bucket in top5_buckets:
            # Transform careers within bucket
            bucket_careers = []
            for career in bucket.get("topCareers", []):
                career_match = CareerMatch(
                    career_name=career.get("careerName", ""),
                    match_score=career.get("matchScore", 0),
                    bucket=bucket.get("bucketName", ""),
                    riasec_profile="",
                    primary_subjects=[],
                    top_reasons=career.get("topReasons", []),
                    study_path=career.get("studyPath", []),
                    first3_steps=career.get("first3Steps", []),
                    confidence=career.get("confidence", "Medium"),
                    what_would_change_recommendation=career.get("whatWouldChangeRecommendation", "")
                )
                bucket_careers.append(career_match)
            
            career_bucket = CareerBucket(
                bucket_name=bucket.get("bucketName", ""),
                bucket_score=bucket.get("bucketScore", 0),
                top_careers=bucket_careers
            )
            transformed_buckets.append(career_bucket)
        
        return transformed_buckets
    
    def transform_internal_to_java_response(self, ai_response: Dict[str, Any], original_java_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform internal AI response back to Java backend expected format
        
        Args:
            ai_response: AI-generated response from internal service
            original_java_data: Original Java data to preserve structure
            
        Returns:
            Enhanced Java response format
        """
        try:
            # Start with original Java data structure
            enhanced_response = original_java_data.copy()
            
            # Extract career insights safely (handles both EnhancedCareerInsights object and dict)
            career_insights = ai_response.get("career_insights", {})
            
            # Handle EnhancedCareerInsights object or dict
            if hasattr(career_insights, 'detailed_explanations'):
                # It's an EnhancedCareerInsights object
                explanations = career_insights.detailed_explanations if career_insights.detailed_explanations else {}
                study_paths = career_insights.personalized_study_paths if career_insights.personalized_study_paths else {}
                confidence_explanations = career_insights.confidence_explanations if career_insights.confidence_explanations else {}
            elif isinstance(career_insights, dict):
                # It's a dict
                explanations = career_insights.get("detailed_explanations", {})
                study_paths = career_insights.get("personalized_study_paths", {})
                confidence_explanations = career_insights.get("confidence_explanations", {})
            else:
                # Fallback to empty dicts
                explanations = {}
                study_paths = {}
                confidence_explanations = {}
            
            # Ensure all values are dicts (not None)
            if explanations is None:
                explanations = {}
            if study_paths is None:
                study_paths = {}
            if confidence_explanations is None:
                confidence_explanations = {}
            
            # Determine if this is grade < 8 (detailed skills) or grade >= 8 (simple skills)
            grade = original_java_data.get("grade", 11)
            is_grade_below_8 = grade < 8
            
            # Get skills from AI response
            focused_skills = ai_response.get("skills", []) or []  # Simple skill names
            detailed_skills = ai_response.get("detailed_skills", []) or []  # Detailed skill objects
            
            # Add AI enhancements
            enhanced_response.update({
                "aiEnhanced": True,
                "enhancedSummary": ai_response.get("summary", ""),
                "careerTrajectoryInsights": ai_response.get("trajectory", ""),
                "detailedCareerInsights": {
                    "explanations": explanations,
                    "studyPaths": study_paths,
                    "confidenceExplanations": confidence_explanations
                }
            })
            
            # Handle skills based on grade
            if is_grade_below_8:
                # For grade < 8: return both focused skills (names) and detailed skills (with explanations)
                # Convert detailed skills dict to list of strings for JSON compatibility
                detailed_skills_list = []
                for skill_item in detailed_skills:
                    if isinstance(skill_item, dict):
                        detailed_skills_list.append({
                            "skill_name": skill_item.get("skill_name", ""),
                            "explanation": skill_item.get("explanation", "")
                        })
                    else:
                        # Fallback: if it's a string, try to parse it
                        detailed_skills_list.append({
                            "skill_name": "Skill",
                            "explanation": str(skill_item)
                        })
                
                enhanced_response.update({
                    "skillRecommendations": focused_skills if focused_skills else [],  # Focused skill names
                    "detailedSkillRecommendations": detailed_skills_list  # Detailed skill objects
                })
            else:
                # For grade >= 8: simple skill names go to skillRecommendations
                enhanced_response.update({
                    "skillRecommendations": focused_skills if focused_skills else [],  # Simple skill names
                    "detailedSkillRecommendations": []  # Empty for grade >= 8
                })
            
            # Replace original summary with AI-enhanced summary
            if ai_response.get("summary"):
                enhanced_response["summaryParagraph"] = ai_response["summary"]
            
            # Add action plan
            action_plan = ai_response.get("actionPlan", None)
            if action_plan:
                enhanced_response["actionPlan"] = action_plan
            
            return enhanced_response
            
        except Exception as e:
            logger.error(f"Error transforming internal response to Java format: {e}")
            raise ValueError(f"Failed to transform response: {str(e)}")
    
    def validate_java_data_structure(self, java_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate that Java data has required structure
        
        Args:
            java_data: Data from Java backend
            
        Returns:
            Validation result
        """
        errors = []
        
        # Check required top-level fields
        required_fields = ["studentName", "grade", "board", "vibeScores", "top5Buckets"]
        for field in required_fields:
            if field not in java_data:
                errors.append(f"Missing required field: {field}")
        
        # Validate vibeScores structure
        if "vibeScores" in java_data:
            vibe_scores = java_data["vibeScores"]
            if not isinstance(vibe_scores, dict):
                errors.append("vibeScores must be a dictionary")
            else:
                required_riasec = {"R", "I", "A", "S", "E", "C"}
                if set(vibe_scores.keys()) != required_riasec:
                    errors.append(f"vibeScores must contain all RIASEC keys: {required_riasec}")
        
        # Validate top5Buckets structure
        if "top5Buckets" in java_data:
            top5_buckets = java_data["top5Buckets"]
            if not isinstance(top5_buckets, list):
                errors.append("top5Buckets must be a list")
            elif len(top5_buckets) == 0:
                errors.append("top5Buckets cannot be empty")
            else:
                # Validate bucket structure
                for i, bucket in enumerate(top5_buckets):
                    if not isinstance(bucket, dict):
                        errors.append(f"top5Buckets[{i}] must be a dictionary")
                        continue
                    
                    if "bucketName" not in bucket:
                        errors.append(f"top5Buckets[{i}] missing bucketName")
                    if "bucketScore" not in bucket:
                        errors.append(f"top5Buckets[{i}] missing bucketScore")
                    if "topCareers" not in bucket:
                        errors.append(f"top5Buckets[{i}] missing topCareers")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }
