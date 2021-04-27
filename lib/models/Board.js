const pool = require("../utils/pool");
const Post = require("./Post");

module.exports = class Board {

    id;
    name;
    userId;
    dateCreated;
    postCount;

    constructor(row) {
        this.id = row.id;
        this.name = row.name;
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

        if (!rows[0]) throw new Error(`No board with name ${name} found`)
        console.log('AYYYYYYY', rows[0])
        return {
            ...new Board(rows[0]),
            posts: rows[0].posts[0] ? rows[0].posts.map(post => new Post(post)) : []
        }
    }

    static async updateById(id, { name, userId }) {
        const { rows } = await pool.query(`
        UPDATE boards 
        SET name = $1
        WHERE id = $2 
        AND user_id = $3
        RETURNING *;
        `, [name, id, userId])

        if (!rows[0]) throw new Error(`No board with id ${id} found`)
        return new Board(rows[0])
    }

    static async deleteById(id, { userId }) {
        const { rows } = await pool.query(`
        DELETE FROM boards 
        WHERE id = $1 
        AND user_id = $2
        RETURNING *;
        `, [id, userId])

        if (!rows[0]) throw new Error(`No board with id ${id} found`)
        return new Board(rows[0])
    }
}