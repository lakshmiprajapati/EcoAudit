# core-api/database.py
from sqlmodel import SQLModel, create_engine, Session

# This creates a file named 'audit_data.db' in your folder
sqlite_file_name = "audit_data.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# The Engine is the connection to the file
engine = create_engine(sqlite_url)

def create_db_and_tables():
    """Creates the tables if they don't exist"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Helper to get a database session"""
    with Session(engine) as session:
        yield session