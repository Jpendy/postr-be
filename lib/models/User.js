const pool = require("../utils/pool");
const Post = require("./Post");

module.exports = class User {
    id;
    username;
    displayName;
    userImageUrl;
    aboutMe;

    constructor(row) {
        this.id = row.id;
        this.username = row.username;
        this.displayName = row.display_name;
        this.userImageUrl = row.user_image_url;
        this.aboutMe = row.about_me;
    }

    static async insert({ googleId, username, userImageUrl }) {
        const { rows } = await pool.query(`
        INSERT INTO users (google_id, username, display_name, user_image_url) VALUES ($1, $2, $3, $4) 
        ON CONFLICT (google_id) DO UPDATE 
        SET user_image_url = $2 
        RETURNING *;
        `, [googleId, username, username, userImageUrl])

        return new User(rows[0])
    }

    static async findById(id) {
        const { rows } = await pool.query(`
        SELECT * FROM users WHERE id = $1;
        `, [id])

        if (!rows[0]) throw new Error(`No user with id ${id} found...`)
        return new User(rows[0])
    }

    static async updateById({ displayName, userImageUrl, aboutMe, userId }) {
        const { rows } = await pool.query(`
        UPDATE users
        SET display_name = $1,
        user_image_url = $2,
        about_me = $3
        WHERE id = $4
        RETURNING *;
        `, [displayName, userImageUrl, aboutMe, userId])

        if (!rows[0]) throw new Error(`No user with id ${id} found...`)
        return new User(rows[0])
    }

    static async deleteById(userId) {
        const { rows } = await pool.query(`
        DELETE FROM users
        WHERE id = $1
        RETURNING *;
        `, [userId])

        if (!rows[0]) throw new Error(`No user with id ${id} found...`)
        return new User(rows[0])
    }

    static async findUserAndAllUsersPosts(id) {
        const { rows } = await pool.query(`
        WITH joined_posts as (
            SELECT posts.*, users.display_name as "createdBy", boards.name as board, COUNT(comments) as comment_count
            FROM posts
            JOIN users
            ON users.id = posts.user_id
            JOIN boards
            ON boards.id = posts.board_id
            LEFT JOIN comments
            ON posts.id = comments.post_id
            GROUP BY posts.id, users.display_name, boards.name
        )

        SELECT users.*, json_agg(joined_posts) as posts
        FROM users
        LEFT JOIN joined_posts
        ON users.id = joined_posts.user_id
        WHERE users.id = $1
        GROUP BY users.id


        `, [id])

        console.log(rows[0])
        return {
            ...new User(rows[0]),
            posts: rows[0].posts[0] ? rows[0].posts.map(post => ({
                ...new Post(post),
                createdBy: post.createdBy,
                board: post.board
            })) : []
        }
    }
}