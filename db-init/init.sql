-- Create sequences first
DROP SEQUENCE IF EXISTS badge_id_seq CASCADE;
CREATE SEQUENCE badge_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

DROP SEQUENCE IF EXISTS challenge_id_seq CASCADE;
CREATE SEQUENCE challenge_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

DROP SEQUENCE IF EXISTS resource_id_seq CASCADE;
CREATE SEQUENCE resource_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

DROP SEQUENCE IF EXISTS tag_id_seq CASCADE;
CREATE SEQUENCE tag_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

DROP SEQUENCE IF EXISTS notification_id_seq CASCADE;
CREATE SEQUENCE notification_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

DROP TABLE IF EXISTS "friends" CASCADE;
DROP TABLE IF EXISTS "userbadge" CASCADE;
DROP TABLE IF EXISTS "userchallenge" CASCADE;
DROP TABLE IF EXISTS "challengetag" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;

DROP TABLE IF EXISTS "badges" CASCADE;
DROP TABLE IF EXISTS "challenges" CASCADE;
DROP TABLE IF EXISTS "resources" CASCADE;
DROP TABLE IF EXISTS "tags" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

CREATE TABLE "public"."badges" (
    "id" integer DEFAULT nextval('badge_id_seq') NOT NULL,
    "title" character varying(50) NOT NULL,
    "description" character varying(200) NOT NULL,
    CONSTRAINT "badge_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "badge_title_key" UNIQUE ("title")
) WITH (oids = false);

CREATE TABLE "public"."challenges" (
    "id" integer DEFAULT nextval('challenge_id_seq') NOT NULL,
    "title" character varying(50) NOT NULL,
    "description" character varying(2000) NOT NULL,
    "input" character varying(300) NOT NULL,
    "output" character varying(300) NOT NULL,
    "difficulty" character varying(20) NOT NULL,
    "language" character varying(20) NOT NULL,
    CONSTRAINT "challenge_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "challenge_title_key" UNIQUE ("title")
) WITH (oids = false);

CREATE TABLE "public"."tags" (
    "id" integer DEFAULT nextval('tag_id_seq') NOT NULL,
    "name" character varying(50) NOT NULL,
    CONSTRAINT "tag_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tag_name_key" UNIQUE ("name")
) WITH (oids = false);

CREATE TABLE "public"."challengetag" (
    "challenge_id" integer NOT NULL,
    "tag_id" integer NOT NULL,
    CONSTRAINT "challengetag_pkey" PRIMARY KEY ("challenge_id", "tag_id")
) WITH (oids = false);

-- Add this section to create the many-to-many relationship between resources and tags
CREATE TABLE "public"."resourcetag" (
    "resource_id" integer NOT NULL,
    "tag_id" integer NOT NULL,
    CONSTRAINT "resourcetag_pkey" PRIMARY KEY ("resource_id", "tag_id")
) WITH (oids = false);

CREATE TABLE "public"."friends" (
    "user_id1" integer NOT NULL,
    "user_id2" integer NOT NULL,
    CONSTRAINT "friend_pkey" PRIMARY KEY ("user_id1", "user_id2")
) WITH (oids = false);

CREATE TABLE "public"."resources" (
    "id" integer DEFAULT nextval('resource_id_seq') NOT NULL,
    "title" character varying(50) NOT NULL,
    "description" character varying(2000) NOT NULL,
    CONSTRAINT "resource_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "resource_title_key" UNIQUE ("title")
) WITH (oids = false);

CREATE TABLE "public"."userbadge" (
    "user_id" integer NOT NULL,
    "badge_id" integer NOT NULL,
    CONSTRAINT "userbadge_pkey" PRIMARY KEY ("user_id", "badge_id")
) WITH (oids = false);

CREATE TABLE "public"."userchallenge" (
    "user_id" integer NOT NULL,
    "challenge_id" integer NOT NULL,
    CONSTRAINT "userchallenge_pkey" PRIMARY KEY ("user_id", "challenge_id")
) WITH (oids = false);

CREATE TABLE "public"."users" (
    "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
    "username" character varying(50) NOT NULL,
    "email" character varying(100) NOT NULL,
    "password" character varying(255) NOT NULL,
    "role" character varying(20) NOT NULL,
    "score" integer DEFAULT '0',
    CONSTRAINT "users_email_key" UNIQUE ("email"),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_username_key" UNIQUE ("username")
) WITH (oids = false);

CREATE TABLE "public"."notifications" (
    "id" integer DEFAULT nextval('notification_id_seq') NOT NULL,
    "recipient_id" integer NOT NULL,
    "message" character varying(255) NOT NULL,
    "link" character varying(255),
    "read" boolean DEFAULT false,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "challenger_username" character varying(50),
    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

ALTER TABLE ONLY "public"."friends" ADD CONSTRAINT "friend_user_id1_fkey" FOREIGN KEY (user_id1) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."friends" ADD CONSTRAINT "friend_user_id2_fkey" FOREIGN KEY (user_id2) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."userbadge" ADD CONSTRAINT "userbadge_badge_id_fkey" FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."userbadge" ADD CONSTRAINT "userbadge_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."userchallenge" ADD CONSTRAINT "userchallenge_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."userchallenge" ADD CONSTRAINT "userchallenge_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."challengetag" ADD CONSTRAINT "challengetag_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."challengetag" ADD CONSTRAINT "challengetag_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."resourcetag" ADD CONSTRAINT "resourcetag_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."resourcetag" ADD CONSTRAINT "resourcetag_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."notifications" ADD CONSTRAINT "notification_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;

INSERT INTO badges (title, description) VALUES 
('Beginner Badge', 'Awarded for starting out'),
('Intermediate Badge', 'Awarded for progressing well'),
('Expert Badge', 'Awarded for mastery');

INSERT INTO challenges (title, description, input, output, difficulty, language) VALUES
('Palindrome', 'Given an integer x, return true if x is a palindrome, and false otherwise.
Example 1:

Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.
Example 2:

Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.
Example 3:

Input: x = 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.

Constraints:

-231 <= x <= 231 - 1

Follow up: Could you solve it without converting the integer to a string?', '121','True', 'Easy', 'Python'),
('Longest Substring Without Repeating Characters', 'Given a string s, find the length of the longest substring without repeating characters.


Example 1:

Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
Example 2:

Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
Example 3:

Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.

Constraints:

0 <= s.length <= 5 * 104
s consists of English letters, digits, symbols and spaces.', 'abcabcbb','3', 'Medium', 'JavaScript'),
('Longest valid parantheses', 'Given a string containing just the characters ( and ), return the length of the longest valid (well-formed) parentheses substring.

Example 1:

Input: s = "(()"
Output: 2
Explanation: The longest valid parentheses substring is "()".
Example 2:

Input: s = ")()())"
Output: 4
Explanation: The longest valid parentheses substring is "()()".
Example 3:

Input: s = ""
Output: 0


Constraints:

0 <= s.length <= 3 * 104
s[i] is ( or )', '(()','2', 'Hard', 'Go');

INSERT INTO resources (title, description) VALUES
('Understanding Palindromes', 
 'A palindrome is a sequence that reads the same backward as forward, such as "121" or "racecar". 
 Negative numbers, like -121, are not palindromes as the negative sign breaks symmetry. 

 Common solving techniques include:
 - Reversing the sequence and comparing it to the original.
 - Using mathematical operations (e.g., dividing and modulo operations) to reconstruct the reversed sequence without converting it to a string.

 This resource also covers:
 - Handling edge cases, such as single-digit numbers or zeros.
 - Optimizing solutions for large inputs by reducing unnecessary operations.'),

('Optimizing String Manipulations', 
 'String manipulation problems often involve finding patterns or relationships within a string, such as:
 - Finding the longest substring without repeating characters.
 - Identifying palindromic substrings or specific patterns.

 Techniques covered include:
 - The sliding window approach for maintaining a dynamic view of substrings.
 - Hash maps for efficiently tracking character occurrences.

 Additional focus is given to:
 - Handling edge cases, such as empty strings or strings with all unique characters.
 - Practical examples to reinforce understanding.'),

('Mastering Parentheses Problems', 
 'Parentheses problems, like finding the longest valid substring, revolve around balanced parentheses. 

 Key techniques include:
 - Using a stack to track unmatched opening brackets.
 - Dynamic programming (DP) to compute valid substrings based on prior results.

 For example:
 - A stack can identify the boundaries of valid substrings.
 - DP can calculate the length of valid substrings ending at specific positions.

 This resource addresses:
 - Corner cases, such as strings with no valid parentheses.
 - Efficient approaches to minimize space and time complexity.'),

('Algorithm Complexity Basics', 
 'Algorithm complexity evaluates the efficiency of a solution, crucial for optimizing performance. 

 Topics include:
 - Big-O notation for analyzing time and space complexity.
 - Real-world examples, such as iterating through arrays (O(n)) and nested loops (O(n^2)).

 Techniques for improving complexity:
 - Pruning unnecessary operations.
 - Using efficient data structures like hash maps for O(1) lookups.
 - Converting recursive solutions to iterative ones to save space.'),

('Python for Problem Solving', 
 'Python is a powerful language for algorithmic challenges due to its rich libraries and concise syntax.

 Covered tools:
 - The `collections` module for counters and deques.
 - `itertools` for generating combinations.
 - List comprehensions for creating efficient one-liners.

 Example problems include:
 - Checking for palindromes step-by-step.
 - Finding the longest substring with Python’s built-in functions, minimizing boilerplate code.'),

('JavaScript Algorithms', 
 'JavaScript is ideal for algorithmic challenges in web development and competitive programming.

 Highlights:
 - ES6 features like `Set` for tracking unique characters and `Map` for storing indices.
 - Iterative and recursive solutions for various problems.

 Focus areas:
 - Performance optimization by avoiding redundant loops.
 - Leveraging built-in array and string methods to simplify solutions.'),

('Go Language Fundamentals', 
 'Go (or Golang) is a statically typed language known for simplicity and concurrency handling. 

 Topics include:
 - Syntax and features like goroutines for concurrent execution.
 - Channels for goroutine communication.

 Practical examples:
 - Solving algorithmic problems, like finding the longest valid parentheses substring.
 - Leveraging Go’s built-in functions and idiomatic patterns.

 Additional tips:
 - Effective error handling.
 - Testing techniques for robust code.' 
);

INSERT INTO users (username, email, password, role, score) VALUES
('user1', 'user1@example.com', '$2y$10$SRGvDkhxmYo/jtIccmmHK.LAeULCdfhnTgu63i0z/a8cCj3/sBZsG', 'admin', 100),
('user2', 'user2@example.com', 'hashed_password2', 'user', 50),
('user3', 'user3@example.com', 'hashed_password3', 'user', 75);

-- Insert tags
INSERT INTO tags (name) VALUES 
('Palindrome'),
('String Manipulation'),
('Parentheses'),
('Algorithm Complexity'),
('Python'),
('JavaScript'),
('Go');

-- Associate tags with challenges
INSERT INTO challengetag (challenge_id, tag_id) VALUES
((SELECT id FROM challenges WHERE title = 'Palindrome'), (SELECT id FROM tags WHERE name = 'Palindrome')),
((SELECT id FROM challenges WHERE title = 'Palindrome'), (SELECT id FROM tags WHERE name = 'Algorithm Complexity')),
((SELECT id FROM challenges WHERE title = 'Palindrome'), (SELECT id FROM tags WHERE name = 'Python')),
((SELECT id FROM challenges WHERE title = 'Longest Substring Without Repeating Characters'), (SELECT id FROM tags WHERE name = 'String Manipulation')),
((SELECT id FROM challenges WHERE title = 'Longest Substring Without Repeating Characters'), (SELECT id FROM tags WHERE name = 'Algorithm Complexity')),
((SELECT id FROM challenges WHERE title = 'Longest Substring Without Repeating Characters'), (SELECT id FROM tags WHERE name = 'JavaScript')),
((SELECT id FROM challenges WHERE title = 'Longest valid parantheses'), (SELECT id FROM tags WHERE name = 'Parentheses')),
((SELECT id FROM challenges WHERE title = 'Longest valid parantheses'), (SELECT id FROM tags WHERE name = 'Algorithm Complexity')),
((SELECT id FROM challenges WHERE title = 'Longest valid parantheses'), (SELECT id FROM tags WHERE name = 'Go'));

-- Associate tags with resources
INSERT INTO resourcetag (resource_id, tag_id) VALUES
((SELECT id FROM resources WHERE title = 'Understanding Palindromes'), (SELECT id FROM tags WHERE name = 'Palindrome')),
((SELECT id FROM resources WHERE title = 'Understanding Palindromes'), (SELECT id FROM tags WHERE name = 'Algorithm Complexity')),
((SELECT id FROM resources WHERE title = 'Python for Problem Solving'), (SELECT id FROM tags WHERE name = 'Python')),
((SELECT id FROM resources WHERE title = 'Optimizing String Manipulations'), (SELECT id FROM tags WHERE name = 'String Manipulation')),
((SELECT id FROM resources WHERE title = 'Optimizing String Manipulations'), (SELECT id FROM tags WHERE name = 'Algorithm Complexity')),
((SELECT id FROM resources WHERE title = 'JavaScript Algorithms'), (SELECT id FROM tags WHERE name = 'JavaScript')),
((SELECT id FROM resources WHERE title = 'Mastering Parentheses Problems'), (SELECT id FROM tags WHERE name = 'Parentheses')),
((SELECT id FROM resources WHERE title = 'Mastering Parentheses Problems'), (SELECT id FROM tags WHERE name = 'Algorithm Complexity')),
((SELECT id FROM resources WHERE title = 'Go Language Fundamentals'), (SELECT id FROM tags WHERE name = 'Go'));