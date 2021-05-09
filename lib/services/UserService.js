const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { exchangeGoogleCodeForToken, getGoogleUserProfileInfo } = require('../utils/google')

module.exports = class UserService {

    static googleLoginCreate(code) {
        return exchangeGoogleCodeForToken(code)
            .then(getGoogleUserProfileInfo)
            .then(User.insertGoogleUser)
    }

    static async postrCreate(reqBody) {
        const passwordHash = await bcrypt.hash(reqBody.password, +process.env.SALT_ROUNDS)
        const user = await User.insertPostrUser({ ...reqBody, passwordHash })
        return user;
    }

    static async authorize({ email, password }) {

        try {
            const user = await User.findByEmail(email);
            console.log(user)
            const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
            if (!passwordsMatch) throw new Error('Invalid Email/Password');

            return user;
        } catch (err) {
            err.status = 401;
            throw err;
        }
    }
}