INSERT INTO badges (id, title, description) VALUES 
(1, 'Beginner Badge', 'Awarded for starting out'),
(2, 'Intermediate Badge', 'Awarded for progressing well'),
(3, 'Expert Badge', 'Awarded for mastery');

INSERT INTO challenges (id, title, description, output, difficulty, language) VALUES
(1, 'Challenge 1', 'First challenge description', 'Expected Output 1', 'Easy', 'Python'),
(2, 'Challenge 2', 'Second challenge description', 'Expected Output 2', 'Medium', 'JavaScript'),
(3, 'Challenge 3', 'Third challenge description', 'Expected Output 3', 'Hard', 'Go');

INSERT INTO resources (id, title, description) VALUES
(1, 'Resource 1', 'First resource description'),
(2, 'Resource 2', 'Second resource description'),
(3, 'Resource 3', 'Third resource description');

INSERT INTO users (id, username, email, password, role, score) VALUES
(1, 'user1', 'user1@example.com', 'hashed_password1', 'admin', 100),
(2, 'user2', 'user2@example.com', 'hashed_password2', 'user', 50),
(3, 'user3', 'user3@example.com', 'hashed_password3', 'user', 75);
