
INSERT INTO badges (title, description) VALUES 
('Beginner Badge', 'Awarded for starting out'),
('Intermediate Badge', 'Awarded for progressing well'),
('Expert Badge', 'Awarded for mastery');

INSERT INTO challenges (title, description, output, difficulty, language) VALUES
('Challenge 1', 'First challenge description', 'Expected Output 1', 'Easy', 'Python'),
('Challenge 2', 'Second challenge description', 'Expected Output 2', 'Medium', 'JavaScript'),
('Challenge 3', 'Third challenge description', 'Expected Output 3', 'Hard', 'Go');

INSERT INTO resources (title, description) VALUES
('Resource 1', 'First resource description'),
('Resource 2', 'Second resource description'),
('Resource 3', 'Third resource description');

INSERT INTO users (username, email, password, role, score) VALUES
('user1', 'user1@example.com', 'hashed_password1', 'admin', 100),
('user2', 'user2@example.com', 'hashed_password2', 'user', 50),
('user3', 'user3@example.com', 'hashed_password3', 'user', 75);
