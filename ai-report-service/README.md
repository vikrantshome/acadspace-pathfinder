# AI Report Generation Microservice

A Python FastAPI microservice for generating AI-powered career reports, designed to be called by the Java Spring Boot backend after RIASEC calculation and career bucket determination.

## 🎯 Overview

This microservice enhances the existing career assessment system by providing AI-generated insights, personalized recommendations, and detailed career guidance based on student profiles and career matches.

## 🏗️ Architecture

```
Frontend (React) 
    ↓ POST /api/tests/combined/submit
Java Backend (Spring Boot)
    ↓ ScoringService.computeCareerReport()
    ↓ Basic RIASEC calculation + career matching
    ↓ POST /generate-report (with context)
Python AI Service (FastAPI) ← THIS SERVICE
    ↓ AI-powered content generation
    ↓ Enhanced report with detailed insights
    ↓ Response back to Java
Java Backend
    ↓ Merge AI enhancements
    ↓ Return enhanced StudentReport
Frontend
    ↓ Display AI-enhanced report
```

## 📁 Project Structure

```
ai-report-service/
├── app/
│   ├── __init__.py
│   ├── main.py                          # FastAPI application
│   ├── models/                          # Pydantic data models
│   │   ├── __init__.py
│   │   ├── student_profile.py           # StudentProfile model
│   │   ├── career_match.py              # CareerMatch model
│   │   ├── career_bucket.py             # CareerBucket model
│   │   ├── request_models.py            # ReportGenerationRequest
│   │   └── response_models.py           # ReportGenerationResponse
│   ├── services/                        # AI generation logic
│   │   ├── __init__.py
│   │   └── ai_generation_service.py     # AIGenerationService class
│   └── api/                            # FastAPI endpoints (Phase 3)
│       └── __init__.py
├── Dockerfile                          # Docker configuration
├── env.example                         # Environment variables template
├── requirements.txt                    # Python dependencies
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- pip or pip3

### Installation

1. **Clone and navigate to the service directory:**
   ```bash
   cd ai-report-service
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the service:**
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Test the service:**
   ```bash
   curl http://localhost:8000/health
   # Expected: {"status":"healthy","service":"ai-report-service"}
   ```

### Environment Variables

Create a `.env` file in the `ai-report-service` directory:

```env
# AI Service Configuration
AI_SERVICE_URL=http://ai-report-service:8000
AI_MODEL_API_KEY=your-api-key-here
AI_MODEL_PROVIDER=groq  # or 'openai'
AI_MODEL_NAME=llama3-8b-8192  # or 'gpt-3.5-turbo'
PORT=8000
HOST=0.0.0.0
```

#### AI Provider Configuration

**OpenAI Configuration:**
```env
AI_MODEL_PROVIDER=openai
AI_MODEL_NAME=gpt-3.5-turbo
AI_MODEL_API_KEY=your-openai-api-key
```

**Groq Configuration:**
```env
AI_MODEL_PROVIDER=groq
AI_MODEL_NAME=llama3-8b-8192
AI_MODEL_API_KEY=your-groq-api-key
```

### Docker Support

```bash
# Build the Docker image
docker build -t ai-report-service .

# Run the container with environment variables
docker run -p 8000:8000 \
  -e AI_MODEL_API_KEY=your-api-key \
  -e AI_MODEL_PROVIDER=groq \
  -e AI_MODEL_NAME=llama3-8b-8192 \
  ai-report-service
```

## 📋 Implementation Status

### ✅ Phase 1: Python FastAPI Microservice Setup (COMPLETED)

#### 1.1 ✅ Directory Structure
- Created complete Python microservice directory structure
- Set up proper package hierarchy with `__init__.py` files
- Created separate directories for models, services, and API endpoints

#### 1.2 ✅ FastAPI Application Structure
- **FastAPI App**: Created `main.py` with FastAPI application initialization
- **CORS Middleware**: Added CORS support for Java backend communication
- **Logging**: Implemented request/response logging with proper configuration
- **Health Check**: Added `/health` endpoint for service monitoring
- **Root Endpoint**: Added `/` endpoint for basic service verification

#### 1.3 ✅ Pydantic Models for Data Exchange
- **StudentProfile**: Student data structure with name, grade, board, RIASEC scores, subject scores, extracurriculars, parent careers
- **CareerMatch**: Career match data with name, score, bucket, RIASEC profile, subjects, reasons, study path, steps, confidence
- **CareerBucket**: Career bucket data with name, score, and list of top careers
- **ReportGenerationRequest**: Main request model containing student profile, career matches, and top buckets
- **ReportGenerationResponse**: Main response model with enhanced insights, personalized summary, skill recommendations, career trajectory
- **EnhancedCareerInsights**: AI-generated insights with detailed explanations, study paths, confidence explanations

### ✅ Phase 2: AI Report Generation Logic (COMPLETED)

#### 2.1 ✅ AI Report Generation Service
- **AIGenerationService Class**: Core service for AI-powered report generation
- **generate_detailed_report()**: Main method that orchestrates the entire AI report generation process
- **enhance_career_insights()**: Generates detailed explanations, study paths, and confidence explanations for each career
- **generate_personalized_summary()**: Creates personalized summary paragraph based on student profile and career matches
- **generate_skill_recommendations()**: Extracts and generates skill development recommendations
- **generate_career_trajectory()**: Creates career trajectory insights

#### 2.2 ✅ AI-Powered Content Generation
- **Multi-Provider Support**: Supports both OpenAI and Groq APIs
- **AIClient Class**: Handles communication with AI models
- **Prompt Templates**: Specialized prompts for different report sections
- **Response Parsing**: Intelligent parsing of AI responses with JSON fallback
- **Error Handling**: Graceful fallback to placeholder content when AI fails
- **Content Generation Methods**:
  - `generate_career_explanation()`: Detailed career fit explanations
  - `generate_study_path()`: Personalized study recommendations
  - `generate_confidence_explanation()`: Confidence level explanations
  - `generate_personalized_summary()`: Comprehensive summary paragraphs
  - `generate_skill_recommendations()`: Skill development suggestions
  - `generate_career_trajectory()`: Career path insights

### 📋 Phase 3: API Integration (PENDING)
- [ ] Create FastAPI endpoints (`POST /generate-report`, `GET /health`, `POST /test-generation`)
- [ ] Implement request/response handling
- [ ] Add comprehensive error handling

### 📋 Phase 4: Java Backend Integration (PENDING)
- [ ] Modify Java backend to call AI service
- [ ] Update `ScoringService.computeCareerReport()`
- [ ] Update data models if needed

### 📋 Phase 5: Docker & Deployment (PENDING)
- [ ] Update `docker-compose.yml` to include AI service
- [ ] Add environment variable configuration
- [ ] Set up service networking

### 📋 Phase 6: Testing & Validation (PENDING)
- [ ] Create test data and scenarios
- [ ] Integration testing
- [ ] Performance testing

## 🔧 API Endpoints

### Current Endpoints (Phase 1.2)

#### `GET /health`
Health check endpoint for service monitoring.

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-report-service"
}
```

#### `GET /`
Root endpoint for basic service verification.

**Response:**
```json
{
  "message": "AI Report Generation Service is running"
}
```

### Planned Endpoints (Phase 3)

#### `POST /generate-report`
Main report generation endpoint (to be implemented).

**Request Body:**
```json
{
  "student_profile": {
    "name": "Aisha",
    "grade": 11,
    "board": "CBSE",
    "riasec_scores": {"R": 12, "I": 48, "A": 18, "S": 8, "E": 6, "C": 8},
    "subject_scores": {"Mathematics": 88, "Physics": 82, "Chemistry": 74},
    "extracurriculars": ["Robotics / Coding", "Debate / MUN"],
    "parent_careers": ["IT / Software"]
  },
  "career_matches": [
    {
      "career_name": "Data Scientist",
      "match_score": 92,
      "bucket": "Data AI & Analytics",
      "riasec_profile": "IA",
      "primary_subjects": ["Mathematics", "Computer Science"],
      "top_reasons": ["High Investigative score", "Strong Math marks"],
      "study_path": ["B.Tech CSE", "Data Science electives"],
      "first3_steps": ["Learn Python", "Kaggle projects", "Build portfolio"],
      "confidence": "High",
      "what_would_change_recommendation": "If Math drops below 60"
    }
  ],
  "top_buckets": [
    {
      "bucket_name": "Data AI & Analytics",
      "bucket_score": 88,
      "top_careers": [...]
    }
  ]
}
```

**Response:**
```json
{
  "enhanced_career_insights": {
    "detailed_explanations": {
      "Data Scientist": "Based on your strong investigative nature (48% I score) and excellent mathematics performance (88%), you have the analytical mindset and quantitative foundation essential for data science..."
    },
    "personalized_study_paths": {
      "Data Scientist": [
        "Focus on advanced mathematics and statistics in 11-12 grade",
        "Learn Python programming through online courses",
        "Complete data science projects on Kaggle"
      ]
    },
    "confidence_explanations": {
      "Data Scientist": "High confidence (92%) due to strong alignment in investigative personality traits, excellent quantitative performance, and relevant extracurricular activities."
    }
  },
  "personalized_summary": "Aisha, your profile reveals a clear investigative bent combined with strong mathematical aptitude and practical coding experience...",
  "skill_recommendations": [
    "Python programming (essential for data science)",
    "Statistical analysis and probability",
    "Machine learning fundamentals"
  ],
  "career_trajectory_insights": "Your path to data science could start with building a strong foundation in programming and statistics..."
}
```

## 🧪 Testing

### Manual Testing

1. **Test service startup:**
   ```bash
   python3 -c "from app.main import app; print('FastAPI app imported successfully')"
   ```

2. **Test model validation:**
   ```bash
   python3 -c "from app.models import StudentProfile, CareerMatch; print('Models imported successfully')"
   ```

3. **Test AI service:**
   ```bash
   python3 -c "from app.services.ai_generation_service import AIGenerationService; print('AI service imported successfully')"
   ```

4. **Test endpoints:**
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:8000/
   ```

### Automated Testing (Planned)
- Unit tests for all Pydantic models
- Integration tests for AI generation service
- API endpoint tests
- End-to-end tests with sample data

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```bash
# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
AI_MODEL_API_KEY=your_api_key_here
AI_MODEL_PROVIDER=openai
AI_MODEL_NAME=gpt-3.5-turbo

# Alternative AI Provider (Groq)
# AI_MODEL_PROVIDER=groq
# AI_MODEL_NAME=llama3-8b-8192

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

#### AI Provider Configuration

**OpenAI Configuration:**
```bash
AI_MODEL_PROVIDER=openai
AI_MODEL_NAME=gpt-3.5-turbo  # or gpt-4, gpt-4-turbo
AI_MODEL_API_KEY=sk-your-openai-api-key
```

**Groq Configuration:**
```bash
AI_MODEL_PROVIDER=groq
AI_MODEL_NAME=llama3-8b-8192  # or llama3-70b-8192, mixtral-8x7b-32768
AI_MODEL_API_KEY=gsk-your-groq-api-key
```

**Fallback Mode:**
If no API key is provided or AI service fails, the system automatically falls back to placeholder content generation.

### Dependencies

See `requirements.txt` for current dependencies:
- `fastapi==0.104.1` - Web framework
- `uvicorn==0.24.0` - ASGI server
- `pydantic==2.5.0` - Data validation
- `python-multipart==0.0.6` - Form data handling
- `openai` - OpenAI API client
- `groq` - Groq API client
- `python-dotenv==1.0.0` - Environment variable management

## 🚀 Development

### Running in Development Mode

```bash
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Adding New Features

1. **Models**: Add new Pydantic models in `app/models/`
2. **Services**: Add business logic in `app/services/`
3. **API**: Add new endpoints in `app/api/`
4. **Tests**: Add tests for new functionality

## 📝 Next Steps

1. **Phase 2.2**: Implement actual AI model integration (OpenAI/Claude)
2. **Phase 3**: Create API endpoints for report generation
3. **Phase 4**: Integrate with Java backend
4. **Phase 5**: Docker deployment setup
5. **Phase 6**: Comprehensive testing

## 🤝 Contributing

This microservice is part of the AcadSpace Pathfinder project. Follow the project's coding standards and ensure all changes are tested before deployment.

## 📄 License

Part of the AcadSpace Pathfinder project. See main project for license details.
