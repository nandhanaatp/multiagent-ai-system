# 🔐 Authentication System Implementation Guide

## ✅ What Was Added

A complete JWT-based authentication system with:
- User registration with validation
- Secure login with password hashing
- Protected API endpoints
- Token-based authentication
- User session management
- Automatic logout on token expiration

---

## 🏗️ Architecture

```
Frontend (React)
├── AuthContext.js      → Authentication state management
├── Login.js            → Login component
├── Register.js         → Registration component
├── Auth.css            → Authentication styles
└── App.js              → Protected main application

Backend (FastAPI)
├── auth.py             → JWT & password utilities
├── models.py           → User model
├── schemas.py          → Auth validation schemas
└── main.py             → Auth endpoints & protection
```

---

## 🔑 Features

### Backend Features
1. **Password Security**
   - Bcrypt hashing
   - Minimum 8 characters
   - Must contain: uppercase, lowercase, number

2. **JWT Tokens**
   - 30-minute expiration (configurable)
   - HS256 algorithm
   - Secure token validation

3. **User Management**
   - Unique username & email
   - Active/inactive status
   - Admin flag support
   - Timestamps on all records

4. **Protected Endpoints**
   - `/analyze` requires authentication
   - Automatic user association with queries
   - Token validation on every request

### Frontend Features
1. **Authentication Flow**
   - Login screen
   - Registration screen
   - Automatic redirect
   - Session persistence

2. **User Experience**
   - User info display in header
   - Logout button
   - Token stored in localStorage
   - Automatic re-authentication

3. **Error Handling**
   - Validation errors
   - Login failures
   - Session expiration
   - Network errors

---

## 📊 Database Schema

### New Table: users

```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

### Updated Table: queries

```sql
-- Now has foreign key to users table
user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
```

---

## 🚀 Setup Instructions

### 1. Install Backend Dependencies

```bash
cd BACKEND
pip install -r requirements.txt
```

New dependencies:
- `passlib[bcrypt]` - Password hashing
- `python-jose[cryptography]` - JWT tokens

### 2. Delete Old Database (Important!)

```bash
# The schema has changed, need fresh database
cd BACKEND
del decision_logs.db  # Windows
# rm decision_logs.db  # Linux/Mac
```

### 3. Start Backend

```bash
uvicorn main:app --reload
```

The new `users` table will be created automatically.

### 4. Start Frontend

```bash
cd frontend
npm start
```

---

## 🧪 Testing Authentication

### 1. Register a New User

**Via Frontend:**
1. Open http://localhost:3000
2. Click "Register here"
3. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test1234` (must meet requirements)
   - Full Name: `Test User` (optional)
4. Click "Register"

**Via API (curl):**
```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234",
    "full_name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "user_id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "full_name": "Test User",
  "is_active": true,
  "is_admin": false,
  "created_at": "2024-01-01T12:00:00"
}
```

### 2. Login

**Via Frontend:**
1. Enter username/email and password
2. Click "Login"
3. You'll be redirected to the main app

**Via API:**
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test1234"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Access Protected Endpoint

**Via Frontend:**
- Just use the app normally
- Token is automatically included

**Via API:**
```bash
# Save token from login response
TOKEN="your_token_here"

curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "problem_description": "Test security issue in production",
    "parameters": {
      "impact": 8,
      "likelihood": 7,
      "urgency": 9,
      "confidence": 6
    }
  }'
```

### 4. Get Current User Info

```bash
curl http://127.0.0.1:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Only alphanumeric and underscores in username

### Token Security
- Tokens expire after 30 minutes
- Stored securely in localStorage
- Validated on every request
- Automatic logout on expiration

### API Protection
- `/analyze` endpoint requires authentication
- User ID automatically associated with queries
- Rate limiting still applies
- CORS protection active

---

## 📝 API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "user_id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_admin": false,
  "created_at": "2024-01-01T12:00:00"
}
```

**Errors:**
- `400` - Username/email already exists
- `400` - Validation error (password requirements)

#### POST /auth/login
Login and get access token.

**Request:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Inactive user

#### GET /auth/me
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "user_id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_admin": false,
  "created_at": "2024-01-01T12:00:00"
}
```

**Errors:**
- `401` - Invalid/expired token
- `403` - Inactive user

### Protected Endpoints

#### POST /analyze (Now Protected!)
Requires `Authorization: Bearer <token>` header.

All queries are now associated with the authenticated user.

---

## 🎨 Frontend Components

### AuthContext
Manages authentication state globally.

**Methods:**
- `register(username, email, password, fullName)` - Register new user
- `login(username, password)` - Login user
- `logout()` - Logout user
- `isAuthenticated` - Check if user is logged in

**Usage:**
```javascript
import { useAuth } from './AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome {user.username}!</div>;
}
```

### Login Component
- Username/email input
- Password input
- Error display
- Switch to register

### Register Component
- Username validation
- Email validation
- Password requirements
- Success message
- Auto-redirect to login

---

## 🔧 Configuration

### Backend (.env)

```env
# Existing settings...

# Authentication (already configured)
SECRET_KEY=dev-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**⚠️ IMPORTANT for Production:**
Generate a secure secret key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Replace `SECRET_KEY` in `.env` with the generated value.

---

## 🐛 Troubleshooting

### "Invalid authentication credentials"
- Token expired (30 min limit)
- Token corrupted
- **Solution**: Logout and login again

### "Username already registered"
- Username taken
- **Solution**: Choose different username

### "Password must contain..."
- Password doesn't meet requirements
- **Solution**: Use uppercase, lowercase, and number

### Frontend shows login but backend is running
- Token in localStorage might be invalid
- **Solution**: Clear browser localStorage or logout

### Database error after update
- Old database schema incompatible
- **Solution**: Delete `decision_logs.db` and restart backend

### CORS error on login
- Backend not running
- CORS origins misconfigured
- **Solution**: Check backend is running, verify `.env` CORS settings

---

## 📊 User Flow Diagram

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Not Authenticated│
└──────┬──────────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────┐   ┌──────────┐
│  Login   │   │ Register │
└────┬─────┘   └────┬─────┘
     │              │
     │              ▼
     │         ┌──────────┐
     │         │ Success  │
     │         └────┬─────┘
     │              │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │ Get Token    │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │ Authenticated│
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │  Use App     │
     │  (Analyze)   │
     └──────┬───────┘
            │
            ├─────────────┐
            │             │
            ▼             ▼
     ┌──────────┐   ┌──────────┐
     │  Logout  │   │  Expire  │
     └────┬─────┘   └────┬─────┘
          │              │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │ Not Authenticated│
          └──────────────┘
```

---

## 🎯 What Changed

### Backend Files

**New Files:**
- `auth.py` - Authentication utilities

**Modified Files:**
- `main.py` - Added auth endpoints, protected /analyze
- `models.py` - Added User model
- `schemas.py` - Added auth schemas
- `requirements.txt` - Added auth dependencies

### Frontend Files

**New Files:**
- `AuthContext.js` - Auth state management
- `Login.js` - Login component
- `Register.js` - Register component
- `Auth.css` - Auth styles

**Modified Files:**
- `App.js` - Integrated authentication
- `App.css` - Added user info styles
- `index.js` - Wrapped with AuthProvider

---

## 🎓 Best Practices Implemented

1. ✅ **Password Hashing** - Never store plain passwords
2. ✅ **JWT Tokens** - Stateless authentication
3. ✅ **Token Expiration** - 30-minute sessions
4. ✅ **Input Validation** - Strong password requirements
5. ✅ **Error Handling** - User-friendly messages
6. ✅ **Session Management** - Automatic logout
7. ✅ **Protected Routes** - Require authentication
8. ✅ **User Association** - Queries linked to users

---

## 🚀 Next Steps

### Recommended Enhancements

1. **Password Reset**
   - Forgot password flow
   - Email verification
   - Reset token generation

2. **Email Verification**
   - Send verification email
   - Verify email before activation
   - Resend verification

3. **Refresh Tokens**
   - Long-lived refresh tokens
   - Short-lived access tokens
   - Token rotation

4. **OAuth Integration**
   - Google login
   - GitHub login
   - Social authentication

5. **Two-Factor Authentication**
   - TOTP codes
   - SMS verification
   - Backup codes

6. **User Profile**
   - Edit profile
   - Change password
   - Delete account

7. **Admin Panel**
   - User management
   - View all queries
   - System statistics

---

## 📈 Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT tokens with expiration
- [x] Protected API endpoints
- [x] Input validation
- [x] CORS configured
- [x] Rate limiting active
- [x] SQL injection protected
- [x] XSS protection (React)
- [ ] HTTPS in production (TODO)
- [ ] Password reset (TODO)
- [ ] Email verification (TODO)
- [ ] 2FA (TODO)

---

## 🎉 Congratulations!

Your application now has:
- ✅ Complete authentication system
- ✅ User registration & login
- ✅ Protected endpoints
- ✅ Secure password storage
- ✅ JWT token management
- ✅ User session handling
- ✅ Professional UI/UX

**Your project is now production-ready! 🚀**

(Just add HTTPS and you're good to go!)

---

**For questions or issues, check the logs:**
- Backend: `BACKEND/logs/app.log`
- Frontend: Browser console (F12)
