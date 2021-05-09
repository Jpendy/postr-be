const { Router } = require('express')
const ensureAuth = require('../middleware/ensureAuth')
const UserService = require('../services/UserService')
const { createToken } = require('../utils/jwt')

const ONE_DAY = 1000 * 60 * 60 * 24

const attachCookie = (res, user) => {
    res.cookie('session', createToken(user), {
        httpOnly: true,
        maxAge: ONE_DAY,
        samesite: 'strict',
        secure: false
    })
}

module.exports = Router()

    .post('/postr-signup', (req, res, next) => {
        UserService
            .postrCreate(req.body)
            .then(user => {
                attachCookie(res, user);
                res.send(user)
            })
            .catch(next)
    })

    .post('/postr-login', (req, res, next) => {
        UserService
            .authorize(req.body)
            .then(user => {
                attachCookie(res, user);
                res.send(user)
            })
            .catch(next)
    })

    .get('/google-login', (req, res, next) => {

        res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email`)
    })

    .get('/login/google-callback', (req, res, next) => {

        UserService
            .googleLoginCreate(req.query.code)
            .then(user => {
                attachCookie(res, user)
                res.redirect('http://localhost:7891')
            })
            .catch(next)
    })

    .get('/logout', (req, res) => {
        res.clearCookie('session', {
            httpOnly: true,
            samesite: 'strict',
            secure: false
        })
        res.send({ logout: true })
    })

    .get('/verify', ensureAuth, (req, res) => {
        res.send(req.user)
    })