from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import logging
from ..models import ReportGenerationRequest, ReportGenerationResponse
from ..services.ai_generation_service import AIGenerationService
from ..services.validation_service import ValidationService
from ..services.transformation_service import TransformationService

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Initialize services
ai_service = AIGenerationService()
validation_service = ValidationService()
transformation_service = TransformationService()

@router.post("/generate-report-java")
async def generate_report_from_java(java_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate AI-enhanced career report from Java backend format
    
    Args:
        java_data: Java backend data in StudentReport format
        
    Returns:
        Enhanced report in Java backend format
    """
    try:
        logger.info("Processing Java backend data for AI enhancement")
        
        # Validate Java data structure
        validation_result = transformation_service.validate_java_data_structure(java_data)
        if not validation_result["is_valid"]:
            logger.error(f"Invalid Java data structure: {validation_result['errors']}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Invalid data structure",
                    "details": validation_result["errors"]
                }
            )
        
        # Transform Java data to internal format
        internal_request = transformation_service.transform_java_to_internal(java_data)
        
        # Validate internal data
        validation_result = validation_service.validate_request(internal_request)
        if not validation_result["is_valid"]:
            logger.error(f"Invalid internal data: {validation_result['errors']}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Data validation failed",
                    "details": validation_result["errors"],
                    "warnings": validation_result.get("warnings", [])
                }
            )
        
        # Generate AI-enhanced report
        ai_result = ai_service.generate_detailed_report(
            profile=internal_request.student_profile,
            career_matches=internal_request.career_matches,
            top_buckets=internal_request.top_buckets
        )
        
        # Transform response back to Java format
        enhanced_response = transformation_service.transform_internal_to_java_response(
            ai_result, java_data
        )
        
        logger.info(f"Successfully generated AI-enhanced report for {internal_request.student_profile.name}")
        return enhanced_response
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error generating AI report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal server error",
                "message": "Failed to generate AI-enhanced report",
                "details": str(e)
            }
        )

@router.post("/generate-report", response_model=ReportGenerationResponse)
async def generate_report(request: ReportGenerationRequest) -> ReportGenerationResponse:
    """
    Generate AI-enhanced career report
    
    Args:
        request: Report generation request with student profile and career data
        
    Returns:
        Enhanced report with AI-generated insights
    """
    try:
        logger.info(f"Generating AI report for student: {request.student_profile.name}")
        
        # Validate request data
        validation_result = validation_service.validate_request(request)
        if not validation_result["is_valid"]:
            logger.error(f"Invalid request data: {validation_result['errors']}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Data validation failed",
                    "details": validation_result["errors"],
                    "warnings": validation_result.get("warnings", [])
                }
            )
        
        # Extract data from request
        profile = request.student_profile
        career_matches = request.career_matches
        top_buckets = request.top_buckets
        
        # Generate AI-enhanced report
        result = ai_service.generate_detailed_report(
            profile=profile,
            career_matches=career_matches,
            top_buckets=top_buckets
        )
        
        # Build response
        response = ReportGenerationResponse(
            enhanced_career_insights=result["career_insights"],
            personalized_summary=result["summary"],
            skill_recommendations=result["skills"],
            career_trajectory_insights=result["trajectory"],
            action_plan=result.get("actionPlan", None)
        )
        
        logger.info(f"Successfully generated AI report for {profile.name}")
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error generating AI report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal server error",
                "message": "Failed to generate AI report",
                "details": str(e)
            }
        )

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for service monitoring
    
    Returns:
        Service health status
    """
    try:
        # Test AI service availability
        ai_status = "available" if ai_service.ai_client else "fallback_mode"
        
        return {
            "status": "healthy",
            "service": "ai-report-service",
            "ai_service": ai_status,
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service health check failed"
        )

@router.post("/test-generation")
async def test_generation() -> Dict[str, Any]:
    """
    Test endpoint with sample data for development and testing
    
    Returns:
        Sample AI-generated report
    """
    try:
        logger.info("Generating test AI report with sample data")
        
        # Create sample data
        from ..models import StudentProfile, CareerMatch, CareerBucket
        
        sample_profile = StudentProfile(
            name="Test Student",
            grade=11,
            board="CBSE",
            riasec_scores={"R": 15, "I": 45, "A": 20, "S": 10, "E": 5, "C": 5},
            subject_scores={"Mathematics": 85, "Physics": 80, "Chemistry": 75, "Computer Science": 70},
            extracurriculars=["Coding", "Robotics"],
            parent_careers=["IT / Software"]
        )
        
        sample_career = CareerMatch(
            career_name="Software Engineer",
            match_score=88,
            bucket="Computer Science & Software Development",
            riasec_profile="IC",
            primary_subjects=["Mathematics", "Computer Science"],
            top_reasons=["Strong analytical skills", "Good programming aptitude"],
            study_path=["B.Tech CSE", "Software Engineering"],
            first3_steps=["Learn programming", "Build projects", "Get internships"],
            confidence="High",
            what_would_change_recommendation="If programming skills don't improve"
        )
        
        sample_bucket = CareerBucket(
            bucket_name="Computer Science & Software Development",
            bucket_score=88,
            top_careers=[sample_career]
        )
        
        # Generate test report
        result = ai_service.generate_detailed_report(
            profile=sample_profile,
            career_matches=[sample_career],
            top_buckets=[sample_bucket]
        )
        
        return {
            "message": "Test AI report generated successfully",
            "student_name": sample_profile.name,
            "report_preview": {
                "summary": result["summary"][:200] + "...",
                "skills_count": len(result["skills"]),
                "career_insights_count": len(result["career_insights"].detailed_explanations),
                "ai_service_status": "available" if ai_service.ai_client else "fallback_mode"
            }
        }
        
    except Exception as e:
        logger.error(f"Test generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test generation failed: {str(e)}"
        )
