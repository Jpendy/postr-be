DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
drop function if exists comment_tree(comment_id bigint);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT UNIQUE,
    user_image_url TEXT
);

CREATE TABLE boards (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_created DATE NOT NULL
);

CREATE TABLE posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT,
    body TEXT,
    vote_score BIGINT NOT NULL,
    date_created DATE NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    board_id BIGINT REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    body TEXT NOT NULL,
    vote_score BIGINT NOT NULL,
    date_created DATE NOT NULL,
    date_modified DATE,
    parent_comment_id BIGINT REFERENCES comments(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    post_id BIGINT REFERENCES posts(id) ON DELETE SET NULL
);

--comment tree function--
create or replace function comment_tree(comment_id bigint) returns json as
$$
declare
    children json;
    comment_obj json;
begin
    select json_agg(comment_tree(id)) into children
    from comments
    where parent_comment_id=comment_id;
    
    select json_build_object(
        'id', id,
        'body', comments.body,
		'vote_score', comments.vote_score,
		'date_created', comments.date_created,
		'date_modified', comments.date_modified,
		'parent_comment_id', comments.parent_comment_id,
		'user_id', comments.user_id,
		'post_id', comments.post_id,
        'replies', children
    ) into comment_obj 
    from comments
    where id=comment_id;

    return comment_obj;
end
$$ language plpgsql;