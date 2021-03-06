const pool = require("../utils/pool");
const Post = require("./Post");

module.exports = class User {
    id;
    email;
    passwordHash;
    displayName;
    userImageUrl;
    aboutMe;

    constructor(row) {
        this.id = row.id;
        this.email = row.email;
        this.passwordHash = row.password_hash;
        this.displayName = row.display_name;
        this.userImageUrl = row.user_image_url;
        this.aboutMe = row.about_me;
    }

    static async insertPostrUser({ email, passwordHash, displayName }) {
        const lowerEmail = email.toLowerCase()

        const { rows } = await pool.query(`
        INSERT INTO users (email, password_hash, display_name)
        VALUES ($1, $2, $3)
        RETURNING *;
        `, [lowerEmail, passwordHash, displayName])

        return new User(rows[0])
    }

    static async insertGoogleUser({ email }) {
        const lowerEmail = email.toLowerCase()

        const { rows } = await pool.query(`
        INSERT INTO users (email) VALUES ($1) 
        ON CONFLICT (email) DO UPDATE 
        SET email = $1
        RETURNING *;
        `, [lowerEmail])

        return new User(rows[0])
    }

    static async findByEmail(email) {
        const lowerEmail = email.toLowerCase()

        const { rows } = await pool.query(`
        SELECT * FROM users WHERE email = $1;
        `, [lowerEmail])

        if (!rows[0]) throw new Error(`No user with email ${email} found.`);
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

    static async updateDisplayNameById({ displayName, userId }) {
        const { rows } = await pool.query(`
        UPDATE users
        SET display_name = $1
        WHERE id = $2
        RETURNING *;
        `, [displayName, userId])

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
            ORDER BY posts.date_created DESC
        )

        SELECT users.*, json_agg(joined_posts) as posts
        FROM users
        LEFT JOIN joined_posts
        ON users.id = joined_posts.user_id
        WHERE users.id = $1
        GROUP BY users.id

        `, [id])

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

// with commentReplies as (select comments.*, json_agg(c2) as comments
//         from comments
//         join comments as c2
//         on comments.id = c2.parent_comment_id and comments.read_by_parent = false
//         inner join users
//         on comments.user_id = users.id
//         where comments.user_id = 1
//         group by comments.id, users.display_name
// ),
// postReplies as (
// select posts.*, json_agg(comments) as comments
//          from posts
//          join comments
//          on posts.id = comments.post_id and comments.read_by_parent = false
//         inner join users
//          on posts.user_id = users.id
//          inner join boards
//          on posts.board_id = boards.id
//          where posts.user_id = 1
//          group by posts.id, users.display_name, boards.name
// 	)

// 	select * from postReplies, commentReplies