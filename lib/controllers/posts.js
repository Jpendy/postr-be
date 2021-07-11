const { Router } = require('express')
const ensureAuth = require('../middleware/ensureAuth')
const Post = require('../models/Post')
const PostsVoteHistory = require('../models/PostsVoteHistory')
const CloudinaryService = require('../services/CloudinaryService')

module.exports = Router()
    .post('/', ensureAuth, (req, res, next) => {
        if (req.body.imageData) {
            CloudinaryService
                .createPost({ ...req.body, userId: req.user.id })
                .then(post => {
                    console.log(post)
                    res.send(post)
                })
                .catch(next)
        }
        else Post
            .insert({ ...req.body, userId: req.user.id })
            .then(post => res.send(post))
            .catch(next)
    })

    .post('/vote/:id', ensureAuth, (req, res, next) => {
        const { voteHistory, vote } = req.body;

        if (voteHistory === undefined || voteHistory === null) {
            PostsVoteHistory
                .newVote(vote, req.params.id, req.user.id)
                .then(response => res.send(response))
                .catch(next)
        }
        else {
            PostsVoteHistory
                .updateVote(voteHistory, vote, req.params.id, req.user.id)
                .then(response => res.send(response))
                .catch(next)
        }
    })

    .get('/', (req, res, next) => {
        const sort = req.query.sort;
        const page = req.query.page;
        Post
            .find(page, sort)
            .then(posts => res.send(posts))
            .catch(next)
    })

    .get('/unread-post-replies', ensureAuth, (req, res, next) => {
        Post
            .findUnreadPostReplies(req.user.id)
            .then(posts => res.send(posts))
            .catch(next)
    })

    .get('/:id', (req, res, next) => {
        Post
            .findById(req.params.id)
            .then(post => res.send(post))
            .catch(next)
    })

    .put('/:id', ensureAuth, (req, res, next) => {
        Post
            .updateById(req.params.id, { ...req.body, userId: req.user.id })
            .then(updatedPost => res.send(updatedPost))
            .catch(next)
    })

    .delete('/:id', ensureAuth, (req, res, next) => {
        Post
            .deleteById(req.params.id, { userId: req.user.id })
            .then(post => {
                CloudinaryService.deleteFromCloud(post.cloudinaryImagePublicId)
                res.send(post)
            })
            .catch(next)
    })