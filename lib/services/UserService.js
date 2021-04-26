const User = require('../models/User')
const { exchangeGoogleCodeForToken, getGoogleUserProfileInfo } = require('../utils/google')

module.exports = class UserService {

    static googleLoginCreate(code) {
        return exchangeGoogleCodeForToken(code)
            .then(getGoogleUserProfileInfo)
            .then(User.insert)
    }
}