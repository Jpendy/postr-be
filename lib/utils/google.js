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

const getGoogleUserProfileInfo = async (token) => {

    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    const json = await res.json()
    console.log('EMAIL EMAIL', json)

    return fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(res => {
            console.log(res)
            return res
        })
        .then(({ name, picture, id }) => ({
            googleId: id,
            username: name,
            userImageUrl: picture
        }))
}

module.exports = {
    exchangeGoogleCodeForToken,
    getGoogleUserProfileInfo
}