# 🚀 Quick Start Guide

## Prerequisites
- Python 3.8+
- Node.js 14+
- pip
- npm

## 1️⃣ Backend Setup (5 minutes)

```bash
# Navigate to backend
cd BACKEND

# Install dependencies
pip install -r requirements.txt

# The .env file is already created with default values
# You can edit it if needed

# Run the server
uvicorn main:app --reload
```

✅ Backend running at: http://127.0.0.1:8000
✅ API Docs at: http://127.0.0.1:8000/docs

## 2️⃣ Frontend Setup (3 minutes)

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# The .env file is already created
# Run the app
npm start
```

✅ Frontend running at: http://localhost:3000

## 3️⃣ Test It Out

1. Open browser to http://localhost:3000
2. Enter a problem description (min 10 characters)
3. Adjust the sliders
4. Click "Analyze with AI Agents"
5. See the results!

## 🔍 Verify Everything Works

### Check Backend Health
```bash
curl http://127.0.0.1:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "message": "Multi-Agent AI Orchestration API",
  "database_connected": true
}
```

### Check Logs
```bash
# View application logs
cat BACKEND/logs/app.log

# View error logs
cat BACKEND/logs/error.log
```

### Check Database
```bash
# Database file created at
BACKEND/decision_logs.db
```

## 🎯 What's New?

### Security ✅
- CORS properly configured
- Rate limiting (10 requests/minute)
- Input validation

### Error Handling ✅
- Comprehensive logging
- User-friendly error messages
- Specific exception handling

### Database ✅
- Timestamps on all records
- Proper relationships
- Optimized transactions

### Frontend ✅
- Input validation
- Character counter
- Disabled button states
- Error display

## 📊 Test Scenarios

### 1. Valid Request
```
Description: "Security vulnerability in production system"
Impact: 8
Likelihood: 7
Urgency: 9
Confidence: 6

Expected: BLOCK decision
```

### 2. Low Risk Request
```
Description: "Minor UI bug in development environment"
Impact: 2
Likelihood: 3
Urgency: 2
Confidence: 8

Expected: ALLOW decision
```

### 3. Medium Risk Request
```
Description: "Performance issue affecting some users"
Impact: 5
Likelihood: 6
Urgency: 5
Confidence: 5

Expected: REVIEW decision
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000  # Windows
# lsof -i :8000  # Linux/Mac

# Try different port
uvicorn main:app --reload --port 8001
```

### Frontend can't connect
1. Verify backend is running
2. Check .env file has correct API_URL
3. Check CORS settings in backend .env

### Database errors
```bash
# Delete and recreate database
rm BACKEND/decision_logs.db
# Restart backend (will auto-create)
```

### Rate limit errors
- Wait 1 minute between requests
- Or increase limit in .env: `RATE_LIMIT_PER_MINUTE=100`

## 📁 Project Structure

```
MULTIAGENT_AI_ORCHESTRATION/
├── BACKEND/
│   ├── .env                    ← Configuration
│   ├── config.py               ← Settings loader
│   ├── main.py                 ← API endpoints
│   ├── schemas.py              ← Validation
│   ├── logger.py               ← Logging
│   ├── models.py               ← Database models
│   ├── requirements.txt        ← Dependencies
│   ├── logs/                   ← Log files
│   │   ├── app.log
│   │   └── error.log
│   ├── agents/
│   │   ├── analysis_agent.py
│   │   ├── risk_agent.py
│   │   └── governance_agent.py
│   ├── database/
│   │   └── database.py
│   └── orchestration/
│       └── orchestrator.py
└── frontend/
    ├── .env                    ← Configuration
    ├── src/
    │   ├── App.js              ← Main component
    │   └── App.css             ← Styles
    └── package.json
```

## 🎉 You're All Set!

Your multi-agent AI system is now:
- ✅ Secure
- ✅ Well-structured
- ✅ Production-ready (with some TODOs)
- ✅ Easy to maintain
- ✅ Properly logged
- ✅ Validated

## 📚 Next Steps

1. Read `FIXES_IMPLEMENTATION_GUIDE.md` for details
2. Read `PROJECT_WEAKNESSES_ANALYSIS.md` for remaining issues
3. Add authentication (see guide)
4. Write tests
5. Deploy to production

---

**Happy coding! 🚀**
