DROP TABLE IF EXISTS "badges";
DROP SEQUENCE IF EXISTS badge_id_seq;
CREATE SEQUENCE badge_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."badges" (
    "id" integer DEFAULT nextval('badge_id_seq') NOT NULL,
    "title" character varying(50) NOT NULL,
    "description" character varying(200) NOT NULL,
    CONSTRAINT "badge_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "badge_title_key" UNIQUE ("title")
) WITH (oids = false);


DROP TABLE IF EXISTS "challenges";
DROP SEQUENCE IF EXISTS challenge_id_seq;
CREATE SEQUENCE challenge_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."challenges" (
    "id" integer DEFAULT nextval('challenge_id_seq') NOT NULL,
    "title" character varying(50) NOT NULL,
    "description" character varying(200) NOT NULL,
    "output" character varying(300) NOT NULL,
    "difficulty" character varying(20) NOT NULL,
    "language" character varying(20) NOT NULL,
    CONSTRAINT "challenge_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "challenge_title_key" UNIQUE ("title")
) WITH (oids = false);


DROP TABLE IF EXISTS "friends";
CREATE TABLE "public"."friends" (
    "user_id1" integer NOT NULL,
    "user_id2" integer NOT NULL,
    CONSTRAINT "friend_pkey" PRIMARY KEY ("user_id1", "user_id2")
) WITH (oids = false);


DROP TABLE IF EXISTS "resources";
DROP SEQUENCE IF EXISTS resource_id_seq;
CREATE SEQUENCE resource_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."resources" (
    "id" integer DEFAULT nextval('resource_id_seq') NOT NULL,
    "title" character varying(50) NOT NULL,
    "description" character varying(200) NOT NULL,
    CONSTRAINT "resource_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "resource_title_key" UNIQUE ("title")
) WITH (oids = false);


DROP TABLE IF EXISTS "userbadge";
CREATE TABLE "public"."userbadge" (
    "user_id" integer NOT NULL,
    "badge_id" integer NOT NULL,
    CONSTRAINT "friends_pkey" PRIMARY KEY ("user_id", "badge_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "userchallenge";
CREATE TABLE "public"."userchallenge" (
    "user_id" integer NOT NULL,
    "challenge_id" integer NOT NULL,
    CONSTRAINT "userchallenge_pkey" PRIMARY KEY ("user_id", "challenge_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

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


ALTER TABLE ONLY "public"."friends" ADD CONSTRAINT "friend_user_id1_fkey" FOREIGN KEY (user_id1) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."friends" ADD CONSTRAINT "friend_user_id2_fkey" FOREIGN KEY (user_id2) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."userbadge" ADD CONSTRAINT "friends_badge_id_fkey" FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."userbadge" ADD CONSTRAINT "friends_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."userchallenge" ADD CONSTRAINT "userchallenge_challenge_id_fkey" FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."userchallenge" ADD CONSTRAINT "userchallenge_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;
