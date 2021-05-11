const jwt = require('jsonwebtoken')

const createToken = (user) => {

    delete user.passwordHash;

    return jwt.sign({ ...user }, process.env.APP_SECRET, {
        expiresIn: '24h'
    })
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.APP_SECRET)
}

module.exports = {
    createToken,
    verifyToken
}