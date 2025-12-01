import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")
logger.info(f"DATABASE_URL: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Error creating database engine: {e}")
    raise

app = FastAPI()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    score = Column(Integer, default=0)


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str


class UserRead(BaseModel):
    id: int
    username: str
    email: str
    role: str
    score: int

    class Config:
        from_attributes = True


Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root():
    return {"Hello": "CodeQuest"}


@app.post("/users/", response_model=UserRead)
def create_user(user: UserCreate):
    db = SessionLocal()
    db_user = User(username=user.username, email=user.email,
                   password=user.password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    db.close()
    return db_user


@app.get("/users/", response_model=List[UserRead])
def read_users(skip: int = 0, limit: int = 10):
    db = SessionLocal()
    users = db.query(User).offset(skip).limit(limit).all()
    db.close()
    return users


@app.get("/users/{user_id}", response_model=UserRead)
def read_user(user_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
