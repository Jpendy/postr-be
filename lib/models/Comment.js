const pool = require("../utils/pool");

module.exports = class Comment {

    id;
    body;
    voteScore;
    dateCreated;
    dateModified;
    parentCommentId;
    userId;
    postId;
    replies;

    constructor(row) {
        this.id = row.id;
        this.body = row.body;
        this.voteScore = row.vote_score;
        this.dateCreated = row.date_created.toString();
        this.dateModified = row.date_modified;
        this.parentCommentId = row.parent_comment_id;
        this.userId = row.user_id;
        this.postId = row.post_id;
        this.replies = row.replies;
    }

    static async insert({ body, parentCommentId, userId, postId }) {
        const { rows } = await pool.query(`
        INSERT INTO comments (body, vote_score, date_created, parent_comment_id, user_id, post_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `, [body, 0, new Date(), parentCommentId, userId, postId])

        return new Comment(rows[0])
    }

    static async findById(id) {
        const { rows } = await pool.query(`
        SELECT comment_tree($1);
        `, [id])

        if (!rows[0].comment_tree) throw new Error(`No comment with id ${id} found`)
        return Comment.commentsMunge(rows[0].comment_tree)
    }

    static async updateById(id, { body, userId }) {
        const { rows } = await pool.query(`
        UPDATE comments
        SET body = $1,
        date_modified = $2
        WHERE id = $3
        AND user_id = $4
        RETURNING *;
        `, [body, new Date(), id, userId])

        if (!rows[0]) throw new Error(`No comment with id ${id} by user ${userId} found`)
        return new Comment(rows[0])
    }

    static async deleteById(id, userId) {
        const { rows } = await pool.query(`
        DELETE FROM comments
        WHERE id = $1
        AND user_id = $2
        RETURNING *;
        `, [id, userId])

        if (!rows[0]) throw new Error(`No comment with id ${id} by user ${userId} found`)
        return new Comment(rows[0])
    }

    static commentsMunge = (comment) => {
        if (!comment.replies) return new Comment(comment)

        return {
            ...new Comment(comment),
            replies: comment.replies.map(comment => Comment.commentsMunge(comment))
        }
    }
}

