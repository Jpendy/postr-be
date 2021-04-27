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

    constructor(row) {
        this.id = row.id;
        this.body = row.body;
        this.voteScore = row.vote_score;
        this.dateCreated = row.date_created;
        this.dateModified = row.date_modified;
        this.parentCommentId = row.parent_comment_id;
        this.userId = row.user_id;
        this.postId = row.post_id;
    }

    static async insert({ body, parentCommentId, userId, postId }) {
        const { rows } = await pool.query(`
        INSERT INTO comments (body, vote_score, date_created, parent_comment_id, user_id, post_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `, [body, 0, new Date(), parentCommentId, userId, postId])

        console.log('YOOOOO', rows[0])
        return new Comment(rows[0])
    }

}