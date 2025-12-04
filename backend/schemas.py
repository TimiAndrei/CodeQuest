from datetime import datetime
from pydantic import BaseModel
from typing import Optional


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
    reward_points: int

    class Config:
        from_attributes = True


class UserSearch(BaseModel):
    query: str


class FriendCreate(BaseModel):
    user_id1: int
    user_id2: int

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    score: Optional[int] = None
    reward_points: Optional[int] = None


class UserLogin(BaseModel):
    username: str
    password: str


class BadgeCreate(BaseModel):
    title: str
    description: str


class BadgeRead(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True


class BadgeUpdate(BaseModel):
    title: str = None
    description: str = None


class ChallengeCreate(BaseModel):
    title: str
    description: str
    input: str
    output: str
    difficulty: str
    language: str


class ChallengeRead(BaseModel):
    id: int
    title: str
    description: str
    input: str
    output: str
    difficulty: str
    language: str

    class Config:
        from_attributes = True


class ChallengeUpdate(BaseModel):
    title: str = None
    description: str = None
    input: str
    output: str = None
    difficulty: str = None
    language: str = None


class ResourceCreate(BaseModel):
    title: str
    description: str


class ResourceRead(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True


class ResourceUpdate(BaseModel):
    title: str = None
    description: str = None


class CodeSubmission(BaseModel):
    source_code: str
    challenge_id: int
    language_id: int
    stdin: str
    expected_output: str
    user_id: int


# {
#   "stdout": "True",
#   "time": "0.008",
#   "memory": 3296,
#   "stderr": null,
#   "token": "17d554c1-1ef3-4c32-ab40-f18e995cef88",
#   "compile_output": null,
#   "message": null,
#   "status": {
#     "id": 3,
#     "description": "Accepted"
#   }
# }


class CodeSubmissionStatus(BaseModel):
    id: int
    description: str


class CodeSubmissionResult(BaseModel):
    status: CodeSubmissionStatus
    stdout: str
    stderr: str = ""
    expected_output: str
    actual_output: str
    time: str
    memory: int
    token: str
    compile_output: str = ""
    message: str = ""
    points_awarded: int = 0
    badge_awarded: str = ""


class TagCreate(BaseModel):
    name: str


class TagRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class TagUpdate(BaseModel):
    name: str = None


class ChallengeTagCreate(BaseModel):
    challenge_id: int
    tag_id: int


class ChallengeTagRead(BaseModel):
    challenge_id: int
    tag_id: int

    class Config:
        from_attributes = True


class ChallengeTagUpdate(BaseModel):
    challenge_id: int = None
    tag_id: int = None


class NotificationCreate(BaseModel):
    recipient_id: int
    message: str
    link: str
    challenger_username: str


class NotificationRead(BaseModel):
    id: int
    recipient_id: int
    message: str
    link: str
    read: bool
    created_at: datetime
    challenger_username: str

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    user_id: int
    comment: str


class CommentRead(BaseModel):
    id: int
    user_id: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChallengeCommentCreate(BaseModel):
    challenge_id: int
    comment_id: int


class ChallengeCommentRead(BaseModel):
    challenge_id: int
    comment_id: int

    class Config:
        from_attributes = True


class ResourceCommentCreate(BaseModel):
    resource_id: int
    comment_id: int


class ResourceCommentRead(BaseModel):
    resource_id: int
    comment_id: int

    class Config:
        from_attributes = True


class CommentUpdate(BaseModel):
    user_id: int = None
    comment: str = None


class ChallengeCommentUpdate(BaseModel):
    challenge_id: int = None
    comment_id: int = None


class ResourceCommentUpdate(BaseModel):
    resource_id: int = None
    comment_id: int = None
