const pool = require("../utils/pool");
const Comment = require("./Comment");

module.exports = class Post {

    id;
    title;
    imageUrl;
    body;
    voteScore;
    dateCreated;
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

    // WITH comment_group as (select comments.*, json_agg(c2) as replies
    // from comments
    // left join comments c2
    // on comments.id = c2.parent_comment_id
    // where comments.post_id = 1
    // group by comments.id
    // )
    // select posts.*, json_agg(comment_group) as comments
    // from comment_group
    // join posts
    // on posts.id = comment_group.post_id
    // group by posts.id

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
            comments: rows[0].comments.map(comment => Comment.commentsMunge(comment))
        }
    }

    static async updateById(id, { title, imageUrl, body, userId }) {
        const { rows } = await pool.query(`
        UPDATE posts
        SET title = $1,
        image_url = $2,
        body = $3
        WHERE id = $4
        AND user_id = $5
        RETURNING *;
        `, [title, imageUrl, body, id, userId])

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