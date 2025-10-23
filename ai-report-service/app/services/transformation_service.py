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
            
            # Add AI enhancements
            enhanced_response.update({
                "aiEnhanced": True,
                "enhancedSummary": ai_response.get("summary", ""),
                "skillRecommendations": ai_response.get("skills", []),
                "careerTrajectoryInsights": ai_response.get("trajectory", ""),
                "detailedCareerInsights": {
                    "explanations": ai_response.get("career_insights", {}).detailed_explanations if hasattr(ai_response.get("career_insights", {}), 'detailed_explanations') else {},
                    "studyPaths": ai_response.get("career_insights", {}).personalized_study_paths if hasattr(ai_response.get("career_insights", {}), 'personalized_study_paths') else {},
                    "confidenceExplanations": ai_response.get("career_insights", {}).confidence_explanations if hasattr(ai_response.get("career_insights", {}), 'confidence_explanations') else {}
                }
            })
            
            # Replace original summary with AI-enhanced summary
            if ai_response.get("summary"):
                enhanced_response["summaryParagraph"] = ai_response["summary"]
            
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
