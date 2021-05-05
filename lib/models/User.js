const pool = require("../utils/pool");

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

}