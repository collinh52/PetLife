DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    profile_name VARCHAR(60),
    bio VARCHAR(250),
    profile_image_url VARCHAR(300),
    email VARCHAR(50),
    pet_type VARCHAR(50),
    birthday DATE,
    joined_timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS pictures CASCADE;
CREATE TABLE pictures (
    picture_id SERIAL PRIMARY KEY,
    picture_url TEXT NOT NULL,
    post_id	INTEGER NOT NULL
);

DROP TABLE IF EXISTS videos CASCADE;
CREATE TABLE videos (
  video_id SERIAL PRIMARY KEY,
  video_url TEXT NOT NULL,
  post_id INTEGER NOT NULL
);

DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts(
    post_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    post_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    picture_id INTEGER,
    video_id INTEGER,
    caption VARCHAR(400),
    location VARCHAR(50),
    num_likes INTEGER DEFAULT 0,
    FOREIGN KEY(username) REFERENCES users(username),
	FOREIGN KEY(picture_id) REFERENCES pictures(picture_id),
    FOREIGN KEY(video_id) REFERENCES videos(video_id)
);

DROP TABLE IF EXISTS likes CASCADE;
CREATE TABLE likes (
    like_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    username VARCHAR(50) NOT NULL,
    like_timestamp TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(post_id) REFERENCES posts(post_id),
    FOREIGN KEY(username) REFERENCES users(username)
);

DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    comment_text VARCHAR(255) NOT NULL,
    post_id INTEGER NOT NULL,
    username VARCHAR(50) NOT NULL,
    comment_timestamp TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(post_id) REFERENCES posts(post_id),
    FOREIGN KEY(username) REFERENCES users(username)
);

DROP TABLE IF EXISTS followers CASCADE;
CREATE TABLE followers (
    follower_id VARCHAR(50) NOT NULL,
    following_id VARCHAR(50) NOT NULL,
    followed_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(follower_id) REFERENCES users(username),
    FOREIGN KEY(following_id) REFERENCES users(username),
    PRIMARY KEY(follower_id, following_id)
);

DROP TABLE IF EXISTS communities CASCADE;
CREATE TABLE communities (
    community_id SERIAL PRIMARY KEY,
    community_name VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS community_member CASCADE;
CREATE TABLE community_member (
    username VARCHAR(50) NOT NULL,
    community_id INTEGER NOT NULL,
    FOREIGN KEY(username) REFERENCES users(username),
    FOREIGN KEY(community_id) REFERENCES communities(community_id),
    PRIMARY KEY(username, community_id)
);
