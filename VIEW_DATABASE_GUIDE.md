# 🔍 Quick Guide: View PostgreSQL Data

## 🚀 Fastest Way (3 Steps)

### Step 1: Install PostgreSQL
**Windows:** Download from https://www.postgresql.org/download/windows/
- Install with pgAdmin 4 (GUI tool included)
- Set password for `postgres` user

### Step 2: Create Database
Open pgAdmin 4 or Command Prompt:
```sql
CREATE DATABASE multiagent_ai;
CREATE USER aiuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE multiagent_ai TO aiuser;
```

### Step 3: Update .env
```env
DATABASE_URL=postgresql://aiuser:yourpassword@localhost:5432/multiagent_ai
```

**Done! Start your backend and tables are created automatically.**

---

## 👀 View Data - 4 Easy Methods

### Method 1: pgAdmin 4 (Easiest - GUI)

**Already installed with PostgreSQL!**

1. Open pgAdmin 4
2. Create Server Connection:
   - Name: Local
   - Host: localhost
   - Port: 5432
   - Database: multiagent_ai
   - Username: aiuser
   - Password: yourpassword

3. View Data:
   - Navigate: Servers → Local → Databases → multiagent_ai → Schemas → public → Tables
   - Right-click any table → View/Edit Data → All Rows

**Visual Interface - No SQL needed!**

---

### Method 2: Command Line (psql)

```bash
# Connect
psql -U aiuser -d multiagent_ai -h localhost

# View all users
SELECT * FROM users;

# View all queries
SELECT * FROM queries;

# View with user info
SELECT 
    u.username,
    q.query_text,
    q.status,
    q.created_at
FROM queries q
JOIN users u ON q.user_id = u.user_id
ORDER BY q.created_at DESC;
```

---

### Method 3: DBeaver (Best Free Tool)

**Download:** https://dbeaver.io/download/

1. Install DBeaver
2. New Connection → PostgreSQL
3. Enter connection details
4. Browse tables visually
5. Run queries with autocomplete

**Features:**
- Visual query builder
- Export to Excel/CSV
- ER diagrams
- Data editor

---

### Method 4: VS Code Extension

**Install:** PostgreSQL extension

1. Install extension in VS Code
2. Add connection
3. Browse tables in sidebar
4. Run queries in editor

---

## 📊 Useful Queries

### See All Tables
```sql
\dt
```

### Count Records
```sql
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'queries', COUNT(*) FROM queries
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'responses', COUNT(*) FROM responses
UNION ALL
SELECT 'explanations', COUNT(*) FROM explanations;
```

### Recent Activity
```sql
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
```

### User Statistics
```sql
SELECT 
    u.username,
    u.email,
    COUNT(q.query_id) as total_queries,
    u.created_at as registered_at
FROM users u
LEFT JOIN queries q ON u.user_id = q.user_id
GROUP BY u.user_id
ORDER BY total_queries DESC;
```

### Query Details
```sql
SELECT 
    q.query_id,
    u.username,
    q.query_text,
    q.status,
    e.explanation_text,
    q.created_at
FROM queries q
JOIN users u ON q.user_id = u.user_id
LEFT JOIN explanations e ON q.query_id = e.query_id
WHERE q.query_id = 1;
```

---

## 🎨 pgAdmin 4 Screenshot Guide

### 1. Connect to Server
```
pgAdmin 4 → Servers → Right-click → Create → Server

General Tab:
  Name: Local PostgreSQL

Connection Tab:
  Host: localhost
  Port: 5432
  Database: multiagent_ai
  Username: aiuser
  Password: [your password]
  Save password: ✓

Click Save
```

### 2. Navigate to Tables
```
Servers
  └─ Local PostgreSQL
      └─ Databases
          └─ multiagent_ai
              └─ Schemas
                  └─ public
                      └─ Tables
                          ├─ users
                          ├─ queries
                          ├─ tasks
                          ├─ responses
                          └─ explanations
```

### 3. View Data
```
Right-click on 'users' table
  → View/Edit Data
      → All Rows

You'll see a spreadsheet-like view with all user data!
```

### 4. Run Custom Query
```
Tools → Query Tool

Type your SQL:
  SELECT * FROM users WHERE is_active = true;

Press F5 or click Execute button

Results appear below!
```

---

## 🔄 SQLite to PostgreSQL Migration

### Keep Both (Recommended)
1. Keep SQLite as backup: `decision_logs.db`
2. Start fresh with PostgreSQL
3. Old data preserved, new data in PostgreSQL

### Migrate Data (If Needed)
```bash
# Export from SQLite
sqlite3 decision_logs.db .dump > backup.sql

# Import to PostgreSQL (after cleaning)
psql -U aiuser -d multiagent_ai < backup.sql
```

---

## 📱 Mobile/Remote Access

### Using pgAdmin Web
1. pgAdmin 4 has web interface
2. Access from any browser
3. Secure with password

### Using TablePlus (Mac/Windows/Linux)
**Download:** https://tableplus.com/

- Beautiful native app
- Fast and lightweight
- Multiple database support
- Free tier available

---

## 🎯 Quick Comparison

| Tool | Best For | Difficulty | Features |
|------|----------|------------|----------|
| **pgAdmin 4** | Beginners | Easy | Full-featured, free |
| **DBeaver** | Power users | Easy | Best free tool |
| **psql** | Developers | Medium | Fast, scriptable |
| **VS Code** | Coders | Easy | Integrated workflow |
| **TablePlus** | Mac users | Easy | Beautiful UI |

---

## 💡 Pro Tips

### 1. Enable Query History
In pgAdmin: File → Preferences → Query Tool → Enable query history

### 2. Export Data
Right-click table → Import/Export → Export to CSV/Excel

### 3. Visual Explain
Write query → Explain → Visual Explain (see query performance)

### 4. Keyboard Shortcuts
- F5: Execute query
- F7: Explain query
- Ctrl+Space: Autocomplete

### 5. Save Queries
Save frequently used queries as files or snippets

---

## 🐛 Common Issues

### "Connection refused"
**Solution:** PostgreSQL not running
```bash
# Windows
net start postgresql-x64-15

# Linux
sudo systemctl start postgresql
```

### "Password authentication failed"
**Solution:** Wrong password or user doesn't exist
- Double-check password
- Recreate user if needed

### "Database does not exist"
**Solution:** Create database first
```sql
CREATE DATABASE multiagent_ai;
```

### Can't see tables
**Solution:** Tables not created yet
- Start backend once to create tables
- Check logs: `BACKEND/logs/app.log`

---

## ✅ Checklist

- [ ] PostgreSQL installed
- [ ] pgAdmin 4 installed (comes with PostgreSQL)
- [ ] Database created
- [ ] User created
- [ ] `.env` updated
- [ ] Backend started (creates tables)
- [ ] Connected in pgAdmin
- [ ] Can view data

---

## 🎉 You're Ready!

Now you can:
- ✅ View all your data visually
- ✅ Run SQL queries easily
- ✅ Export data to Excel/CSV
- ✅ Monitor database activity
- ✅ Backup and restore
- ✅ Analyze query performance

**Much better than SQLite! 🚀**

---

## 📚 Learn More

- **PostgreSQL Tutorial**: https://www.postgresqltutorial.com/
- **pgAdmin Docs**: https://www.pgadmin.org/docs/
- **SQL Practice**: https://sqlzoo.net/

---

**Need help? Check the full guide: [POSTGRESQL_SETUP_GUIDE.md](POSTGRESQL_SETUP_GUIDE.md)**
