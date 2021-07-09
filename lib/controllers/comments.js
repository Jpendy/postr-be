const { Router } = require('express')
const ensureAuth = require('../middleware/ensureAuth')
const Comment = require('../models/Comment')
const CommentsVoteHistory = require('../models/CommentsVoteHistory')

module.exports = Router()
    .post('/', ensureAuth, (req, res, next) => {
        Comment
            .insert({ ...req.body, userId: req.user.id })
            .then(comment => res.send(comment))
            .catch(next)
    })

    .post('/vote/:id', ensureAuth, (req, res, next) => {
        const { voteHistory, vote } = req.body;
        if (voteHistory === undefined || voteHistory === null) {
            CommentsVoteHistory
                .newVote(vote, req.params.id, req.user.id)
                .then(response => res.send(response))
                .catch(next)
        }
        else {
            CommentsVoteHistory
                .updateVote(voteHistory, vote, req.params.id, req.user.id)
                .then(response => res.send(response))
                .catch(next)
        }
    })

    .get('/new-replies', ensureAuth, (req, res, next) => {
        Comment
            .findAllUnreadPostAndCommentReplies(req.user.id)
            .then(replies => res.send(replies))
            .catch(next)
    })

    .get('/:id', (req, res, next) => {
        Comment
            .findById(req.params.id)
            .then(comment => res.send(comment))
            .catch(next)
    })

    .put('/:id', ensureAuth, (req, res, next) => {
        Comment
            .updateById(req.params.id, { ...req.body, userId: req.user.id })
            .then(updatedComment => res.send(updatedComment))
            .catch(next)
    })

    .delete('/:id', ensureAuth, (req, res, next) => {
        Comment
            .deleteById(req.params.id, req.user.id)
            .then(comment => res.send(comment))
            .catch(next)
    })