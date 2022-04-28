const pool = require("../utils/pool");
const User = require("./User");

module.exports = class Comment {

    id;
    body;
    voteScore;
    dateCreated;
    dateModified;
    readByParent;
    parentCommentId;
    parentPostId;
    userId;
    postId;
    replies;

    constructor(row) {
        this.id = row.id;
        this.body = row.body;
        this.voteScore = row.vote_score;
        this.dateCreated = row.date_created.toString();
        this.dateModified = row.date_modified;
        this.readByParent = row.read_by_parent;
        this.parentCommentId = row.parent_comment_id;
        this.parentPostId = row.parent_post_id;
        this.userId = row.user_id;
        this.postId = row.post_id;
        this.replies = row.replies;
    }

    static async insert({ body, parentCommentId, userId, postId, parent_post_id = null }) {
        if (parentCommentId) {
            parent_post_id = postId;
            postId = null;
        }
        const { rows } = await pool.query(`
        WITH inserted_comment as (
            INSERT INTO comments (body, vote_score, date_created, read_by_parent, parent_comment_id, user_id, post_id, parent_post_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        )
        SELECT inserted_comment.*, users.display_name as "createdBy" 
        FROM inserted_comment
        JOIN users
        ON users.id = inserted_comment.user_id;

        `, [body, 0, Date.now(), false, parentCommentId, userId, postId, parent_post_id])

        return {
            ...new Comment(rows[0]),
            createdBy: rows[0].createdBy
        }
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
        if (!comment.replies) return {
            ...new Comment(comment),
            createdBy: comment.createdBy
        }

        return {
            ...new Comment(comment),
            createdBy: comment.createdBy,
            replies: comment.replies.map(comment => Comment.commentsMunge(comment))
        }
    }

    static async findAllUnreadPostAndCommentReplies(userId) {

        const { rows } = await pool.query(`
        select comments.*
        from comments
        left join comments as parent_comment
        on comments.parent_comment_id = parent_comment.id
        left join posts
        on comments.post_id = posts.id
        and parent_comment.user_id = $1 
        or posts.user_id = $1
        where comments.read_by_parent = false
        group by comments.id
        order by comments.date_created desc;
        `, [userId])

        return rows.map(row => new Comment(row))
    }

}

