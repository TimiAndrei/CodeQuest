from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Sequence
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

badge_id_seq = Sequence('badge_id_seq')
challenge_id_seq = Sequence('challenge_id_seq')
resource_id_seq = Sequence('resource_id_seq')
users_id_seq = Sequence('users_id_seq')


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, Sequence('users_id_seq'),
                primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    score = Column(Integer, default=0)


class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, Sequence('badge_id_seq'),
                primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String)


class challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, Sequence('challenge_id_seq'),
                primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String)
    output = Column(String)
    difficulty = Column(String)
    language = Column(String)


class Friend(Base):
    __tablename__ = "friends"
    user_id1 = Column(Integer, ForeignKey('users.id'), primary_key=True)
    user_id2 = Column(Integer, ForeignKey('users.id'), primary_key=True)


class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, Sequence('resource_id_seq'),
                primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String)


class UserBadge(Base):
    __tablename__ = "userbadge"
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    badge_id = Column(Integer, ForeignKey('badges.id'), primary_key=True)


class Userchallenge(Base):
    __tablename__ = "userchallenge"
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    challenge_id = Column(Integer, ForeignKey(
        'challenges.id'), primary_key=True)


Base.metadata.create_all(bind=engine)
