const pool = require("../utils/pool");
const { calculateVote } = require("../utils/votes");
const Post = require("./Post");

module.exports = class PostsVoteHistory {
    id;
    vote;
    postId;
    userId;

    constructor(row) {
        this.id = row.id;
        this.vote = row.vote;
        this.postId = row.post_id;
        this.userId = row.user_id;
    }

    static async findPostVoteHistoryByUser(userId) {
        const { rows } = await pool.query(`
        SELECT * FROM posts_vote_history WHERE user_id = $1;
        `, [userId])

        return rows.map(row => new PostsVoteHistory(row))
    }

    static async newVote(voteValue, postId, userId) {
        const { rows } = await pool.query(`
            WITH new_vote_history AS (
                INSERT INTO posts_vote_history (vote, post_id, user_id)
                VALUES ($1, $2, $3)
                RETURNING posts_vote_history.*
                ),
            updated_post AS (
                UPDATE posts
                SET vote_score = vote_score + $1
                WHERE posts.id = $2
                RETURNING posts.*
            )   
            SELECT *, new_vote_history.id as history_id FROM new_vote_history, updated_post;
        `, [voteValue, postId, userId])

        if (!rows[0]) throw new Error(`No post with id ${id} found...`)
        return {
            post: new Post(rows[0]),
            voteHistory: {
                ...new PostsVoteHistory(rows[0]),
                id: rows[0].history_id,
                userId
            }
        };
    }

    static async updateVote(voteHistory, vote, postId, userId) {
        const { voteValue, newVoteHistoryValue } = calculateVote(voteHistory, vote)

        const { rows } = await pool.query(`
            WITH updated_vote_history AS (
                UPDATE posts_vote_history
                SET vote = $1
                WHERE post_id = $3
                AND user_id = $4
                RETURNING posts_vote_history.*
            ),
            updated_post AS (
                UPDATE posts
                SET vote_score = vote_score + $2
                WHERE id = $3
                RETURNING posts.*
            )
            SELECT *, updated_vote_history.id as history_id FROM updated_vote_history, updated_post;
        `, [newVoteHistoryValue, voteValue, postId, userId])

        if (!rows[0]) throw new Error(`No post with id ${id} found...`)
        return {
            post: {
                ...new Post(rows[0]),
                id: rows[0].post_id
            },
            voteHistory: {
                ...new PostsVoteHistory(rows[0]),
                id: rows[0].history_id,
                userId
            }
        };
    }
}