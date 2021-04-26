const pool = require("../utils/pool");

module.exports = class Post {

    id;
    title;
    imageUrl;
    body;
    dateCreated;
    userId;
    boardId;

    constructor(row) {
        this.id = row.id;
        this.title = row.title;
        this.imageUrl = row.image_url;
        this.body = row.body;
        this.dateCreated = row.date_created.toString();
        this.userId = row.user_id;
        this.boardId = row.board_id;
    }

    static async insert({ title, imageUrl, body, userId, boardId }) {
        const { rows } = await pool.query(`
        INSERT INTO posts (title, image_url, body, date_created, user_id, board_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `, [title, imageUrl, body, new Date(), userId, boardId])

        return new Post(rows[0])
    }
}