const { Router } = require('express')
const ensureAuth = require('../middleware/ensureAuth')
const Board = require('../models/Board')

module.exports = Router()
    .post('/', ensureAuth, (req, res, next) => {
        Board
            .insert({ ...req.body, userId: req.user.id })
            .then(board => res.send(board))
            .catch(next)
    })

    .get('/', (req, res, next) => {
        Board
            .find()
            .then(boards => res.send(boards))
            .catch(next)
    })

    .get('/:id', (req, res, next) => {
        Board
            .findById(req.params.id)
            .then(board => res.send(board))
            .catch(next)
    })

    .put('/:id', ensureAuth, (req, res, next) => {
        Board
            .updateById(req.params.id, { ...req.body, userId: req.user.id })
            .then(updatedBoard => res.send(updatedBoard))
            .catch(next)
    })

    .delete('/:id', ensureAuth, (req, res, next) => {
        Board
            .deleteById(req.params.id, { userId: req.user.id })
            .then(board => res.send(board))
            .catch(next)
    })