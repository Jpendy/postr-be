const pool = require("../utils/pool");

module.exports = class Board {

    id;
    name;
    userId;
    dateCreated;

    constructor(row) {
        this.id = row.id;
        this.name = row.name;
        this.userId = row.user_id;
        this.dateCreated = row.date_created.toString();

    }

    static async insert({ name, userId }) {
        const { rows } = await pool.query(`
        INSERT INTO boards (name, user_id, date_created) VALUES ($1, $2, $3) RETURNING *;
        `, [name, userId, new Date()])

        return new Board(rows[0])
    }

    static async find() {
        const { rows } = await pool.query(`
            SELECT * FROM BOARDS
        `, [])

        return rows.map(row => new Board(row))
    }

    static async findById(id) {
        const { rows } = await pool.query(`
        SELECT * FROM boards WHERE id = $1;
        `, [id])
        if (!rows[0]) throw new Error(`No board with id ${id} found`)
        return new Board(rows[0])
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