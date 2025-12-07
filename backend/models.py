from datetime import datetime
from sqlalchemy import Boolean, DateTime, create_engine, Column, Integer, String, ForeignKey, Sequence
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

import os

# SWAP DATABASE_URL IF RUNNING IN DOCKER
DATABASE_URL = "postgresql://postgres:admin@localhost:5433/test_db"

# DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

badge_id_seq = Sequence('badge_id_seq')
challenge_id_seq = Sequence('challenge_id_seq')
resource_id_seq = Sequence('resource_id_seq')
users_id_seq = Sequence('users_id_seq')
tag_id_seq = Sequence('tag_id_seq')


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, Sequence('users_id_seq'),
                primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    score = Column(Integer, default=0)
    badges = relationship("Badge", secondary="userbadge",
                          back_populates="users")


class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, Sequence('badge_id_seq'),
                primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String)
    users = relationship("User", secondary="userbadge",
                         back_populates="badges")


class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    input = Column(String, nullable=True)
    output = Column(String)
    difficulty = Column(String)
    language = Column(String)
    tags = relationship("Tag", secondary="challengetag",
                        back_populates="challenges")


class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, Sequence('tag_id_seq'), primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    challenges = relationship(
        "Challenge", secondary="challengetag", back_populates="tags")
    resources = relationship(
        "Resource", secondary="resourcetag", back_populates="tags")


class ChallengeTag(Base):
    __tablename__ = "challengetag"
    challenge_id = Column(Integer, ForeignKey(
        'challenges.id'), primary_key=True)
    tag_id = Column(Integer, ForeignKey('tags.id'), primary_key=True)


class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, Sequence('resource_id_seq'),
                primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String)
    tags = relationship("Tag", secondary="resourcetag",
                        back_populates="resources")


class ResourceTag(Base):
    __tablename__ = "resourcetag"
    resource_id = Column(Integer, ForeignKey(
        'resources.id'), primary_key=True)
    tag_id = Column(Integer, ForeignKey('tags.id'), primary_key=True)


class Friend(Base):
    __tablename__ = "friends"
    user_id1 = Column(Integer, ForeignKey('users.id'), primary_key=True)
    user_id2 = Column(Integer, ForeignKey('users.id'), primary_key=True)


class UserBadge(Base):
    __tablename__ = "userbadge"
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    badge_id = Column(Integer, ForeignKey('badges.id'), primary_key=True)


class UserChallenge(Base):
    __tablename__ = "userchallenge"
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    challenge_id = Column(Integer, ForeignKey(
        'challenges.id'), primary_key=True)


Base.metadata.create_all(bind=engine)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String, index=True)
    link = Column(String)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    challenger_username = Column(String(50))

    recipient = relationship("User", back_populates="notifications")


User.notifications = relationship("Notification", back_populates="recipient")
