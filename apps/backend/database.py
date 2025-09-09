from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import get_settings

settings = get_settings()

SQLALCHEMY_DATABASE_URL = (
    "mysql+mysqldb://"
    f"{settings.database_username}:{settings.database_password}"
    f"@{settings.database_host}/{settings.database_schema}"
)
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()