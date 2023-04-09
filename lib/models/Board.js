const pool = require("../utils/pool");
const Post = require("./Post");

module.exports = class Board {
    id;
    name;
    bannerImageUrl;
    bgColor;
    postColor;
    fontColor;
    linkColor;
    userId;
    dateCreated;
    postCount;

    constructor(row) {
        this.id = row.id;
        this.name = row.name;
        this.bannerImageUrl = row.banner_image_url;
        this.bgColor = row.bg_color;
        this.postColor = row.post_color;
        this.fontColor = row.font_color;
        this.linkColor = row.link_color;
        this.userId = row.user_id;
        this.dateCreated = row.date_created.toString();
        this.postCount = row.post_count;
    }

    static async insert({ name, bannerImageUrl, bgColor, postColor, fontColor, linkColor, userId }) {
        const { rows } = await pool.query(`
        INSERT INTO boards (name, banner_image_url, bg_color, post_color, font_color, link_color, user_id, date_created) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `, [name, bannerImageUrl, bgColor, postColor, fontColor, linkColor, userId, Date.now()])

        return new Board(rows[0])
    }

    static async find() {
        const { rows } = await pool.query(`
            SELECT boards.*, COUNT(posts.id) as post_count
            FROM BOARDS
            LEFT JOIN posts
            ON boards.id = posts.board_id
            GROUP BY boards.id
        `, [])

        return rows.map(row => new Board(row))
    }

    static async findByName(name) {
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

        SELECT boards.*, users.display_name as "createdBy", COUNT(joined_posts.id) as post_count, json_agg(joined_posts) as posts
        FROM boards 
        LEFT JOIN joined_posts
        ON boards.id = joined_posts.board_id
        JOIN users
        ON users.id = boards.user_id
        WHERE boards.name = $1
        GROUP BY boards.id, users.display_name;
        `, [name])

        if (!rows[0]) throw new Error(`No board with name ${name} found...`)

        return {
            ...new Board(rows[0]),
            createdBy: rows[0].createdBy,
            posts: rows[0].posts[0] ? rows[0].posts.map(post => ({
                ...new Post(post),
                createdBy: post.createdBy,
                board: post.board
            })) : []
        }
    }

    static async updateById(id, { name, bannerImageUrl, bgColor, postColor, fontColor, linkColor, userId }) {
        const { rows } = await pool.query(`
        UPDATE boards 
        SET name = $1,
        banner_image_url = $2,
        bg_color = $3,
        post_color = $4,
        font_color = $5,
        link_color = $6
        WHERE id = $7 
        AND user_id = $8
        RETURNING *;
        `, [name, bannerImageUrl, bgColor, postColor, fontColor, linkColor, id, userId])

        if (!rows[0]) throw new Error(`No board with id ${id} owned by user ${userId} found...`)
        return new Board(rows[0])
    }

    static async deleteById(id, { userId }) {
        const { rows } = await pool.query(`
        DELETE FROM boards 
        WHERE id = $1 
        AND user_id = $2
        RETURNING *;
        `, [id, userId])

        if (!rows[0]) throw new Error(`No board with id ${id} owned by user ${userId} found...`)
        return new Board(rows[0])
    }
}