const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
    const token = req.cookies.session;

    try {
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
}