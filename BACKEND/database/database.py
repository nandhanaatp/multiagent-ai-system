from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
from config import settings
import logging

logger = logging.getLogger(__name__)

is_sqlite = settings.database_url.startswith("sqlite")

if is_sqlite:
    logger.warning(
        "Using SQLite database. SQLite is not recommended for production "
        "due to limited concurrency. Consider migrating to PostgreSQL."
    )

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    **(
        {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool}
        if is_sqlite else
        {"pool_size": 10, "max_overflow": 20}
    )
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()