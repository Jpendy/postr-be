const pool = require("../utils/pool");
const Post = require("./Post");

module.exports = class Board {

    id;
    name;
    bannerImageUrl;
    primaryColor;
    secondaryColor;
    tertiaryColor;
    userId;
    dateCreated;
    postCount;

    constructor(row) {
        this.id = row.id;
        this.name = row.name;
        this.bannerImageUrl = row.banner_image_url;
        this.primaryColor = row.primary_color;
        this.secondaryColor = row.secondary_color;
        this.tertiaryColor = row.tertiary_color;
        this.userId = row.user_id;
        this.dateCreated = row.date_created.toString();
        this.postCount = row.post_count;
    }

    static async insert({ name, userId }) {
        const { rows } = await pool.query(`
        INSERT INTO boards (name, user_id, date_created) VALUES ($1, $2, $3) RETURNING *;
        `, [name, userId, new Date()])

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
        SELECT boards.*, COUNT(posts.id) as post_count, json_agg(posts) as posts
        FROM boards 
        LEFT JOIN posts
        ON boards.id = posts.board_id
        WHERE name = $1
        GROUP BY boards.id;
        `, [name])

        if (!rows[0]) throw new Error(`No board with name ${name} found...`)
        return {
            ...new Board(rows[0]),
            posts: rows[0].posts[0] ? rows[0].posts.map(post => new Post(post)) : []
        }
    }

    static async updateById(id, { name, bannerImageUrl, primaryColor, secondaryColor, tertiaryColor, userId }) {
        const { rows } = await pool.query(`
        UPDATE boards 
        SET name = $1,
        banner_image_url = $2,
        primary_color = $3,
        secondary_color = $4,
        tertiary_color = $5
        WHERE id = $6 
        AND user_id = $7
        RETURNING *;
        `, [name, bannerImageUrl, primaryColor, secondaryColor, tertiaryColor, id, userId])

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