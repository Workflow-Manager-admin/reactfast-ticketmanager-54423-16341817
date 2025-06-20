from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import os

SQLALCHEMY_DATABASE_URL = "sqlite:///./ticketing.db"

# Check DB file existence and permissions for SQLite
db_path = os.path.join(os.path.dirname(__file__), "..", "..", "ticketing.db")
db_path = os.path.abspath(db_path)
if not os.path.exists(db_path):
    # File will be created at first write, but ensure containing dir is writable.
    db_dir = os.path.dirname(db_path)
    if not os.access(db_dir, os.W_OK):
        raise RuntimeError(f"Database directory '{db_dir}' is not writable. Check permissions.")
else:
    if not os.access(db_path, os.R_OK | os.W_OK):
        raise RuntimeError(f"Database file '{db_path}' is not readable/writable. Check permissions.")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# PUBLIC_INTERFACE
def get_db():
    """Yield a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
