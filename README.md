# Multi-Agent AI Orchestration System

An explainable AI governance system that uses multiple specialized agents to analyze problems, assess risks, and make policy-based decisions with full transparency.

## 🎯 Overview

This project demonstrates a multi-agent architecture where three specialized AI agents work together to:
- **Analyze** problem indicators
- **Assess** risk levels using quantitative models
- **Apply** governance policies for final decisions

All decisions are fully explainable with step-by-step reasoning traces.

## 🏗️ Architecture

```
Frontend (React) → Backend API (FastAPI) → Orchestrator → Agents
                                              ↓
                                         Database (SQLite)
```

### Agents

1. **AnalysisAgent**: Evaluates impact, likelihood, urgency, and confidence parameters
2. **RiskAgent**: Calculates risk scores using formula: `(Impact × Likelihood) + Urgency - Confidence`
3. **GovernanceAgent**: Applies policy rules (HIGH→BLOCK, MEDIUM→REVIEW, LOW→ALLOW)

## ✨ Recent Improvements (v2.0)

### 🔒 Security
- ✅ CORS restricted to specific origins
- ✅ Rate limiting (10 requests/minute)
- ✅ Input validation with Pydantic
- ✅ Environment-based configuration

### 📊 Database
- ✅ Timestamps on all records
- ✅ Proper relationships and indexes
- ✅ Connection pooling
- ✅ Optimized transactions

### 🔍 Error Handling & Logging
- ✅ Comprehensive logging system
- ✅ Specific exception handling
- ✅ User-friendly error messages
- ✅ Health check endpoint

### 🎨 Frontend
- ✅ Input validation
- ✅ Character counter
- ✅ Error display
- ✅ Disabled button states
- ✅ Modern dashboard UI

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- pip and npm

### Backend Setup

1. Navigate to backend directory:
```bash
cd BACKEND
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configuration is already set in `.env` file (edit if needed)

4. Run the server:
```bash
uvicorn main:app --reload
```

Backend will run on `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configuration is already set in `.env` file

4. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Fast setup guide
- **[FIXES_IMPLEMENTATION_GUIDE.md](FIXES_IMPLEMENTATION_GUIDE.md)** - Detailed implementation guide
- **[FIXES_SUMMARY.md](FIXES_SUMMARY.md)** - Summary of all improvements
- **[PROJECT_WEAKNESSES_ANALYSIS.md](PROJECT_WEAKNESSES_ANALYSIS.md)** - Complete weakness analysis
- **[DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)** - Database migration instructions
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

## 📊 Usage

1. Open the frontend in your browser at `http://localhost:3000`
2. Enter a problem description (minimum 10 characters)
3. Adjust the parameter sliders:
   - **Impact** (1-10): Severity of the issue
   - **Likelihood** (1-10): Probability of occurrence
   - **Urgency** (1-10): Time sensitivity
   - **Confidence** (1-10): Data reliability
4. Click "Analyze with AI Agents"
5. Review each agent's output and the final decision with full explanation

## 🗂️ Project Structure

```
MULTIAGENT_AI_ORCHESTRATION/
├── BACKEND/
│   ├── .env                       # Configuration (created)
│   ├── config.py                  # Settings loader (new)
│   ├── schemas.py                 # Validation schemas (new)
│   ├── logger.py                  # Logging config (new)
│   ├── main.py                    # FastAPI app (improved)
│   ├── models.py                  # Database models (improved)
│   ├── requirements.txt           # Dependencies (updated)
│   ├── logs/                      # Log files (auto-created)
│   ├── agents/
│   │   ├── analysis_agent.py      # Problem analysis
│   │   ├── risk_agent.py          # Risk scoring
│   │   └── governance_agent.py    # Policy enforcement
│   ├── database/
│   │   └── database.py            # Database setup (improved)
│   └── orchestration/
│       └── orchestrator.py        # Agent coordination (improved)
└── frontend/
    ├── .env                       # Configuration (created)
    ├── src/
    │   ├── App.js                 # Main component (improved)
    │   └── App.css                # Styling (improved)
    └── package.json
```

## 🔍 API Endpoints

### POST /analyze
Analyzes a problem using the multi-agent system.

**Request:**
```json
{
  "problem_description": "Security vulnerability detected in production",
  "parameters": {
    "impact": 8,
    "likelihood": 7,
    "urgency": 9,
    "confidence": 6
  }
}
```

**Response:**
```json
{
  "analysis_output": {...},
  "risk_output": {...},
  "governance_output": {...},
  "final_decision": "BLOCK",
  "explanation": "...",
  "query_id": 1
}
```

### GET /
Root endpoint - returns API status.

### GET /health
Health check endpoint - verifies database connection.

### API Documentation
Interactive API docs available at: `http://127.0.0.1:8000/docs`

## 🗄️ Database Schema

- **queries**: Stores user queries with timestamps
- **tasks**: Tracks agent tasks with execution times
- **responses**: Stores agent responses with confidence scores
- **explanations**: Logs decision explanations

All tables include:
- Timestamps (created_at, updated_at)
- Proper relationships
- Indexed foreign keys

## 🔧 Technologies Used

**Backend:**
- FastAPI - Modern web framework
- SQLAlchemy - ORM
- Pydantic - Data validation
- Uvicorn - ASGI server
- slowapi - Rate limiting

**Frontend:**
- React 18 - UI framework
- CSS3 - Styling

**Database:**
- SQLite (development)
- PostgreSQL recommended for production

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://127.0.0.1:8000/health
```

### Test Rate Limiting
```bash
for i in {1..15}; do curl http://127.0.0.1:8000/; done
```

### Check Logs
```bash
cat BACKEND/logs/app.log
cat BACKEND/logs/error.log
```

## 📈 Future Enhancements

### High Priority
- [ ] User authentication (JWT)
- [ ] PostgreSQL migration
- [ ] Unit tests (pytest, Jest)
- [ ] API key management

### Medium Priority
- [ ] Caching layer (Redis)
- [ ] Async processing (Celery)
- [ ] Monitoring (Prometheus)
- [ ] Advanced risk models

### Low Priority
- [ ] Decision history dashboard
- [ ] Export decision reports
- [ ] Multi-user support
- [ ] Real-time notifications

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port is in use
netstat -ano | findstr :8000

# Try different port
uvicorn main:app --reload --port 8001
```

### Frontend can't connect
1. Verify backend is running
2. Check `.env` file has correct API_URL
3. Verify CORS settings in backend `.env`

### Database errors
```bash
# Delete and recreate
rm BACKEND/decision_logs.db
# Restart backend
```

### Rate limit errors
- Wait 1 minute between requests
- Or increase limit in `.env`: `RATE_LIMIT_PER_MINUTE=100`

## 📝 Configuration

### Backend (.env)
```env
DATABASE_URL=sqlite:///./decision_logs.db
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
RATE_LIMIT_PER_MINUTE=10
DEBUG=True
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

## 🔒 Security Notes

- CORS is configured for localhost only
- Rate limiting prevents abuse
- Input validation on all endpoints
- SQL injection protected by ORM
- Environment variables for secrets
- **TODO**: Add authentication for production

## 📊 Project Status

**Version**: 2.0 (Fixed)
**Status**: Development/Demo Ready
**Production Ready**: ⚠️ Needs authentication
**Rating**: 8.5/10

### What's Working
- ✅ Multi-agent decision making
- ✅ Explainable AI reasoning
- ✅ Modern dashboard UI
- ✅ Comprehensive logging
- ✅ Error handling
- ✅ Input validation
- ✅ Rate limiting
- ✅ Database audit trail

### What's Needed for Production
- ⚠️ User authentication
- ⚠️ PostgreSQL database
- ⚠️ Unit tests
- ⚠️ Deployment configuration
- ⚠️ Monitoring/metrics

## 📝 License

This project is for educational purposes.

## 👥 Contributing

Feel free to submit issues and enhancement requests!

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- React for the UI library
- SQLAlchemy for database management

---

**For detailed setup instructions, see [QUICK_START.md](QUICK_START.md)**

**For implementation details, see [FIXES_IMPLEMENTATION_GUIDE.md](FIXES_IMPLEMENTATION_GUIDE.md)**
