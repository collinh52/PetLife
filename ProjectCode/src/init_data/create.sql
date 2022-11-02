DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    profile_name VARCHAR(60), 
    bio VARCHAR(250),
    profile_image_url VARCHAR(300),
    email VARCHAR(50),
    pet_type VARCHAR(50),
    birthday VARCHAR(50),
    joined_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

);

DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts(
    post_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    post_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    picture_id INTEGER,
    video_id INTEGER,
    caption VARCHAR(400),
    location VARCHAR(50),
    FOREIGN KEY(username) REFERENCES users(username),
	FOREIGN KEY(picture_id) REFERENCES pictures(picture_id),
    FOREIGN KEY(video_id) REFERENCES videos(video_id)
);


DROP TABLE IF EXISTS pictures CASCADE;
CREATE TABLE pictures (
    picture_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    picture_url TEXT NOT NULL,
    post_id	INTEGER NOT NULL
);

DROP TABLE IF EXISTS videos CASCADE;
CREATE TABLE videos (
  video_id INTEGER AUTO_INCREMENT PRIMARY KEY,
  video_url TEXT NOT NULL,
  post_id INTEGER NOT NULL
);

DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    comment_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    comment_text VARCHAR(255) NOT NULL,
    post_id INTEGER NOT NULL,
    username INTEGER NOT NULL,
    comment_timestamp TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(post_id) REFERENCES post(post_id),
    FOREIGN KEY(username) REFERENCES users(username)
);