const pool = require("../utils/pool");

module.exports = class User {

    id;
    username;
    displayName;
    userImageUrl;

    constructor(row) {
        this.id = row.id;
        this.username = row.username;
        this.displayName = row.display_name;
        this.userImageUrl = row.user_image_url;
    }

    static async insert({ username, userImageUrl }) {
        const { rows } = await pool.query(`
        INSERT INTO users (username, user_image_url) VALUES ($1, $2) 
        ON CONFLICT (username) DO UPDATE 
        SET user_image_url = $2 
        returning *;
        `, [username, userImageUrl])

        return new User(rows[0])
    }

}