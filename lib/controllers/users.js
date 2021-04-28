const { Router } = require('express')
const ensureAuth = require('../middleware/ensureAuth')
const User = require('../models/User')

module.exports = Router()

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