const pool = require("../utils/pool");
const Comment = require("./Comment");

module.exports = class Post {

    id;
    title;
    imageUrl;
    body;
    voteScore;
    dateCreated;
    dateModified;
    userId;
    boardId;
    commentCount;

    constructor(row) {
        this.id = row.id;
        this.title = row.title;
        this.imageUrl = row.image_url;
        this.body = row.body;
        this.voteScore = row.vote_score;
        this.dateCreated = row.date_created.toString();
        this.dateModified = row.date_modified;
        this.userId = row.user_id;
        this.boardId = row.board_id;
        this.commentCount = row.comment_count;
    }

    static async insert({ title, imageUrl, body, userId, boardId }) {
        const { rows } = await pool.query(`

        WITH post as (
            INSERT INTO posts (title, image_url, body, vote_score, date_created, user_id, board_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        )
        SELECT post.*, boards.name as board, users.display_name as "createdBy", COUNT(comments.id) as comment_count
        FROM post
        INNER JOIN users
        ON users.id = post.user_id
        INNER JOIN boards
        ON boards.id = post.board_id
        LEFT JOIN comments
        ON post.id = comments.post_id
        GROUP BY post.title, post.id, post.image_url, post.body, post.vote_score, post.date_created, post.date_modified, post.user_id, post.board_id, boards.name, users.display_name
        
        `, [title, imageUrl, body, 0, new Date(), userId, boardId])

        return {
            ...new Post(rows[0]),
            board: rows[0].board,
            createdBy: rows[0].createdBy
        }
    }

    static async find() {
        const { rows } = await pool.query(`
        SELECT posts.*, users.display_name as "createdBy", boards.name as board, COUNT(comments.id) as comment_count
        FROM posts
        INNER JOIN users
        on posts.user_id = users.id
        INNER JOIN boards
        on posts.board_id = boards.id
        LEFT JOIN comments
        ON posts.id = comments.post_id
        GROUP BY posts.id, users.display_name, boards.name
        `, [])

        return rows.map(row => ({
            ...new Post(row),
            createdBy: row.createdBy,
            board: row.board
        }))
    }

    static async findById(id) {
        const { rows } = await pool.query(`
        select posts.*, users.username as "createdBy", boards.name as board, COUNT(comments.id) as comment_count, json_agg(comment_tree(comments.id)) as comments
        from posts
        left join comments
        on posts.id = comments.post_id
        inner join users
        on posts.user_id = users.id
        inner join boards
        on posts.board_id = boards.id
        where posts.id = $1
        group by posts.id, users.username, boards.name;
        `, [id])

        if (!rows[0]) throw new Error(`No post with id ${id} found...`)
        return {
            ...new Post(rows[0]),
            board: rows[0].board,
            createdBy: rows[0].createdBy,
            comments: rows[0].comments[0] ? rows[0].comments.map(comment => Comment.commentsMunge(comment)) : []
        }
    }

    static async updateById(id, { title, imageUrl, body, userId }) {
        const { rows } = await pool.query(`
        UPDATE posts
        SET title = $1,
        image_url = $2,
        body = $3,
        date_modified = $4
        WHERE id = $5
        AND user_id = $6
        RETURNING *;
        `, [title, imageUrl, body, new Date(), id, userId])

        if (!rows[0]) throw new Error(`No post with id ${id} by user ${userId} found...`)
        return new Post(rows[0])
    }

    static async deleteById(id, { userId }) {
        const { rows } = await pool.query(`
        DELETE FROM posts 
        WHERE id = $1
        AND user_id = $2
        RETURNING *;
        `, [id, userId])

        if (!rows[0]) throw new Error(`No post with id ${id} by user ${userId} found...`)
        return new Post(rows[0])
    }
}