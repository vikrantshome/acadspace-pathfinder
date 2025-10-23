# 🚀 Naviksha AI - Quick Setup Guide

## ⚡ Quick Start (2 Minutes)

### Step 1: Start the Backend

```bash
# Option A: Using Docker (Recommended)
docker-compose up --build

# Wait for "Started NavikshaApplication" message
```

**OR**

```bash
# Option B: Manual Setup
# 1. Start MongoDB
docker run -d -p 27017:27017 --name naviksha-mongo mongo:6.0

# 2. Start Spring Boot backend
cd backend
mvn spring-boot:run

# Wait for "Started NavikshaApplication" message
```

### Step 2: Seed the Database

```bash
# In a new terminal
cd backend
chmod +x scripts/seed.sh
./scripts/seed.sh
```

This creates:
- ✅ Career database (100+ careers)
- ✅ Test questions (vibematch + edustats)
- ✅ Demo user account

### Step 3: Start the Frontend

```bash
# In a new terminal, from project root
npm install
npm run dev
```

Frontend will open at: **http://localhost:5173**

---

## 🎯 Test Your Setup

### 1. Check Backend Health

Open: http://localhost:4000/health

Should show:
```json
{
  "status": "UP",
  "timestamp": "2025-10-02T...",
  "database": "connected"
}
```

### 2. Login to the App

Go to: http://localhost:5173/auth

**Demo Account:**
- **Email**: demo@naviksha.ai  
- **Password**: demo123

**OR**

Click "Create account" to register a new user.

### 3. Take the Assessment

After login:
1. Click "Get Started"
2. Complete the Personality Test (15 questions)
3. Complete the Academic Test (15 questions)
4. View your personalized career report!

---

## 🐛 Troubleshooting

### "Sign in/Sign up doesn't work"

**Problem**: Frontend can't connect to backend

**Solution**:
1. Check if backend is running:
   ```bash
   curl http://localhost:4000/health
   ```

2. If not running, start it:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. Clear browser cache and refresh:
   - Press `Ctrl+Shift+Delete` (Windows/Linux)
   - Press `Cmd+Shift+Delete` (Mac)
   - Select "Cached images and files"
   - Clear and refresh page

### "Backend connection refused"

**Check if ports are free:**
```bash
# Check if port 4000 is in use
lsof -i :4000

# Check if MongoDB port is in use
lsof -i :27017
```

**Kill processes if needed:**
```bash
kill -9 <PID>
```

### "Database is empty / No careers found"

**Re-run the seed script:**
```bash
cd backend
./scripts/seed.sh --force
```

### "Cannot connect to MongoDB"

**If using Docker:**
```bash
# Check if MongoDB container is running
docker ps | grep mongo

# If not, start it
docker run -d -p 27017:27017 --name naviksha-mongo mongo:6.0
```

**If using local MongoDB:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start if not running
sudo systemctl start mongod
```

---

## 📋 Environment Variables

Create a `.env` file in the project root:

```bash
# Backend API URL (for local development)
VITE_BACKEND_URL=http://localhost:4000

# For production deployment:
# VITE_BACKEND_URL=https://your-backend.com
```

### Backend Environment (.env or system)

```bash
# Database
MONGO_URI=mongodb://localhost:27017/naviksha

# Security (CHANGE THESE FOR PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
ADMIN_SECRET=your-admin-secret

# Server
PORT=4000
SPRING_PROFILES_ACTIVE=dev
```

---

## 🎓 User Guide

### For Students

1. **Register**: Create your account with email/password
2. **Take Tests**: Complete both assessments (8-12 minutes total)
3. **View Results**: Get personalized career recommendations
4. **Explore Careers**: Click on careers to see details
5. **Download Report**: Export your report as PDF (coming soon)

### For Developers

- **API Docs**: http://localhost:4000/swagger-ui.html (coming soon)
- **Admin Panel**: Use admin endpoints with `X-Admin-Secret` header
- **Database**: Access MongoDB at `mongodb://localhost:27017/naviksha`

---

## 📚 Next Steps

1. **Read Full Documentation**: See `COMPLETE_DOCUMENTATION.md`
2. **Explore API**: Check `backend/README.md` for API reference
3. **Run Tests**: `cd backend && mvn test`
4. **Deploy**: Follow deployment guide in documentation

---

## 🆘 Still Having Issues?

1. **Check Console Logs**: Open Browser DevTools (F12) → Console
2. **Check Backend Logs**: Look at terminal where backend is running
3. **Restart Everything**:
   ```bash
   # Stop all
   docker-compose down
   
   # Start fresh
   docker-compose up --build
   cd backend && ./scripts/seed.sh
   ```

4. **Contact Support**: Check GitHub Issues or documentation

---

## ✅ Success Checklist

- [ ] Backend running at http://localhost:4000
- [ ] Health check shows "UP" status
- [ ] Database seeded with careers and tests
- [ ] Frontend running at http://localhost:5173
- [ ] Can register new account
- [ ] Can login with demo account (demo@naviksha.ai / demo123)
- [ ] Can complete personality test
- [ ] Can view career report

If all checked ✅, you're ready to go! 🎉

---

## 🤖 AI Microservice Setup (NEW!)

The platform now includes an AI-powered report generation service that enhances career reports with personalized insights.

### AI Service Quick Start

#### Option A: Docker (Recommended)
The AI service is automatically included when you run:
```bash
docker-compose up --build
```

#### Option B: Manual Setup
```bash
# 1. Navigate to AI service directory
cd ai-report-service

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp env.example .env
# Edit .env with your API keys (see below)

# 5. Start the AI service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### AI Service Configuration

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

#### AI Provider Options

**Groq (Recommended - Cost Effective):**
```env
AI_MODEL_PROVIDER=groq
AI_MODEL_NAME=llama3-8b-8192
AI_MODEL_API_KEY=your-groq-api-key
```

**OpenAI:**
```env
AI_MODEL_PROVIDER=openai
AI_MODEL_NAME=gpt-3.5-turbo
AI_MODEL_API_KEY=your-openai-api-key
```

### Test AI Service Integration

1. **Check AI Service Health:**
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","service":"ai-report-service"}
```

2. **Test Complete Flow with AI:**
```bash
# Login and get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@naviksha.ai", "password": "demo123"}'

# Submit assessment (replace YOUR_TOKEN with actual token)
curl -X POST http://localhost:4000/api/tests/combined/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userName": "Test User",
    "grade": 11,
    "board": "CBSE",
    "answers": {"v_01": 4, "v_02": 5, "v_03": 3, "v_04": 4, "v_05": 5},
    "subjectScores": {"Mathematics": 85, "Physics": 80, "Chemistry": 75},
    "extracurriculars": ["Coding", "Robotics"],
    "parentCareers": ["IT / Software"]
  }'
```

### AI Service Troubleshooting

#### "AI service not responding"
- Check if API key is correctly set in `.env` file
- Verify AI service is running: `curl http://localhost:8000/health`
- Check Docker logs: `docker-compose logs ai-report-service`

#### "Backend can't connect to AI service"
- Ensure AI service is running first
- Check Docker network connectivity
- Verify `AI_SERVICE_URL` in backend configuration

#### "No AI enhancements in reports"
- Check if AI service is enabled in backend configuration
- Verify API key is valid and has sufficient credits
- Check backend logs for AI service errors

### AI Service Features

The AI service provides:
- **Personalized Career Summaries**: AI-generated insights based on personality and academic profile
- **Skill Recommendations**: Targeted skill development suggestions
- **Career Trajectory Insights**: Long-term career path guidance
- **Detailed Explanations**: In-depth analysis of career matches
- **Study Path Recommendations**: Academic roadmap for chosen careers

---

**Happy Career Exploring! 🚀**
