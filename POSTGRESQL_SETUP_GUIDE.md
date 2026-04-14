# 🐘 PostgreSQL Setup & Data Viewing Guide

## 📋 Table of Contents
1. [Install PostgreSQL](#install-postgresql)
2. [Setup Database](#setup-database)
3. [Configure Application](#configure-application)
4. [Migrate Data](#migrate-data)
5. [View Data](#view-data)
6. [GUI Tools](#gui-tools)

---

## 1️⃣ Install PostgreSQL

### Windows

**Option A: Official Installer (Recommended)**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer (PostgreSQL 15 or 16)
3. During installation:
   - Set password for `postgres` user (remember this!)
   - Port: 5432 (default)
   - Install pgAdmin 4 (GUI tool)

**Option B: Using Chocolatey**
```bash
choco install postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

---

## 2️⃣ Setup Database

### Step 1: Access PostgreSQL

**Windows:**
```bash
# Open Command Prompt or PowerShell
psql -U postgres
# Enter password you set during installation
```

**Linux/Mac:**
```bash
sudo -u postgres psql
```

### Step 2: Create Database & User

```sql
-- Create database
CREATE DATABASE multiagent_ai;

-- Create user
CREATE USER aiuser WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE multiagent_ai TO aiuser;

-- Connect to database
\c multiagent_ai

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO aiuser;

-- Exit
\q
```

### Step 3: Verify Connection

```bash
psql -U aiuser -d multiagent_ai -h localhost
# Enter password: your_secure_password
```

If successful, you'll see:
```
multiagent_ai=>
```

---

## 3️⃣ Configure Application

### Step 1: Install PostgreSQL Driver

```bash
cd BACKEND
pip install psycopg2-binary
```

### Step 2: Update .env File

Edit `BACKEND/.env`:

```env
# Change this line:
DATABASE_URL=sqlite:///./decision_logs.db

# To this:
DATABASE_URL=postgresql://aiuser:your_secure_password@localhost:5432/multiagent_ai

# Rest of the file stays the same
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
API_TITLE=Multi-Agent AI Orchestration API
API_VERSION=1.0.0
DEBUG=True
SECRET_KEY=dev-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
RATE_LIMIT_PER_MINUTE=10
```

### Step 3: Start Backend

```bash
cd BACKEND
uvicorn main:app --reload
```

The tables will be created automatically!

---

## 4️⃣ Migrate Data (Optional)

If you have existing SQLite data you want to keep:

### Option A: Manual Migration (Small Data)

**1. Export from SQLite:**
```bash
cd BACKEND
sqlite3 decision_logs.db .dump > sqlite_dump.sql
```

**2. Clean the dump file:**
- Remove SQLite-specific commands
- Adjust data types if needed

**3. Import to PostgreSQL:**
```bash
psql -U aiuser -d multiagent_ai -f sqlite_dump.sql
```

### Option B: Fresh Start (Recommended)

Just start using PostgreSQL - old SQLite data stays in `decision_logs.db` as backup.

---

## 5️⃣ View Data

### Method 1: Command Line (psql)

```bash
# Connect to database
psql -U aiuser -d multiagent_ai -h localhost

# List all tables
\dt

# View users table
SELECT * FROM users;

# View queries table
SELECT * FROM queries;

# View with formatting
\x
SELECT * FROM users;

# Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM queries;

# Join queries with users
SELECT 
    u.username,
    u.email,
    q.query_text,
    q.status,
    q.created_at
FROM queries q
JOIN users u ON q.user_id = u.user_id
ORDER BY q.created_at DESC
LIMIT 10;

# View recent queries
SELECT 
    query_id,
    user_id,
    LEFT(query_text, 50) as problem,
    status,
    created_at
FROM queries
ORDER BY created_at DESC
LIMIT 10;

# Exit
\q
```

### Method 2: pgAdmin 4 (GUI - Easiest!)

**Already installed with PostgreSQL on Windows**

1. **Open pgAdmin 4**
   - Start Menu → pgAdmin 4

2. **Connect to Server**
   - Expand "Servers"
   - Right-click → Create → Server
   - Name: "Local PostgreSQL"
   - Connection tab:
     - Host: localhost
     - Port: 5432
     - Database: multiagent_ai
     - Username: aiuser
     - Password: your_secure_password
   - Save

3. **View Tables**
   - Expand: Servers → Local PostgreSQL → Databases → multiagent_ai → Schemas → public → Tables
   - Right-click table → View/Edit Data → All Rows

4. **Run Queries**
   - Tools → Query Tool
   - Write SQL and click Execute (F5)

### Method 3: DBeaver (Cross-Platform GUI)

**Download:** https://dbeaver.io/download/

1. **Install DBeaver**
2. **Create Connection**
   - Database → New Database Connection
   - Select PostgreSQL
   - Host: localhost
   - Port: 5432
   - Database: multiagent_ai
   - Username: aiuser
   - Password: your_secure_password
   - Test Connection → Finish

3. **View Data**
   - Expand connection → multiagent_ai → Schemas → public → Tables
   - Double-click table to view data
   - Right-click → View Data

### Method 4: VS Code Extension

**Install:** PostgreSQL extension by Chris Kolkman

1. Install extension
2. Add connection:
   - Host: localhost
   - User: aiuser
   - Password: your_secure_password
   - Port: 5432
   - Database: multiagent_ai
3. Browse tables and run queries

---

## 6️⃣ Useful SQL Queries

### View All Users
```sql
SELECT 
    user_id,
    username,
    email,
    full_name,
    is_active,
    is_admin,
    created_at
FROM users
ORDER BY created_at DESC;
```

### View User's Queries
```sql
SELECT 
    u.username,
    q.query_id,
    q.query_text,
    q.status,
    q.created_at
FROM queries q
JOIN users u ON q.user_id = u.user_id
WHERE u.username = 'testuser'
ORDER BY q.created_at DESC;
```

### View Query with Full Details
```sql
SELECT 
    q.query_id,
    u.username,
    q.query_text,
    q.status,
    q.created_at,
    e.explanation_text
FROM queries q
JOIN users u ON q.user_id = u.user_id
LEFT JOIN explanations e ON q.query_id = e.query_id
WHERE q.query_id = 1;
```

### View Tasks for a Query
```sql
SELECT 
    t.task_id,
    t.agent_name,
    t.status,
    t.created_at,
    t.completed_at,
    r.response_text,
    r.confidence_score
FROM tasks t
LEFT JOIN responses r ON t.task_id = r.task_id
WHERE t.query_id = 1
ORDER BY t.created_at;
```

### Statistics
```sql
-- Total users
SELECT COUNT(*) as total_users FROM users;

-- Total queries
SELECT COUNT(*) as total_queries FROM queries;

-- Queries by status
SELECT status, COUNT(*) as count
FROM queries
GROUP BY status;

-- Queries per user
SELECT 
    u.username,
    COUNT(q.query_id) as query_count
FROM users u
LEFT JOIN queries q ON u.user_id = q.user_id
GROUP BY u.username
ORDER BY query_count DESC;

-- Recent activity
SELECT 
    u.username,
    q.query_id,
    LEFT(q.query_text, 30) as problem,
    q.status,
    q.created_at
FROM queries q
JOIN users u ON q.user_id = u.user_id
ORDER BY q.created_at DESC
LIMIT 20;
```

### Search Queries
```sql
-- Search by keyword
SELECT 
    query_id,
    user_id,
    query_text,
    created_at
FROM queries
WHERE query_text ILIKE '%security%'
ORDER BY created_at DESC;

-- Queries from last 24 hours
SELECT 
    u.username,
    q.query_text,
    q.created_at
FROM queries q
JOIN users u ON q.user_id = u.user_id
WHERE q.created_at > NOW() - INTERVAL '24 hours'
ORDER BY q.created_at DESC;
```

---

## 7️⃣ Database Management

### Backup Database
```bash
# Full backup
pg_dump -U aiuser -d multiagent_ai > backup.sql

# Backup with timestamp
pg_dump -U aiuser -d multiagent_ai > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
psql -U aiuser -d multiagent_ai < backup.sql
```

### Drop All Tables (Reset)
```sql
DROP TABLE IF EXISTS explanations CASCADE;
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS queries CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then restart backend to recreate tables.

---

## 8️⃣ Monitoring & Performance

### Check Table Sizes
```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Active Connections
```sql
SELECT 
    datname,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'multiagent_ai';
```

### View Indexes
```sql
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 9️⃣ Troubleshooting

### Can't Connect to PostgreSQL

**Check if PostgreSQL is running:**
```bash
# Windows
sc query postgresql-x64-15

# Linux
sudo systemctl status postgresql

# Mac
brew services list
```

**Start PostgreSQL:**
```bash
# Windows
net start postgresql-x64-15

# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql@15
```

### Authentication Failed

1. Check password is correct
2. Check `pg_hba.conf` file:
   - Windows: `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`
   - Linux: `/etc/postgresql/15/main/pg_hba.conf`
3. Ensure line exists:
   ```
   host    all    all    127.0.0.1/32    md5
   ```

### Connection Refused

1. Check PostgreSQL is running
2. Check port 5432 is not blocked
3. Verify DATABASE_URL in `.env`

### Tables Not Created

1. Check backend logs: `BACKEND/logs/app.log`
2. Verify database connection
3. Check user has permissions:
   ```sql
   GRANT ALL ON SCHEMA public TO aiuser;
   ```

---

## 🔟 Quick Reference

### Connection String Format
```
postgresql://username:password@host:port/database
```

### Common Commands
```bash
# Connect
psql -U aiuser -d multiagent_ai -h localhost

# List databases
\l

# List tables
\dt

# Describe table
\d users

# Execute SQL file
\i script.sql

# Export query results
\o output.txt
SELECT * FROM users;
\o

# Quit
\q
```

---

## 📊 Comparison: SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| **Concurrent Writes** | ❌ Limited | ✅ Excellent |
| **Data Size** | ⚠️ Up to ~140TB | ✅ Unlimited |
| **Users** | ⚠️ Single | ✅ Multiple |
| **Performance** | ✅ Fast (small) | ✅ Fast (large) |
| **Backup** | ✅ Copy file | ✅ pg_dump |
| **GUI Tools** | ⚠️ Limited | ✅ Many options |
| **Production** | ❌ Not recommended | ✅ Recommended |

---

## 🎯 Recommended Setup

### Development
- Use SQLite for quick testing
- Easy setup, no installation

### Production
- Use PostgreSQL
- Better performance
- Multiple users
- Better tools
- Industry standard

---

## 📚 Additional Resources

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **pgAdmin Docs**: https://www.pgadmin.org/docs/
- **DBeaver**: https://dbeaver.io/
- **SQL Tutorial**: https://www.postgresqltutorial.com/

---

## ✅ Checklist

- [ ] PostgreSQL installed
- [ ] Database created
- [ ] User created with permissions
- [ ] `.env` file updated
- [ ] psycopg2-binary installed
- [ ] Backend started successfully
- [ ] Tables created automatically
- [ ] Can connect with psql
- [ ] Can view data in GUI tool
- [ ] Backup strategy in place

---

## 🎉 You're Done!

You can now:
- ✅ View all your data in PostgreSQL
- ✅ Use professional GUI tools
- ✅ Run complex queries
- ✅ Monitor performance
- ✅ Backup/restore data
- ✅ Scale to production

**Your application is now using enterprise-grade database! 🚀**
