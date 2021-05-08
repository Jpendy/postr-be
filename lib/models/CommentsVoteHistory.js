const pool = require("../utils/pool");
const { calculateVote } = require("../utils/votes");
const Comment = require("./Comment");

module.exports = class CommentsVoteHistory {
    id;
    vote;
    commentId;
    userId;

    constructor(row) {
        this.id = row.id;
        this.vote = row.vote;
        this.commentId = row.comment_id;
        this.userId = row.user_id;
    }

    static async findCommentVoteHistoryByUser(userId) {
        const { rows } = await pool.query(`
        SELECT * FROM comments_vote_history WHERE user_id = $1;
        `, [userId])

        return rows.map(row => new CommentsVoteHistory(row))
    }

    static async newVote(voteValue, commentId, userId) {
        const { rows } = await pool.query(`
            WITH new_vote_history AS (
                INSERT INTO comments_vote_history (vote, comment_id, user_id)
                VALUES ($1, $2, $3)
                RETURNING comments_vote_history.*
                ),
            updated_comment AS (
                UPDATE comments
                SET vote_score = vote_score + $1
                WHERE comments.id = $2
                RETURNING comments.*
            )   
            SELECT *, new_vote_history.id as history_id FROM new_vote_history, updated_comment;
        `, [voteValue, commentId, userId])

        if (!rows[0]) throw new Error(`No comment with id ${id} found...`)
        return {
            comment: new Comment(rows[0]),
            voteHistory: {
                ...new CommentsVoteHistory(rows[0]),
                id: rows[0].history_id,
                userId
            }
        };
    }

    static async updateVote(voteHistory, vote, commentId, userId) {
        const { voteValue, newVoteHistoryValue } = calculateVote(voteHistory, vote)

        const { rows } = await pool.query(`
            WITH updated_vote_history AS (
                UPDATE comments_vote_history
                SET vote = $1
                WHERE comment_id = $3
                AND user_id = $4
                RETURNING comments_vote_history.*
            ),
            updated_comment AS (
                UPDATE comments
                SET vote_score = vote_score + $2
                WHERE id = $3
                RETURNING comments.*
            )
            SELECT *, updated_vote_history.id as history_id FROM updated_comment, updated_vote_history;
        `, [newVoteHistoryValue, voteValue, commentId, userId])

        if (!rows[0]) throw new Error(`No comment with id ${id} found...`)
        return {
            comment: new Comment(rows[0]),
            // id: rows[0].comment_id,
            voteHistory: {
                ...new CommentsVoteHistory(rows[0]),
                id: rows[0].history_id,
                userId
            }
        };
    }
}