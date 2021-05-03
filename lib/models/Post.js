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
        INSERT INTO posts (title, image_url, body, vote_score, date_created, user_id, board_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
        `, [title, imageUrl, body, 0, new Date(), userId, boardId])

        return new Post(rows[0])
    }

    static async find() {
        const { rows } = await pool.query(`
        SELECT posts.*, COUNT(comments.id) as comment_count
        FROM posts
        LEFT JOIN comments
        ON posts.id = comments.post_id
        GROUP BY posts.id
        `, [])

        return rows.map(row => new Post(row))
    }

    static async findById(id) {
        const { rows } = await pool.query(`
        select posts.*, COUNT(comments.id) as comment_count, json_agg(comment_tree(comments.id)) as comments
        from posts
        left join comments
        on posts.id = comments.post_id
        where posts.id = $1
        group by posts.id;
        `, [id])

        if (!rows[0]) throw new Error(`No post with id ${id} found...`)
        return {
            ...new Post(rows[0]),
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