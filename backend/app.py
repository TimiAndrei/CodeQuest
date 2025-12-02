import logging
from fastapi import FastAPI, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from models import Base, engine, SessionLocal, User, Badge, challenge, Friend, Resource, UserBadge, Userchallenge
from schemas import UserCreate, UserRead, UserUpdate, BadgeCreate, BadgeRead, BadgeUpdate, challengeCreate, challengeRead, challengeUpdate, UserLogin
import os
import bcrypt
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")
logger.info(f"DATABASE_URL: {DATABASE_URL}")

app = FastAPI()

#Cors config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"Hello": "CodeQuest"}


@app.post("/users/", response_model=UserRead)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = bcrypt.hashpw(
        user.password.encode('utf-8'), bcrypt.gensalt())
    db_user = User(username=user.username, email=user.email,
                   password=hashed_password.decode('utf-8'), role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/", response_model=List[UserRead])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@app.get("/users/{user_id}", response_model=UserRead)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/users/{user_id}", response_model=UserRead)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user.dict(exclude_unset=True).items():
        if key == "password":
            value = bcrypt.hashpw(value.encode('utf-8'),
                                  bcrypt.gensalt()).decode('utf-8')
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.delete("/users/{user_id}", response_model=UserRead)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return user


@app.post("/login/", response_model=UserRead)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user is None or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(
            status_code=401, detail="Invalid username or password")
    return db_user


@app.post("/badges/", response_model=BadgeRead)
def create_badge(badge: BadgeCreate, db: Session = Depends(get_db)):
    db_badge = Badge(title=badge.title, description=badge.description)
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge


@app.get("/badges/", response_model=List[BadgeRead])
def read_badges(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    badges = db.query(Badge).offset(skip).limit(limit).all()
    return badges


@app.get("/badges/{badge_id}", response_model=BadgeRead)
def read_badge(badge_id: int, db: Session = Depends(get_db)):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if badge is None:
        raise HTTPException(status_code=404, detail="Badge not found")
    return badge


@app.put("/badges/{badge_id}", response_model=BadgeRead)
def update_badge(badge_id: int, badge: BadgeUpdate, db: Session = Depends(get_db)):
    db_badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if db_badge is None:
        raise HTTPException(status_code=404, detail="Badge not found")
    for key, value in badge.dict(exclude_unset=True).items():
        setattr(db_badge, key, value)
    db.commit()
    db.refresh(db_badge)
    return db_badge


@app.delete("/badges/{badge_id}", response_model=BadgeRead)
def delete_badge(badge_id: int, db: Session = Depends(get_db)):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if badge is None:
        raise HTTPException(status_code=404, detail="Badge not found")
    db.delete(badge)
    db.commit()
    return badge


@app.post("/challenges/", response_model=challengeRead)
def create_challenge(challenge: challengeCreate, db: Session = Depends(get_db)):
    db_challenge = challenge(title=challenge.title, description=challenge.description,
                             output=challenge.output, difficulty=challenge.difficulty, language=challenge.language)
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge


@app.get("/challenges/", response_model=List[challengeRead])
def read_challenges(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    challenges = db.query(challenge).offset(skip).limit(limit).all()
    return challenges


@app.get("/challenges/{challenge_id}", response_model=challengeRead)
def read_challenge(challenge_id: int, db: Session = Depends(get_db)):
    challenge = db.query(challenge).filter(
        challenge.id == challenge_id).first()
    if challenge is None:
        raise HTTPException(status_code=404, detail="challenge not found")
    return challenge


@app.put("/challenges/{challenge_id}", response_model=challengeRead)
def update_challenge(challenge_id: int, challenge: challengeUpdate, db: Session = Depends(get_db)):
    db_challenge = db.query(challenge).filter(
        challenge.id == challenge_id).first()
    if db_challenge is None:
        raise HTTPException(status_code=404, detail="challenge not found")
    for key, value in challenge.dict(exclude_unset=True).items():
        setattr(db_challenge, key, value)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge


@app.delete("/challenges/{challenge_id}", response_model=challengeRead)
def delete_challenge(challenge_id: int, db: Session = Depends(get_db)):
    challenge = db.query(challenge).filter(
        challenge.id == challenge_id).first()
    if challenge is None:
        raise HTTPException(status_code=404, detail="challenge not found")
    db.delete(challenge)
    db.commit()
    return challenge
