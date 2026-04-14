# 🗄️ Database Migration Guide

## ⚠️ Important Notice

The database schema has been updated with new columns and relationships. If you have an existing `decision_logs.db` file, you have two options:

---

## Option 1: Fresh Start (Recommended for Development)

### Steps:
1. **Backup existing database** (if you want to keep old data)
```bash
cd BACKEND
copy decision_logs.db decision_logs.db.backup  # Windows
# cp decision_logs.db decision_logs.db.backup  # Linux/Mac
```

2. **Delete old database**
```bash
del decision_logs.db  # Windows
# rm decision_logs.db  # Linux/Mac
```

3. **Restart backend** (will auto-create new schema)
```bash
uvicorn main:app --reload
```

4. **Verify new schema**
```bash
# Check logs
cat logs/app.log | grep "Database tables created"
```

### Pros:
- ✅ Clean slate
- ✅ No migration errors
- ✅ Guaranteed correct schema

### Cons:
- ❌ Lose existing data

---

## Option 2: Manual Migration (Keep Existing Data)

### Prerequisites:
```bash
pip install alembic
```

### Steps:

1. **Initialize Alembic**
```bash
cd BACKEND
alembic init alembic
```

2. **Configure Alembic**

Edit `alembic.ini`:
```ini
sqlalchemy.url = sqlite:///./decision_logs.db
```

Edit `alembic/env.py`:
```python
from models import Base
target_metadata = Base.metadata
```

3. **Create Migration**
```bash
alembic revision --autogenerate -m "Add timestamps and relationships"
```

4. **Review Migration**
```bash
# Check the generated file in alembic/versions/
```

5. **Apply Migration**
```bash
alembic upgrade head
```

### Pros:
- ✅ Keep existing data
- ✅ Proper migration tracking

### Cons:
- ❌ More complex
- ❌ May need manual fixes

---

## Schema Changes

### New Columns Added:

#### queries table:
```sql
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### tasks table:
```sql
agent_name VARCHAR(100) NOT NULL  -- Renamed from task_description
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
completed_at DATETIME
```

#### responses table:
```sql
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### explanations table:
```sql
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
```

### Removed Columns:

#### queries table:
```sql
query_type  -- Removed (unused)
```

#### tasks table:
```sql
agent_id    -- Removed (replaced with agent_name)
priority    -- Removed (unused)
```

### New Relationships:
- Query → Tasks (one-to-many)
- Query → Explanations (one-to-many)
- Task → Responses (one-to-many)

### New Indexes:
- queries.user_id
- tasks.query_id
- responses.task_id
- explanations.query_id

---

## Manual Migration SQL (Alternative)

If you want to manually migrate:

```sql
-- Backup first!
.backup decision_logs.db.backup

-- Add new columns to queries
ALTER TABLE queries ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE queries ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE queries DROP COLUMN query_type;

-- Add new columns to tasks
ALTER TABLE tasks ADD COLUMN agent_name VARCHAR(100);
ALTER TABLE tasks ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tasks ADD COLUMN completed_at DATETIME;
UPDATE tasks SET agent_name = task_description;
ALTER TABLE tasks DROP COLUMN agent_id;
ALTER TABLE tasks DROP COLUMN priority;

-- Add new columns to responses
ALTER TABLE responses ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Add new columns to explanations
ALTER TABLE explanations ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Create indexes
CREATE INDEX idx_queries_user_id ON queries(user_id);
CREATE INDEX idx_tasks_query_id ON tasks(query_id);
CREATE INDEX idx_responses_task_id ON responses(task_id);
CREATE INDEX idx_explanations_query_id ON explanations(query_id);
```

**Note**: SQLite has limited ALTER TABLE support. Some operations may require table recreation.

---

## Verification

After migration, verify the schema:

### Using Python:
```python
from database.database import engine
from sqlalchemy import inspect

inspector = inspect(engine)

# Check tables
print("Tables:", inspector.get_table_names())

# Check columns for each table
for table in inspector.get_table_names():
    print(f"\n{table} columns:")
    for column in inspector.get_columns(table):
        print(f"  - {column['name']}: {column['type']}")
```

### Using SQLite CLI:
```bash
sqlite3 decision_logs.db

.schema queries
.schema tasks
.schema responses
.schema explanations
```

Expected output should show all new columns and indexes.

---

## Troubleshooting

### Error: "no such column: created_at"
**Solution**: Database schema is old. Use Option 1 (fresh start).

### Error: "table queries already exists"
**Solution**: Delete old database or use migration.

### Error: "UNIQUE constraint failed"
**Solution**: Check for duplicate data before migration.

### Data looks wrong after migration
**Solution**: Restore from backup and try again:
```bash
copy decision_logs.db.backup decision_logs.db  # Windows
# cp decision_logs.db.backup decision_logs.db  # Linux/Mac
```

---

## Production Migration Checklist

For production environments:

- [ ] **Backup database** before any changes
- [ ] **Test migration** on development copy first
- [ ] **Schedule downtime** if needed
- [ ] **Use Alembic** for proper migration tracking
- [ ] **Verify data integrity** after migration
- [ ] **Test application** thoroughly
- [ ] **Monitor logs** for errors
- [ ] **Keep backup** for at least 30 days

---

## PostgreSQL Migration (Recommended for Production)

If migrating to PostgreSQL:

1. **Install PostgreSQL**
```bash
# Install PostgreSQL server
# Create database: multiagent_ai
```

2. **Update .env**
```env
DATABASE_URL=postgresql://user:password@localhost/multiagent_ai
```

3. **Install driver**
```bash
pip install psycopg2-binary
```

4. **Export SQLite data** (if needed)
```bash
sqlite3 decision_logs.db .dump > backup.sql
```

5. **Import to PostgreSQL** (if needed)
```bash
# Convert SQLite SQL to PostgreSQL format
# Then: psql -U user -d multiagent_ai -f backup.sql
```

6. **Restart application**
```bash
uvicorn main:app --reload
```

---

## Best Practices

1. **Always backup** before migration
2. **Test on development** first
3. **Use version control** for migrations
4. **Document changes** in migration files
5. **Verify data** after migration
6. **Monitor application** after deployment

---

## Need Help?

If migration fails:
1. Restore from backup
2. Check logs in `BACKEND/logs/error.log`
3. Verify Python dependencies
4. Try fresh start approach
5. Check database file permissions

---

**Remember**: For development, fresh start is easiest. For production, use proper migrations!
