const { Router } = require('express')
const ensureAuth = require('../middleware/ensureAuth')
const Comment = require('../models/Comment')

module.exports = Router()
    .post('/', ensureAuth, (req, res, next) => {
        Comment
            .insert({ ...req.body, userId: req.user.id })
            .then(comment => res.send(comment))
            .catch(next)
    })

    .get('/:id', (req, res, next) => {
        Comment
            .findById(req.params.id)
            .then(comment => res.send(comment))
            .catch(next)
    })