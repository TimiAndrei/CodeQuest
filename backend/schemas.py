from pydantic import BaseModel


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


class UserUpdate(BaseModel):
    username: str = None
    email: str = None
    password: str = None
    role: str = None
    score: int = None


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


class challengeCreate(BaseModel):
    title: str
    description: str
    output: str
    difficulty: str
    language: str


class challengeRead(BaseModel):
    id: int
    title: str
    description: str
    output: str
    difficulty: str
    language: str

    class Config:
        from_attributes = True


class challengeUpdate(BaseModel):
    title: str = None
    description: str = None
    output: str = None
    difficulty: str = None
    language: str = None
