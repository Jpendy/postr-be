const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

module.exports = async (req, res, next) => {
    const token = req.cookies.session;
    try {
        const verifiedUser = verifyToken(token);
        const user = await User.findById(verifiedUser.id)

        delete user.passwordHash;
        req.user = user;

        next();
    } catch (err) {
        next(err);
    }
}