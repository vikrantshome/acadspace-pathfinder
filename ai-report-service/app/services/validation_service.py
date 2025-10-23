from typing import Dict, List, Any, Optional
from ..models import ReportGenerationRequest, StudentProfile, CareerMatch, CareerBucket
import logging

logger = logging.getLogger(__name__)

class ValidationService:
    """Service for validating incoming data from Java backend"""
    
    def validate_request(self, request: ReportGenerationRequest) -> Dict[str, Any]:
        """
        Validate incoming request data from Java backend
        
        Args:
            request: Report generation request
            
        Returns:
            Validation result with status and any errors
        """
        errors = []
        warnings = []
        
        # Validate student profile
        profile_errors = self._validate_student_profile(request.student_profile)
        errors.extend(profile_errors)
        
        # Validate career matches
        career_errors = self._validate_career_matches(request.career_matches)
        errors.extend(career_errors)
        
        # Validate top buckets
        bucket_errors = self._validate_top_buckets(request.top_buckets)
        errors.extend(bucket_errors)
        
        # Check for data consistency
        consistency_errors = self._validate_data_consistency(request)
        errors.extend(consistency_errors)
        
        # Generate warnings for missing optional data
        warnings = self._generate_warnings(request)
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "validated_data": request if len(errors) == 0 else None
        }
    
    def _validate_student_profile(self, profile: StudentProfile) -> List[str]:
        """Validate student profile data"""
        errors = []
        
        # Required fields
        if not profile.name or not profile.name.strip():
            errors.append("Student name is required")
        
        if profile.grade is None or profile.grade < 1 or profile.grade > 12:
            errors.append("Grade must be between 1 and 12")
        
        if not profile.board or not profile.board.strip():
            errors.append("Board is required")
        
        # Validate RIASEC scores
        if not profile.riasec_scores:
            errors.append("RIASEC scores are required")
        else:
            riasec_keys = {"R", "I", "A", "S", "E", "C"}
            if set(profile.riasec_scores.keys()) != riasec_keys:
                errors.append("RIASEC scores must contain all keys: R, I, A, S, E, C")
            
            for key, value in profile.riasec_scores.items():
                if not isinstance(value, int) or value < 0 or value > 100:
                    errors.append(f"RIASEC score for {key} must be an integer between 0 and 100")
        
        # Validate subject scores
        if profile.subject_scores:
            for subject, score in profile.subject_scores.items():
                if not isinstance(score, (int, float)) or score < 0 or score > 100:
                    errors.append(f"Subject score for {subject} must be between 0 and 100")
        
        return errors
    
    def _validate_career_matches(self, career_matches: List[CareerMatch]) -> List[str]:
        """Validate career matches data"""
        errors = []
        
        if not career_matches:
            errors.append("At least one career match is required")
            return errors
        
        for i, career in enumerate(career_matches):
            # Required fields
            if not career.career_name or not career.career_name.strip():
                errors.append(f"Career match {i+1}: Career name is required")
            
            if career.match_score is None or not (0 <= career.match_score <= 100):
                errors.append(f"Career match {i+1}: Match score must be between 0 and 100")
            
            if not career.bucket or not career.bucket.strip():
                errors.append(f"Career match {i+1}: Bucket is required")
            
            # Validate RIASEC profile format
            if career.riasec_profile and len(career.riasec_profile) != 2:
                errors.append(f"Career match {i+1}: RIASEC profile must be 2 characters")
            
            # Validate confidence level
            valid_confidence = {"Low", "Medium", "High"}
            if career.confidence and career.confidence not in valid_confidence:
                errors.append(f"Career match {i+1}: Confidence must be Low, Medium, or High")
        
        return errors
    
    def _validate_top_buckets(self, top_buckets: List[CareerBucket]) -> List[str]:
        """Validate top buckets data"""
        errors = []
        
        if not top_buckets:
            errors.append("At least one top bucket is required")
            return errors
        
        for i, bucket in enumerate(top_buckets):
            # Required fields
            if not bucket.bucket_name or not bucket.bucket_name.strip():
                errors.append(f"Top bucket {i+1}: Bucket name is required")
            
            if bucket.bucket_score is None or not (0 <= bucket.bucket_score <= 100):
                errors.append(f"Top bucket {i+1}: Bucket score must be between 0 and 100")
            
            # Validate top careers
            if not bucket.top_careers:
                errors.append(f"Top bucket {i+1}: Must contain at least one career")
        
        return errors
    
    def _validate_data_consistency(self, request: ReportGenerationRequest) -> List[str]:
        """Validate data consistency across the request"""
        errors = []
        
        # Check if career matches belong to the specified buckets
        bucket_names = {bucket.bucket_name for bucket in request.top_buckets}
        for career in request.career_matches:
            if career.bucket not in bucket_names:
                errors.append(f"Career '{career.career_name}' bucket '{career.bucket}' not found in top buckets")
        
        return errors
    
    def _generate_warnings(self, request: ReportGenerationRequest) -> List[str]:
        """Generate warnings for missing optional data"""
        warnings = []
        
        # Check for missing optional profile data
        if not request.student_profile.subject_scores:
            warnings.append("No subject scores provided - AI recommendations may be less accurate")
        
        if not request.student_profile.extracurriculars:
            warnings.append("No extracurricular activities provided - AI recommendations may be less personalized")
        
        if not request.student_profile.parent_careers:
            warnings.append("No parent career information provided - AI recommendations may be less contextual")
        
        # Check for low match scores
        low_scores = [c for c in request.career_matches if c.match_score < 50]
        if low_scores:
            warnings.append(f"{len(low_scores)} career matches have low scores (<50%) - consider reviewing assessment")
        
        return warnings
