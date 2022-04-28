DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts_vote_history;
DROP TABLE IF EXISTS comments_vote_history;
-- DROP TYPE IF EXISTS VALID_VOTES CASCADE;
drop function if exists comment_tree(comment_id bigint);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    display_name TEXT UNIQUE,
    about_me TEXT,
    user_image_url TEXT
);

CREATE TABLE boards (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    banner_image_url TEXT,
    bg_color TEXT,
    post_color TEXT,
    font_color TEXT,
    link_color TEXT,
    date_created BIGINT,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT,
    cloudinary_image_public_id TEXT,
    body TEXT,
    vote_score BIGINT NOT NULL,
    date_created BIGINT NOT NULL,
    date_modified BIGINT,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    board_id BIGINT REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    body TEXT NOT NULL,
    vote_score BIGINT NOT NULL,
    date_created BIGINT NOT NULL,
    date_modified BIGINT,
    read_by_parent BOOLEAN NOT NULL,
    parent_comment_id BIGINT REFERENCES comments(id) ON DELETE SET NULL,
    parent_post_id BIGINT REFERENCES posts(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    post_id BIGINT REFERENCES posts(id) ON DELETE SET NULL
);

-- CREATE TYPE VALID_VOTES AS INT ENUM (-1, 0, 1);

CREATE TABLE posts_vote_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vote INT CHECK (vote IN (-1, 0, 1)) NOT NULL,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments_vote_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vote INT CHECK (vote IN (-1, 0, 1)) NOT NULL,
    comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE
);

--comment tree function--
create or replace function comment_tree(comment_id bigint) returns json as
$$
declare
    children json;
    comment_obj json;
begin
    select json_agg(comment_tree(comments.id)) into children
    from comments
    where parent_comment_id=comment_id;
    
    select json_build_object(
        'id', comments.id,
        'body', comments.body,
		'vote_score', comments.vote_score,
		'date_created', comments.date_created,
		'date_modified', comments.date_modified,
		'parent_comment_id', comments.parent_comment_id,
        'parent_post_id', comments.parent_post_id,
		'createdBy', users.display_name,
        'user_id', comments.user_id,
		'post_id', comments.post_id,
        'replies', children
    ) into comment_obj 
    from comments
    join users
    on users.id = comments.user_id
    where comments.id=comment_id;

    return comment_obj;
end
$$ language plpgsql;


INSERT INTO users (email, display_name) VALUES ('jpendy256@gmail.com', 'Pendy');

INSERT INTO users (email) VALUES ('tom@tom.com|postr');


INSERT INTO boards (name, date_created, user_id) VALUES ('dev board 1', 1620751512118, 1);
INSERT INTO boards (name, banner_image_url, date_created, user_id) VALUES ('Blazers', 'https://cutewallpaper.org/21/portland-trail-blazers-background/Portland-Trail-Blazers-Banner-Fast-Online-Image-Editor-.jpg', 1620751512118, 1);

INSERT INTO posts (title, image_url, vote_score, date_created, board_id, user_id) VALUES ('Dame Time', 'https://i.ebayimg.com/images/g/CKsAAOSwjs5fj8XU/s-l300.jpg', 0, 1620751512118, 2, 1);

-- INSERT INTO posts (title, image_url, vote_score, date_created, board_id, user_id) VALUES ('Kitten Post', 'http://placekitten.com/200/200', 0, '1999-01-01', 1, 2);
