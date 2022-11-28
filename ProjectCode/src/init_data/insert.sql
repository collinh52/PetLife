INSERT INTO users (username, password, profile_name, bio, profile_image_url, email, pet_type, birthday, joined_timestamp) VALUES
('collin', '1234', 'Collin', 'This is my bio', 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1.00xw:0.669xh;0,0.190xh&resize=640:*', 'coha2902@colorado.edu','Dog','2019-01-03','2022-11-03 13:23:44' ),
('johnson', '7890', 'John Doe', 'Info in my bio', '', 'johndoe@gmail.com','Cat','2015-11-03','2022-11-03 10:18:50' ),
('fishlover5', '5678', 'Nemo', 'I live in Sydney', '', 'nemo@gmail.com','Fish','2019-10-08','2022-11-03 12:02:02' ),
('mary', 'pass', 'Secretariat', 'Triple Crown Winner', '', 'faster_than_you@gmail.com','Horse','2010-07-08','2022-11-03 02:02:02' ),
('tweet', '1111', 'Tweety', 'About me', '', 'tweet@gmail.com','Bird','2011-12-08','2022-11-03 02:02:02' );

INSERT INTO pictures (picture_id, picture_url, post_id) VALUES (1, 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1.00xw:0.669xh;0,0.190xh&resize=640:*', 1);

-- INSERT INTO videos (video_id, video_url, post_id) VALUES ();

INSERT INTO posts (post_id, username, picture_id, caption, location) VALUES (1, 'collin', 1, 'Good boy', 'Boulder, CO');


INSERT INTO likes (like_id, post_id, username) VALUES (1, 1, 'johnson'),
(2,1,'mary'),
(3,1,'tweet');

INSERT INTO comments (comment_id, comment_text, post_id, username) values (1, 'Very cool', 1, 'johnson');

INSERT INTO followers (follower_id, following_id) VALUES ('collin', 'johnson'),
('johnson', 'collin'),
('mary','tweet'),
('tweet','mary'),
('johnson','mary');

INSERT INTO communities (community_id, community_name) VALUES 
(1, 'Dogs'),
(2, 'Cats'),
(3,'Fish'),
(4,'Horses'),
(5,'Birds');

INSERT INTO community_member (username, community_id) VALUES 
('collin', 1),
('collin', 2),
('johnson',2),  
('fishlover5',3),
('mary',4),
('tweet',5);