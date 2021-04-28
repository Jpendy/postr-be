const pool = require("../utils/pool");
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

    static async postNewVote(voteValue, postId, userId) {
        const { rows } = await pool.query(`
        with vote_history as (
              INSERT INTO posts_vote_history (vote, post_id, user_id)
              VALUES ($1, $2, $3)
              RETURNING posts_vote_history.*
            ),
        
        update_post as (
            UPDATE posts
            SET vote_score = vote_score + $1
            WHERE posts.id = $2
            RETURNING posts.*
        )   
        SELECT * FROM vote_history, update_post;
        
        `, [voteValue, postId, userId])

        if (!rows[0]) throw new Error(`No post with id ${id} found...`)
        return {
            post: new Post(rows[0]),
            voteHistory: new PostsVoteHistory(rows[0])
        };
    }
}