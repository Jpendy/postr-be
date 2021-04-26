const fetch = require("node-fetch")

const exchangeGoogleCodeForToken = (code) => {
    return fetch(`https://oauth2.googleapis.com/token`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET
        })
    })
        .then(response => response.json())
        .then(({ access_token }) => access_token)
}

const getGoogleUserProfileInfo = (token) => {

    return fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(({ name, picture }) => ({
            username: name,
            userImageUrl: picture
        }))
}

module.exports = {
    exchangeGoogleCodeForToken,
    getGoogleUserProfileInfo
}