const { Router } = require('express')
const ensureAuth = require('../middleware/ensureAuth')
const PostsVoteHistory = require('../models/postsVoteHistory')
const User = require('../models/User')

module.exports = Router()

    .get('/post-vote-history', ensureAuth, (req, res, next) => {
        PostsVoteHistory
            .findPostVoteHistoryByUser(req.user.id)
            .then(history => res.send(history))
            .catch(next)
    })

    .get('/user-posts/:id', (req, res, next) => {
        User
            .findUserAndAllUsersPosts(req.params.id)
            .then(user => res.send(user))
            .catch(next)
    })

    .get('/:id', (req, res, next) => {
        User
            .findById(req.params.id)
            .then(user => res.send(user))
            .catch(next)
    })

    .put('/:id', ensureAuth, (req, res, next) => {
        User
            .updateById({ ...req.body, userId: req.user.id })
            .then(user => res.send(user))
            .catch(next)
    })

    .delete('/:id', ensureAuth, (req, res, next) => {
        User
            .deleteById(req.user.id)
            .then(deletedUser => {
                res.clearCookie('session', {
                    httpOnly: true,
                    samesite: 'strict',
                    secure: false
                })
                res.send(deletedUser)
            })
            .catch(next)
    })

