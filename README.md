# AcadSpace Pathfinder - AI-Powered Career Guidance Platform

A comprehensive career assessment platform that combines psychological testing (RIASEC model) with AI-powered insights to provide personalized career recommendations for students.

## 🚀 Features

- **Comprehensive Career Assessment**: RIASEC personality testing combined with academic performance analysis
- **AI-Enhanced Reports**: Personalized career insights powered by OpenAI/Groq AI models
- **Multi-Service Architecture**: Microservices-based design with Java backend and Python AI service
- **Modern Frontend**: React-based user interface with responsive design
- **Docker Support**: Complete containerization for easy deployment and scaling

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Port**: 3000
- **Tech Stack**: React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Features**: User authentication, test interface, report visualization

### Backend (Java Spring Boot)
- **Port**: 4000
- **Tech Stack**: Spring Boot, MongoDB, JWT Authentication
- **Features**: User management, test processing, career matching, AI service integration

### AI Service (Python FastAPI)
- **Port**: 8000
- **Tech Stack**: FastAPI, OpenAI/Groq API, Pydantic
- **Features**: AI-powered report generation, personalized insights, skill recommendations

### Database
- **MongoDB**: User data, test results, career mappings
- **Port**: 27017

## 🛠️ Technology Stack

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

### Backend
- Java 17
- Spring Boot 3.2.1
- MongoDB
- JWT Authentication
- Maven

### AI Service
- Python 3.11
- FastAPI
- OpenAI API / Groq API
- Pydantic

### Infrastructure
- Docker & Docker Compose
- MongoDB
- Nginx (optional)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Java 17+ (for local development)
- Python 3.11+ (for local development)

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd acadspace-pathfinder
```

2. **Set up environment variables**
```bash
# Copy environment template
cp ai-report-service/env.example ai-report-service/.env

# Edit the .env file with your API keys
nano ai-report-service/.env
```

Required environment variables:
```env
# AI Service Configuration
AI_MODEL_API_KEY=your-openai-or-groq-api-key
AI_MODEL_PROVIDER=groq  # or 'openai'
AI_MODEL_NAME=llama3-8b-8192  # or 'gpt-3.5-turbo'

# Backend Configuration
JWT_SECRET=your-jwt-secret-key
ADMIN_SECRET=your-admin-secret
```

### 🐳 Docker Deployment (Recommended)

1. **Start all services**
```bash
docker-compose up --build
```

2. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- AI Service: http://localhost:8000
- MongoDB: localhost:27017

### 🛠️ Local Development

#### Frontend Development
```bash
cd /path/to/project
npm install
npm run dev
```

#### Backend Development
```bash
cd backend
./mvnw spring-boot:run
```

#### AI Service Development
```bash
cd ai-report-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 📚 API Documentation

### Backend API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

#### Test Management
- `POST /api/tests/combined/submit` - Submit career assessment
- `GET /api/reports/{reportId}` - Get career report
- `GET /api/reports/ai-service/health` - Check AI service health

### AI Service API Endpoints

#### Report Generation
- `POST /api/v1/generate-report-java` - Generate AI-enhanced report (Java format)
- `POST /api/v1/generate-report` - Generate AI-enhanced report (internal format)
- `GET /api/v1/health` - Health check

## 🔧 Configuration

### AI Model Configuration

The AI service supports multiple providers:

#### OpenAI Configuration
```env
AI_MODEL_PROVIDER=openai
AI_MODEL_NAME=gpt-3.5-turbo
AI_MODEL_API_KEY=your-openai-api-key
```

#### Groq Configuration
```env
AI_MODEL_PROVIDER=groq
AI_MODEL_NAME=llama3-8b-8192
AI_MODEL_API_KEY=your-groq-api-key
```

### Backend Configuration

Key configuration in `backend/src/main/resources/application.yml`:

```yaml
ai:
  service:
    url: http://ai-report-service:8000
    timeout: 30000
    enabled: true
```

## 🧪 Testing

### Test the Complete Flow

1. **Start all services**
```bash
docker-compose up --build
```

2. **Register a test user**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

3. **Submit a career assessment**
```bash
curl -X POST http://localhost:4000/api/tests/combined/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userName": "Test User",
    "grade": 11,
    "board": "CBSE",
    "answers": {"v_01": 4, "v_02": 5, "v_03": 3},
    "subjectScores": {"Mathematics": 85, "Physics": 80},
    "extracurriculars": ["Coding"],
    "parentCareers": ["IT / Software"]
  }'
```

## 📁 Project Structure

```
acadspace-pathfinder/
├── src/                          # Frontend (React)
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   ├── lib/                      # Utilities and API client
│   └── types/                    # TypeScript type definitions
├── backend/                      # Java Spring Boot backend
│   ├── src/main/java/com/naviksha/
│   │   ├── controller/           # REST controllers
│   │   ├── service/              # Business logic
│   │   ├── model/                # Data models
│   │   └── config/               # Configuration classes
│   └── src/main/resources/       # Configuration files
├── ai-report-service/            # Python FastAPI AI service
│   ├── app/
│   │   ├── api/                  # API endpoints
│   │   ├── models/               # Pydantic models
│   │   └── services/             # AI generation services
│   └── requirements.txt          # Python dependencies
├── docker-compose.yml            # Docker orchestration
└── README.md                     # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `sam-freelance-docs/` directory
- Review the API documentation at `/api/docs` when running locally
