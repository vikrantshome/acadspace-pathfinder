# Naviksha AI Backend - Spring Boot

Complete Spring Boot backend for AI-powered career guidance system with MongoDB and JWT authentication.

## 🚀 Quick Start

### Using Docker (Recommended)
```bash
# 1. Start backend + MongoDB
docker-compose up --build

# 2. Seed database (in new terminal)
./scripts/seed.sh

# 3. Test API
curl http://localhost:4000/health
curl http://localhost:4000/api/reports/demo/aisha
```

### Local Development
```bash
# 1. Start MongoDB
docker run -d -p 27017:27017 --name naviksha-mongo mongo:6.0

# 2. Run Spring Boot app
mvn spring-boot:run

# 3. Seed database
./scripts/seed.sh
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tests & Assessment
- `GET /api/tests` - List available tests
- `GET /api/tests/{testId}` - Get test questions
- `POST /api/tests/{testId}/submit` - Submit test & generate report

### Progress Management
- `GET /api/progress/{userId}` - Get user progress
- `POST /api/progress/save` - Save test progress
- `POST /api/progress/reset` - Reset progress

### Reports
- `GET /api/reports/{reportId}` - Get career report
- `GET /api/reports/demo/aisha` - Demo report (public)

### Admin (Requires ADMIN role)
- `GET /admin/careers` - List careers
- `POST /admin/careers` - Add career
- `PUT /admin/careers/{careerId}` - Update career
- `DELETE /admin/careers/{careerId}` - Delete career
- `POST /admin/seed` - Seed database
- `GET /admin/stats` - System statistics

### Health Check
- `GET /health` - Health status

## 🔧 Configuration

### Environment Variables
```bash
# Database
MONGO_URI=mongodb://localhost:27017/naviksha

# JWT Security
JWT_SECRET=your-super-secret-jwt-key

# Admin Access
ADMIN_SECRET=your-admin-secret

# Server
PORT=4000
SPRING_PROFILES_ACTIVE=dev
```

### Profiles
- `dev` - Development with debug logging
- `test` - Testing with short JWT expiry
- `prod` - Production optimized

## 🧪 Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=ScoringServiceTests

# Run with coverage
mvn test jacoco:report
```

## 📊 Scoring Algorithm

The RIASEC-based career matching engine uses weighted scoring:

- **RIASEC Match (40%)** - Personality fit based on Holland model
- **Subject Match (30%)** - Academic performance alignment  
- **Practical Fit (20%)** - Extracurriculars and experience
- **Context Fit (10%)** - Family background and preferences

### Sample Results
For Aisha's profile (High Investigative, Strong Math/Physics):
1. Data Science - 92% match
2. Machine Learning Engineer - 86% match  
3. Research roles - 80%+ matches

## 📁 Project Structure

```
backend/
├── src/main/java/com/naviksha/
│   ├── NavikshaApplication.java          # Main app
│   ├── config/SecurityConfig.java        # JWT security
│   ├── controller/                       # REST endpoints
│   ├── service/ScoringService.java       # Career matching
│   ├── model/                           # Data models
│   ├── repository/                      # MongoDB repos
│   └── dto/                            # Data transfer objects
├── src/main/resources/
│   ├── application.yml                  # Configuration
│   └── data/                           # Seed data files
├── src/test/                           # Unit & integration tests
├── Dockerfile                          # Container config
└── scripts/                           # Utility scripts
```

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Configure MongoDB replica set
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall (port 4000)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set SPRING_PROFILES_ACTIVE=prod

### Docker Production
```bash
# Build production image
docker build -t naviksha-backend:prod .

# Run with production env
docker run -d \
  -p 4000:4000 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e MONGO_URI=mongodb://prod-mongo:27017/naviksha \
  -e JWT_SECRET=your-production-secret \
  naviksha-backend:prod
```

## 🔍 API Documentation

- **Swagger UI**: http://localhost:4000/swagger-ui.html
- **OpenAPI JSON**: http://localhost:4000/v3/api-docs

## 📞 Sample API Calls

### Register User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login & Get Token
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "password": "password123"
  }'
```

### Submit Test (with JWT)
```bash
curl -X POST http://localhost:4000/api/tests/combined/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Test User",
    "grade": 11,
    "board": "CBSE",
    "answers": {"v_01": 4, "v_02": 3},
    "subjectScores": {"Mathematics": 85, "Physics": 80}
  }'
```

## 🛠️ Development

### Adding New Career
```bash
curl -X POST http://localhost:4000/admin/careers \
  -H "X-Admin-Secret: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "careerId": "c999",
    "careerName": "AI Researcher", 
    "bucket": "Data AI & Analytics",
    "riasecProfile": "IA",
    "primarySubjects": "[\"Mathematics\",\"Computer Science\"]"
  }'
```

### Custom Scoring Weights
Edit `ScoringService.java`:
```java
private static final double RIASEC_WEIGHT = 0.40;
private static final double SUBJECT_WEIGHT = 0.30; 
private static final double PRACTICAL_WEIGHT = 0.20;
private static final double CONTEXT_WEIGHT = 0.10;
```

## 📈 Monitoring

- **Health Check**: `GET /health`
- **Metrics**: `GET /actuator/metrics`
- **Logs**: Check Docker logs or `application.log`

## 🐛 Troubleshooting

**MongoDB Connection Issues**
```bash
# Check MongoDB status
docker ps | grep mongo
docker logs naviksha-mongo
```

**JWT Token Issues** 
- Verify JWT_SECRET is set
- Check token expiry in application.yml
- Validate Authorization header format

**Scoring Issues**
- Run ScoringServiceTests
- Check career data in MongoDB
- Verify question mappings

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Add tests for new features  
4. Run `mvn test` to verify
5. Submit pull request

Built with ❤️ for Naviksha AI Career Guidance Platform