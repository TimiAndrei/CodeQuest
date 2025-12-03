from datetime import datetime, timedelta, timezone
from schemas import CommentLikeCreate, CommentLikeDelete, CommentLikeRead, NotificationCreate, NotificationRead, PointsUpdate, PurchaseCreate, PurchaseRead, TagCreate, TagRead
import logging
from fastapi import FastAPI, HTTPException, Depends, Query, Body
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import (
    Base,
    ChallengeTag,
    CommentLike,
    Notification,
    Purchase,
    ResourceTag,
    Tag,
    engine,
    SessionLocal,
    User,
    Badge,
    Challenge,
    Friend,
    Resource,
    UserBadge,
    Comment,
    ChallengeComment,
    ResourceComment,
    ChallengeLike,
    ResourceLike,
    UserChallenge
)
from schemas import (
    CodeSubmissionStatus,
    FriendCreate,
    UserCreate,
    UserRead,
    UserUpdate,
    BadgeCreate,
    BadgeRead,
    BadgeUpdate,
    ChallengeCreate,
    ChallengeRead,
    ChallengeUpdate,
    UserLogin,
    ResourceRead,
    ResourceCreate,
    ResourceUpdate,
    CodeSubmission,
    CodeSubmissionResult,
    NotificationCreate,
    NotificationRead,
    CommentCreate,
    CommentRead,
    CommentUpdate,
    ChallengeCommentCreate,
    ChallengeCommentRead,
    ResourceCommentCreate,
    ResourceCommentRead,
    ChallengeLikeCreate,
    ChallengeLikeRead,
    ResourceLikeCreate,
    ResourceLikeRead,
    UserChallengeCreate,
    UserChallengeRead,
)
import requests
import base64

import os
import bcrypt
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi import Depends, status
from starlette.responses import JSONResponse
from fastapi import Security
import secrets

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SWAP DATABASE_URL IF RUNNING IN DOCKER
DATABASE_URL = "postgresql://postgres:admin@localhost:5433/test_db"

# DATABASE_URL = os.getenv("DATABASE_URL")
logger.info(f"DATABASE_URL: {DATABASE_URL}")

JUDGE0_URL = os.getenv("JUDGE0_URL")

app = FastAPI()
security = HTTPBasic()
# Cors config
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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def read_root():
    return {"Hello": "CodeQuest"}


# Users


@app.post("/users/", response_model=UserRead)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"), bcrypt.gensalt())
    db_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password.decode("utf-8"),
        role=user.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/", response_model=List[UserRead])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    db_users = db.query(User).offset(skip).limit(limit).all()
    return db_users


@app.post("/notifications/", response_model=NotificationRead)
def create_notification(
    notification: NotificationCreate, db: Session = Depends(get_db)
):
    db_notification = Notification(
        recipient_id=notification.recipient_id,
        message=notification.message,
        link=notification.link,
        challenger_username=notification.challenger_username,
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


@app.get("/users/{user_id}/notifications", response_model=List[NotificationRead])
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    notifications = (
        db.query(Notification).filter(
            Notification.recipient_id == user_id).all()
    )
    return notifications


@app.delete("/notifications/{notification_id}", response_model=NotificationRead)
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    notification = (
        db.query(Notification).filter(
            Notification.id == notification_id).first()
    )
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notification)
    db.commit()
    return notification


@app.get("/usersOrderedByPoints/", response_model=List[UserRead])
def get_users_ordered_by_points(
    skip: int = 0, limit: int = 5, db: Session = Depends(get_db)
):
    db_users = (
        db.query(User).order_by(User.score.desc()
                                ).offset(skip).limit(limit).all()
    )
    return db_users


@app.get("/users/search", response_model=List[UserRead])
def search_users(query: str = Query(...), db: Session = Depends(get_db)):
    print(f"Searching for users with query: {query}")
    users = db.query(User).filter(User.username.ilike(f"%{query}%")).all()
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
            value = bcrypt.hashpw(value.encode("utf-8"), bcrypt.gensalt()).decode(
                "utf-8"
            )
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


@app.get("/users/{user_id}/friends", response_model=List[UserRead])
def get_friends(user_id: int, db: Session = Depends(get_db)):
    friends = (
        db.query(User)
        .join(Friend, (Friend.user_id1 == User.id) | (Friend.user_id2 == User.id))
        .filter(
            ((Friend.user_id1 == user_id) | (Friend.user_id2 == user_id))
            & (User.id != user_id)
        )
        .all()
    )
    return friends


@app.post("/users/{user_id}/badges/{badge_id}", response_model=UserRead)
def assign_badge_to_user(user_id: int, badge_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if user is None or badge is None:
        raise HTTPException(status_code=404, detail="User or Badge not found")
    user.badges.append(badge)
    db.commit()
    db.refresh(user)
    return user


@app.get("/users/{user_id}/badges", response_model=List[BadgeRead])
def get_user_badges(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user.badges


# Badges


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


# Challenges


@app.post("/challenges/", response_model=ChallengeRead)
def create_challenge(ch_data: ChallengeCreate, db: Session = Depends(get_db)):
    db_challenge = Challenge(
        title=ch_data.title,
        description=ch_data.description,
        input=ch_data.input,
        output=ch_data.output,
        difficulty=ch_data.difficulty,
        language=ch_data.language,
    )
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)

    # Associate tags with the challenge
    for tag_id in ch_data.tags:
        challenge_tag = ChallengeTag(
            challenge_id=db_challenge.id, tag_id=tag_id)
        db.add(challenge_tag)
    db.commit()

    # Fetch the tags to include in the response
    tag_ids = [tag.tag_id for tag in db.query(
        ChallengeTag).filter_by(challenge_id=db_challenge.id).all()]

    return {
        "id": db_challenge.id,
        "title": db_challenge.title,
        "description": db_challenge.description,
        "input": db_challenge.input,
        "output": db_challenge.output,
        "difficulty": db_challenge.difficulty,
        "language": db_challenge.language,
        "tags": tag_ids
    }


@app.get("/challenges/", response_model=List[ChallengeRead])
def read_challenges(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    challenges = db.query(Challenge).offset(skip).limit(limit).all()
    challenge_list = []
    for challenge in challenges:
        challenge_dict = challenge.__dict__.copy()
        challenge_dict['tags'] = [tag.tag_id for tag in db.query(
            ChallengeTag).filter_by(challenge_id=challenge.id).all()]
        challenge_list.append(challenge_dict)
    return challenge_list


@app.get("/challenges/filter", response_model=List[ChallengeRead])
def filter_challenges(
    sort_by: str = "latest",
    language: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Challenge)

    if language:
        query = query.filter(Challenge.language == language)

    if difficulty:
        query = query.filter(Challenge.difficulty == difficulty)

    if sort_by == "latest":
        query = query.order_by(Challenge.id.desc())
    elif sort_by == "oldest":
        query = query.order_by(Challenge.id.asc())

    return query.all()


@app.get("/challenges/like/{challenge_id}", response_model=List[ChallengeLikeRead])
def get_challenge_like(challenge_id: int, db: Session = Depends(get_db)):
    likes = db.query(ChallengeLike).filter(
        ChallengeLike.challenge_id == challenge_id).all()
    return likes


@app.post("/challenges/like", response_model=ChallengeLikeRead)
def add_or_remove_challenge_like(challenge_like: ChallengeLikeCreate, db: Session = Depends(get_db)):
    existing_like = db.query(ChallengeLike).filter(
        ChallengeLike.challenge_id == challenge_like.challenge_id,
        ChallengeLike.user_id == challenge_like.user_id
    ).first()
    if existing_like:
        db.delete(existing_like)
        db.commit()
        return existing_like

    new_like = ChallengeLike(**challenge_like.dict())
    db.add(new_like)
    db.commit()
    db.refresh(new_like)
    return new_like


@app.delete("/challenges/like/", response_model=ChallengeLikeRead)
def delete_challenge_like(challenge_id: int, user_id: int, db: Session = Depends(get_db)):
    like = db.query(ChallengeLike).filter(ChallengeLike.challenge_id ==
                                          challenge_id, ChallengeLike.user_id == user_id).first()
    if like is None:
        raise HTTPException(status_code=404, detail="Like not found")
    db.delete(like)
    db.commit()
    return like


@app.get("/challenges/likes", response_model=List[dict])
def get_challenges_likes(db: Session = Depends(get_db)):
    challenges_likes = db.query(
        Challenge.id,
        func.count(ChallengeLike.challenge_id).label("likes")
    ).outerjoin(ChallengeLike, Challenge.id == ChallengeLike.challenge_id).group_by(Challenge.id).all()

    return [{"challenge_id": challenge.id, "likes": challenge.likes} for challenge in challenges_likes]


@app.get("/challenges/{challenge_id}", response_model=ChallengeRead)
def read_challenge(challenge_id: int, db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter(
        Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    challenge_dict = challenge.__dict__.copy()
    challenge_dict['tags'] = [tag.tag_id for tag in db.query(
        ChallengeTag).filter_by(challenge_id=challenge.id).all()]
    return challenge_dict


@app.put("/challenges/{challenge_id}", response_model=ChallengeRead)
def update_challenge(
    challenge_id: int, ch_update: ChallengeUpdate, db: Session = Depends(get_db)
):
    db_challenge = db.query(Challenge).filter(
        Challenge.id == challenge_id).first()
    if db_challenge is None:
        raise HTTPException(status_code=404, detail="challenge not found")
    for key, value in ch_update.dict(exclude_unset=True).items():
        setattr(db_challenge, key, value)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge


@app.delete("/challenges/{challenge_id}", response_model=ChallengeRead)
def delete_challenge(challenge_id: int, db: Session = Depends(get_db)):
    db_ch = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if db_ch is None:
        raise HTTPException(status_code=404, detail="challenge not found")
    db.delete(db_ch)
    db.commit()
    return db_ch


# Resources
@app.get("/resources/", response_model=List[ResourceRead])
def read_resources(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    resources = db.query(Resource).offset(skip).limit(limit).all()
    return resources


@app.post("/resources/", response_model=ResourceRead)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    db_resource = Resource(
        title=resource.title,
        description=resource.description,
        reward_points=resource.reward_points
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)

    # Associate tags with the resource
    for tag_id in resource.tags:
        resource_tag = ResourceTag(resource_id=db_resource.id, tag_id=tag_id)
        db.add(resource_tag)
    db.commit()

    return db_resource


@app.get("/tags/", response_model=List[TagRead])
def read_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    return tags


@app.post("/tags/", response_model=TagRead)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    db_tag = db.query(Tag).filter(Tag.name == tag.name).first()
    if db_tag:
        raise HTTPException(status_code=400, detail="Tag already exists")
    new_tag = Tag(name=tag.name)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag


@app.get("/resources/{resource_id}/tags", response_model=List[TagRead])
def read_resource_tags(resource_id: int, db: Session = Depends(get_db)):
    resource_tags = db.query(Tag).join(ResourceTag).filter(
        ResourceTag.resource_id == resource_id).all()
    return resource_tags


@app.get("/resources/likes", response_model=List[dict])
def get_resources_likes(db: Session = Depends(get_db)):
    resources_likes = db.query(
        Resource.id,
        func.count(ResourceLike.resource_id).label("likes")
    ).outerjoin(ResourceLike, Resource.id == ResourceLike.resource_id).group_by(Resource.id).all()

    return [{"resource_id": resource.id, "likes": resource.likes} for resource in resources_likes]


@app.get("/resources/filter", response_model=List[ResourceRead])
def filter_resources(sort_by: str = "latest", db: Session = Depends(get_db)):
    query = db.query(Resource)

    if sort_by == "latest":
        query = query.order_by(Resource.id.desc())
    elif sort_by == "oldest":
        query = query.order_by(Resource.id.asc())

    return query.all()


@app.get("/resources/{resource_id}", response_model=ResourceRead)
def read_resource(resource_id: int, db: Session = Depends(get_db)):
    db_resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if db_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return db_resource


@app.get("/resources/", response_model=List[ResourceRead])
def get_resources(skip: int = 0, limit: int = 5, db: Session = Depends(get_db)):
    return (
        db.query(Resource)
        .order_by(Resource.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@app.delete("/resources/{resource_id}", response_model=ResourceRead)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(resource)
    db.commit()
    return resource


# User Badges
@app.get("/users/{user_id}/badges", response_model=List[BadgeRead])
def get_user_badges(user_id: int, db: Session = Depends(get_db)):
    user_badges = (
        db.query(Badge)
        .join(UserBadge, Badge.id == UserBadge.badge_id)
        .filter(UserBadge.user_id == user_id)
        .all()
    )
    if not user_badges:
        raise HTTPException(
            status_code=404, detail="No badges found for this user")
    return user_badges


# SECURITY and AUTHENTICATION
def authenticate_user(
    credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == credentials.username).first()
    if user and bcrypt.checkpw(
        credentials.password.encode("utf-8"), user.password.encode("utf-8")
    ):
        return user
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid username or password",
        headers={"WWW-Authenticate": "Basic"},
    )


@app.post("/login/", response_model=UserRead)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user is None or not bcrypt.checkpw(
        user.password.encode("utf-8"), db_user.password.encode("utf-8")
    ):
        raise HTTPException(
            status_code=401, detail="Invalid username or password")

    # Fetch notifications for the user
    notifications = (
        db.query(Notification).filter(
            Notification.recipient_id == db_user.id).all()
    )
    db_user.notifications = notifications

    return db_user


@app.get("/protected", response_model=UserRead)
def protected_route(user: User = Depends(authenticate_user)):
    return user


def get_language_id(language: str) -> int:
    language_map = {
        "Python": 71,
        "JavaScript": 63,
        "Go": 60,
    }
    return language_map.get(language, 71)


@app.post("/submit-code", response_model=CodeSubmissionResult)
def submit_code(
    submission: CodeSubmission,
    db: Session = Depends(get_db),
) -> CodeSubmissionResult:
    db_challenge = (
        db.query(Challenge).filter(Challenge.id ==
                                   submission.challenge_id).first()
    )
    print("Received Submission:", submission.dict())
    if db_challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Check if the user has already solved this challenge
    user_challenge = (
        db.query(UserChallenge)
        .filter(UserChallenge.user_id == submission.user_id)
        .filter(UserChallenge.challenge_id == submission.challenge_id)
        .first()
    )
    if user_challenge:
        raise HTTPException(
            status_code=400, detail="You have already solved this challenge")

    try:
        code_b64 = base64.b64encode(submission.source_code.encode("utf-8")).decode(
            "utf-8"
        )
        input_b64 = base64.b64encode(
            db_challenge.input.encode("utf-8")).decode("utf-8")
        output_b64 = base64.b64encode(db_challenge.output.encode("utf-8")).decode(
            "utf-8"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Encoding Error: {e}")

    create_submission = requests.post(
        f"{JUDGE0_URL}/submissions?base64_encoded=true&wait=true",
        json={
            "source_code": code_b64,
            "language_id": get_language_id(db_challenge.language),
            "stdin": input_b64,
            "expected_output": output_b64,
        },
    )

    if create_submission.status_code not in [200, 201]:
        raise HTTPException(
            status_code=create_submission.status_code,
            detail=f"Judge0 API Error: {create_submission.text}",
        )

    submission_token = create_submission.json().get("token")
    if not submission_token:
        raise HTTPException(
            status_code=500, detail="Submission token not received.")

    result = requests.get(
        f"{JUDGE0_URL}/submissions/{submission_token}?base64_encoded=false",
    )

    if result.status_code != 200:
        raise HTTPException(
            status_code=result.status_code,
            detail=f"Error fetching results: {result.text}",
        )

    result_data = result.json()

    # Check for compilation or runtime errors
    if result_data["status"]["id"] != 3:  # Status ID 3 means "Accepted"
        error_message = base64.b64decode(
            result_data.get("message", "")).decode("utf-8")
        stderr = base64.b64decode(
            result_data.get("stderr", "")).decode("utf-8")
        raise HTTPException(
            status_code=400,
            detail=f"Error: {result_data['status']['description']}\nMessage: {error_message}\nStderr: {stderr}",
        )

    # Update user score based on problem difficulty
    user = db.query(User).filter(User.id == submission.user_id).first()
    points_awarded = 0
    badge_awarded = ""
    if user:
        initial_score = user.score
        points_awarded = (
            10
            if db_challenge.difficulty == "Easy"
            else 20 if db_challenge.difficulty == "Medium" else 40
        )
        user.score += points_awarded
        user.reward_points += points_awarded
        db.commit()
        print(
            f"User {user.id} score updated: {user.score}. Points awarded: {points_awarded}"
        )

        # Assign a badge if the user's score was 0 before the update
        if initial_score == 0:
            first_problem_badge = (
                db.query(Badge).filter(Badge.title == "Beginner Badge").first()
            )
            if first_problem_badge:
                user_badge = UserBadge(
                    user_id=user.id, badge_id=first_problem_badge.id)
                db.add(user_badge)
                db.commit()
                badge_awarded = first_problem_badge.title
                print(
                    f"User {user.id} awarded badge: {first_problem_badge.title}")

        # Add the solved challenge to user challenges
        user_challenge = UserChallenge(
            user_id=user.id, challenge_id=db_challenge.id, solution=submission.source_code
        )
        db.add(user_challenge)
        db.commit()
        print(f"User {user.id} solved challenge {db_challenge.id}")

    return {
        "status": CodeSubmissionStatus(
            id=result_data["status"]["id"],
            description=result_data["status"]["description"],
        ),
        "stdout": result_data.get("stdout", ""),
        "stderr": result_data.get("stderr", "") or "",
        "expected_output": db_challenge.output,
        "actual_output": result_data.get("stdout", ""),
        "time": result_data.get("time", ""),
        "memory": result_data.get("memory", 0),
        "token": submission_token,
        "compile_output": result_data.get("compile_output", "") or "",
        "message": result_data.get("message", "") or "",
        "points_awarded": points_awarded,
        "badge_awarded": badge_awarded,
    }


@app.get("/challenges/{challenge_id}/tags", response_model=List[TagRead])
def read_challenge_tags(challenge_id: int, db: Session = Depends(get_db)):
    tags = db.query(Tag).join(ChallengeTag).filter(
        ChallengeTag.challenge_id == challenge_id).all()
    return tags


@app.get(
    "/challenges/{challenge_id}/recommended-resources",
    response_model=List[ResourceRead],
)
def get_recommended_resources(challenge_id: int, db: Session = Depends(get_db)):
    db_challenge = db.query(Challenge).filter(
        Challenge.id == challenge_id).first()
    if db_challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")

    tag_ids = [tag.id for tag in db_challenge.tags]
    recommended_resources = (
        db.query(Resource)
        .join(ResourceTag)
        .filter(ResourceTag.tag_id.in_(tag_ids))
        .all()
    )
    return recommended_resources


@app.post("/users/{user_id}/friends", response_model=FriendCreate)
def add_friend(
    user_id: int, friend_username: str = Query(...), db: Session = Depends(get_db)
):
    friend = db.query(User).filter(User.username == friend_username).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")

    if user_id == friend.id:
        raise HTTPException(
            status_code=400, detail="Cannot add yourself as a friend")

    existing_friend = (
        db.query(Friend)
        .filter(
            ((Friend.user_id1 == user_id) & (Friend.user_id2 == friend.id))
            | ((Friend.user_id1 == friend.id) & (Friend.user_id2 == user_id))
        )
        .first()
    )

    if existing_friend:
        raise HTTPException(status_code=400, detail="Already friends")

    new_friend = Friend(user_id1=user_id, user_id2=friend.id)
    db.add(new_friend)
    db.commit()
    return new_friend


@app.delete("/users/{user_id}/friends", response_model=FriendCreate)
def delete_friend(user_id: int, friend_username: str = Query(...), db: Session = Depends(get_db)):
    friend = db.query(User).filter(User.username == friend_username).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")

    if user_id == friend.id:
        raise HTTPException(
            status_code=400, detail="Cannot delete yourself as a friend")

    existing_friend = db.query(Friend).filter(
        ((Friend.user_id1 == user_id) & (Friend.user_id2 == friend.id)) |
        ((Friend.user_id1 == friend.id) & (Friend.user_id2 == user_id))
    ).first()

    if not existing_friend:
        raise HTTPException(status_code=400, detail="Not friends")

    db.delete(existing_friend)
    db.commit()
    return existing_friend


@app.post("/comments/", response_model=CommentRead)
def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    db_comment = Comment(user_id=comment.user_id, comment=comment.comment)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@app.get("/comments/", response_model=List[CommentRead])
def read_comments(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    comments = db.query(Comment).offset(skip).limit(limit).all()
    return comments


@app.get("/comments/{comment_id}", response_model=CommentRead)
def read_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@app.put("/comments/{comment_id}", response_model=CommentRead)
def update_comment(
    comment_id: int, comment: CommentUpdate, db: Session = Depends(get_db)
):
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    for key, value in comment.dict(exclude_unset=True).items():
        setattr(db_comment, key, value)
    db.commit()
    db.refresh(db_comment)
    return db_comment

# comment likes endpoints


@app.post("/comments/like", response_model=CommentLikeRead)
def add_comment_like(comment_like: CommentLikeCreate, db: Session = Depends(get_db)):
    existing_like = db.query(CommentLike).filter(
        CommentLike.comment_id == comment_like.comment_id,
        CommentLike.user_id == comment_like.user_id
    ).first()
    if existing_like:
        db.delete(existing_like)
        db.commit()
        return existing_like

    new_like = CommentLike(**comment_like.dict())
    db.add(new_like)
    db.commit()
    db.refresh(new_like)
    return new_like


@app.delete("/comments/like", response_model=CommentLikeDelete)
def delete_comment_like(comment_like: CommentLikeDelete, db: Session = Depends(get_db)):
    existing_like = db.query(CommentLike).filter(
        CommentLike.comment_id == comment_like.comment_id,
        CommentLike.user_id == comment_like.user_id
    ).first()
    if not existing_like:
        raise HTTPException(status_code=404, detail="Like not found")

    db.delete(existing_like)
    db.commit()
    return comment_like


@app.get("/comments/{comment_id}/likes", response_model=List[CommentLikeRead])
def get_comment_likes(comment_id: int, db: Session = Depends(get_db)):
    likes = db.query(CommentLike).filter(
        CommentLike.comment_id == comment_id).all()
    return likes


@app.get("/challenges/{challenge_id}/comments", response_model=List[CommentRead])
def get_challenge_comments(challenge_id: int, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment)
        .join(ChallengeComment, ChallengeComment.comment_id == Comment.id)
        .filter(ChallengeComment.challenge_id == challenge_id)
        .all()
    )
    return comments


@app.post("/challenges/{challenge_id}/comments", response_model=ChallengeCommentRead)
def add_challenge_comment(
    challenge_id: int,
    challenge_comment: ChallengeCommentCreate = Body(...),
    db: Session = Depends(get_db)
):
    # Associate the comment with the challenge
    challenge_comment = ChallengeComment(
        challenge_id=challenge_id, comment_id=challenge_comment.comment_id
    )
    db.add(challenge_comment)
    db.commit()
    return challenge_comment


@app.get("/resources/{resource_id}/comments", response_model=List[CommentRead])
def get_resource_comments(resource_id: int, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment)
        .join(ResourceComment, ResourceComment.comment_id == Comment.id)
        .filter(ResourceComment.resource_id == resource_id)
        .all()
    )
    return comments


@app.post("/resources/{resource_id}/comments", response_model=ResourceCommentRead)
def add_resource_comment(
    resource_comment: ResourceCommentCreate = Body(...),
    db: Session = Depends(get_db)
):
    # Associate the comment with the resource
    resource_comment = ResourceComment(
        resource_id=resource_comment.resource_id, comment_id=resource_comment.comment_id
    )
    db.add(resource_comment)
    db.commit()
    return resource_comment


@app.get("/users/{user_id}/comments", response_model=List[CommentRead])
def get_user_comments(user_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.user_id == user_id).all()
    return comments


@app.delete("/comments/{comment_id}", response_model=CommentRead)
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    db.query(CommentLike).filter(CommentLike.comment_id == comment_id).delete()
    db.delete(comment)
    db.commit()
    return comment


@app.delete("/users/{user_id}/friends", response_model=FriendCreate)
def delete_friend(user_id: int, friend_username: str = Query(...), db: Session = Depends(get_db)):
    friend = db.query(User).filter(User.username == friend_username).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")

    if user_id == friend.id:
        raise HTTPException(
            status_code=400, detail="Cannot delete yourself as a friend")

    existing_friend = db.query(Friend).filter(
        ((Friend.user_id1 == user_id) & (Friend.user_id2 == friend.id)) |
        ((Friend.user_id1 == friend.id) & (Friend.user_id2 == user_id))
    ).first()

    if not existing_friend:
        raise HTTPException(status_code=400, detail="Not friends")

    db.delete(existing_friend)
    db.commit()
    return existing_friend


@app.post("/purchases/", response_model=PurchaseRead)
def create_purchase(purchase: PurchaseCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == purchase.user_id).first()
    resource = db.query(Resource).filter(
        Resource.id == purchase.resource_id).first()

    if not user or not resource:
        raise HTTPException(
            status_code=404, detail="User or Resource not found")

    if user.reward_points < resource.reward_points:
        raise HTTPException(status_code=400, detail="Not enough reward points")

    user.reward_points -= resource.reward_points
    new_purchase = Purchase(user_id=purchase.user_id,
                            resource_id=purchase.resource_id)
    db.add(new_purchase)
    db.commit()
    db.refresh(new_purchase)
    return new_purchase


@app.get("/users/{user_id}/purchases", response_model=List[PurchaseRead])
def read_purchases(user_id: int, db: Session = Depends(get_db)):
    purchases = db.query(Purchase).filter(Purchase.user_id == user_id).all()
    purchased_resource_ids = [purchase.resource_id for purchase in purchases]

    # Include free resources
    free_resources = db.query(Resource).filter(
        Resource.reward_points == 0).all()

    for resource in free_resources:
        if resource.id not in purchased_resource_ids:
            purchased_resource_ids.append(resource.id)
            purchases.append(Purchase(
                user_id=user_id, resource_id=resource.id, purchase_date=datetime.utcnow()))

    return purchases


@app.post("/users/{user_id}/reward")
def update_reward_points(user_id: int, points_update: PointsUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.reward_points += points_update.points
    # Reset the reward timer to 24 hours from now
    user.reward_timer = datetime.now(timezone.utc) + timedelta(hours=24)
    db.commit()
    return {"message": "Reward points updated successfully", "points": points_update.points}


@app.get("/users/{user_id}/reward-timer")
def get_reward_timer(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Calculate the remaining time for the reward timer
    remaining_time = (user.reward_timer -
                      datetime.now(timezone.utc)).total_seconds() / 3600
    return {"timer": max(0, remaining_time)}


@app.get("/challanges/like/{challenge_id}", response_model=List[ChallengeLikeRead])
def get_challenge_like(challenge_id: int, db: Session = Depends(get_db)):
    likes = db.query(ChallengeLike).filter(
        ChallengeLike.challenge_id == challenge_id).all()
    return likes


@app.post("/challanges/like/{challenge_id}", response_model=ChallengeLikeRead)
def add_challenge_like(challenge_id: int, user_id: int, db: Session = Depends(get_db)):
    like = ChallengeLike(user_id=user_id, challenge_id=challenge_id)
    db.add(like)
    db.commit()
    return like


@app.delete("/challanges/like/", response_model=ChallengeLikeRead)
def delete_challenge_like(challenge_id: int, user_id: int, db: Session = Depends(get_db)):
    like = db.query(ChallengeLike).filter(ChallengeLike.challenge_id ==
                                          challenge_id, ChallengeLike.user_id == user_id).first()
    if like is None:
        raise HTTPException(status_code=404, detail="Like not found")
    db.delete(like)
    db.commit()
    return like


@app.get("/resources/like/{resource_id}", response_model=List[ResourceLikeRead])
def get_resource_like(resource_id: int, db: Session = Depends(get_db)):
    likes = db.query(ResourceLike).filter(
        ResourceLike.resource_id == resource_id).all()
    return likes


@app.post("/resources/like/{resource_id}", response_model=ResourceLikeRead)
def add_resource_like(resource_id: int, user_id: int, db: Session = Depends(get_db)):
    like = ResourceLike(user_id=user_id, resource_id=resource_id)
    db.add(like)
    db.commit()
    return like


@app.post("/resources/like", response_model=ResourceLikeRead)
def add_or_remove_resource_like(resource_like: ResourceLikeCreate, db: Session = Depends(get_db)):
    existing_like = db.query(ResourceLike).filter(
        ResourceLike.resource_id == resource_like.resource_id,
        ResourceLike.user_id == resource_like.user_id
    ).first()
    if existing_like:
        db.delete(existing_like)
        db.commit()
        return existing_like

    new_like = ResourceLike(**resource_like.dict())
    db.add(new_like)
    db.commit()
    db.refresh(new_like)
    return new_like


@app.delete("/resources/like/", response_model=ResourceLikeRead)
def delete_resource_like(resource_id: int, user_id: int, db: Session = Depends(get_db)):
    like = db.query(ResourceLike).filter(ResourceLike.resource_id ==
                                         resource_id, ResourceLike.user_id == user_id).first()
    if like is None:
        raise HTTPException(status_code=404, detail="Like not found")
    db.delete(like)
    db.commit()
    return like


@app.get("/users/{user_id}/likes")
def get_user_likes(user_id: int, db: Session = Depends(get_db)):
    user_likes = {
        "challenges": db.query(ChallengeLike).filter(ChallengeLike.user_id == user_id).all(),
        "resources": db.query(ResourceLike).filter(ResourceLike.user_id == user_id).all()
    }
    return user_likes


@app.get("/users/challenges/", response_model=List[UserChallengeRead])
def get_user_challenges(user_id: int, db: Session = Depends(get_db)):
    user_challenges = db.query(UserChallenge).filter(
        UserChallenge.user_id == user_id).all()
    return user_challenges


@app.post("/users/challenges/", response_model=UserChallengeRead)
def add_user_challenge(user_id: int, challenge_id: int, solution: str, db: Session = Depends(get_db)):
    user_challenge = UserChallenge(
        user_id=user_id, challenge_id=challenge_id, solution=solution)
    db.add(user_challenge)
    db.commit()
    return user_challenge


@app.put("/users/challenges/", response_model=UserChallengeRead)
def update_user_challenge(user_id: int, challenge_id: int, solution: str, db: Session = Depends(get_db)):
    user_challenge = db.query(UserChallenge).filter(
        UserChallenge.user_id == user_id, UserChallenge.challenge_id == challenge_id).first()
    if user_challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    user_challenge.solution = solution
    db.commit()
    return user_challenge


@app.delete("/users/challenges/", response_model=UserChallengeRead)
def delete_user_challenge(user_id: int, challenge_id: int, db: Session = Depends(get_db)):
    user_challenge = db.query(UserChallenge).filter(
        UserChallenge.user_id == user_id, UserChallenge.challenge_id == challenge_id).first()
    if user_challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    db.delete(user_challenge)
    db.commit()
    return user_challenge
