import string
import random
from models import Base, User, Notification, Badge, Challenge, Resource, Comment
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import app, get_db
import os

# Set the environment variable for the test database URL
os.environ["DATABASE_URL"] = "postgresql://postgres:admin@localhost:5433/test_db"

# Database URL and engine setup
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)

# Create the tables in the test database
Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="module", autouse=True)
def setup_and_teardown_db():
    # Set the PGPASSWORD environment variable to avoid the password prompt
    os.environ["PGPASSWORD"] = "admin"

    # Clear and reinitialize the test database
    os.system("psql -U postgres -p 5433 -c 'DROP DATABASE IF EXISTS test_db;'")
    os.system("psql -U postgres -p 5433 -c 'CREATE DATABASE test_db;'")
    os.system("psql -U postgres -p 5433 -d test_db -f 'D:\\new laptop\\Facultate An 4 sem 1\\IngineriaProgramarii\\CodeQuest\\db-init\\init.sql'")

    # Disable foreign key checks (if necessary)
    os.system(
        "psql -U postgres -p 5433 -d test_db -c \"SET session_replication_role = 'replica';\"")

    # Create tables in the fresh database
    Base.metadata.create_all(bind=engine)
    yield  # Run the tests

    # After tests are done, clean up by disabling foreign key checks again
    os.system(
        "psql -U postgres -p 5433 -d test_db -c \"SET session_replication_role = 'origin';\"")

    # Drop all tables after the tests
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def client():
    # Override the get_db dependency for the test client
    def override_get_db():
        try:
            test_db = TestingSessionLocal()
            yield test_db
        finally:
            test_db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def test_db():
    # Create the test database session and setup/teardown logic
    test_db = TestingSessionLocal()
    yield test_db
    test_db.close()


def generate_unique_string():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


def test_create_user(client, test_db):
    # Create a new user via the API with a unique username
    unique_username = f"testuser{generate_unique_string()}"
    unique_email = f"testuser{generate_unique_string()}@example.com"

    response = client.post("/users/", json={
        "username": unique_username,
        "email": unique_email,
        "password": "testpassword",
        "role": "user"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == unique_username
    assert data["email"] == unique_email
    assert "id" in data

    # Store the created user's ID for later use in other tests
    user_id = data["id"]
    return user_id


def test_read_users(client, test_db):
    # Ensure there's at least one user in the database
    response = client.get("/users/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_read_user(client, test_db):
    # Ensure the user created in test_create_user exists
    # Create the user and retrieve their ID
    user_id = test_create_user(client, test_db)
    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["username"]
    assert data["email"]


def test_update_user(client, test_db):
    # Ensure the user created in test_create_user exists
    # Create the user and retrieve their ID
    user_id = test_create_user(client, test_db)
    response = client.put(f"/users/{user_id}",
                          json={"username": f"updateduser{generate_unique_string()}"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"].startswith("updateduser")


def test_delete_user(client, test_db):
    # Ensure the user created in test_create_user exists
    # Create the user and retrieve their ID
    user_id = test_create_user(client, test_db)

    # Delete dependent objects (like comments) first
    # You can retrieve and delete comments or any other dependent objects here
    # For example:
    # response = client.delete(f"/comments/{comment_id}")
    # assert response.status_code == 200

    # Disable foreign key checks temporarily to drop the user
    os.system(
        "psql -U postgres -p 5433 -d test_db -c \"SET session_replication_role = 'replica';\"")

    # Now delete the user
    response = client.delete(f"/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["username"]

    # Ensure the user is deleted and no longer exists
    response = client.get(f"/users/{user_id}")
    assert response.status_code == 404

    # Re-enable foreign key checks after the deletion
    os.system(
        "psql -U postgres -p 5433 -d test_db -c \"SET session_replication_role = 'origin';\"")


def test_create_notification(client, test_db):
    user_id = test_create_user(client, test_db)
    response = client.post("/notifications/", json={
        "recipient_id": user_id,
        "message": "Test notification",
        "link": "http://example.com",
        "challenger_username": "testchallenger"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["recipient_id"] == user_id
    assert data["message"] == "Test notification"
    assert "id" in data


def test_get_notifications(client, test_db):
    user_id = test_create_user(client, test_db)
    client.post("/notifications/", json={
        "recipient_id": user_id,
        "message": "Test notification",
        "link": "http://example.com",
        "challenger_username": "testchallenger"
    })
    response = client.get(f"/users/{user_id}/notifications")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_delete_notification(client, test_db):
    user_id = test_create_user(client, test_db)
    response = client.post("/notifications/", json={
        "recipient_id": user_id,
        "message": "Test notification",
        "link": "http://example.com",
        "challenger_username": "testchallenger"
    })
    notification_id = response.json()["id"]
    response = client.delete(f"/notifications/{notification_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == notification_id


def test_create_badge(client, test_db):
    unique_title = f"Test Badge {generate_unique_string()}"
    response = client.post("/badges/", json={
        "title": unique_title,
        "description": "This is a test badge"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == unique_title
    assert data["description"] == "This is a test badge"
    assert "id" in data


def test_read_badges(client, test_db):
    unique_title = f"Test Badge {generate_unique_string()}"
    client.post("/badges/", json={
        "title": unique_title,
        "description": "This is a test badge"
    })
    response = client.get("/badges/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_read_badge(client, test_db):
    unique_title = f"Test Badge {generate_unique_string()}"
    response = client.post("/badges/", json={
        "title": unique_title,
        "description": "This is a test badge"
    })
    badge_id = response.json()["id"]
    response = client.get(f"/badges/{badge_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == unique_title
    assert data["description"] == "This is a test badge"


def test_update_badge(client, test_db):
    unique_title = f"Test Badge {generate_unique_string()}"
    response = client.post("/badges/", json={
        "title": unique_title,
        "description": "This is a test badge"
    })
    badge_id = response.json()["id"]
    updated_title = f"Updated Badge {generate_unique_string()}"
    response = client.put(f"/badges/{badge_id}", json={
        "title": updated_title,
        "description": "This is an updated badge"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == updated_title
    assert data["description"] == "This is an updated badge"


def test_delete_badge(client, test_db):
    unique_title = f"Test Badge {generate_unique_string()}"
    response = client.post("/badges/", json={
        "title": unique_title,
        "description": "This is a test badge"
    })
    badge_id = response.json()["id"]
    response = client.delete(f"/badges/{badge_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == badge_id
