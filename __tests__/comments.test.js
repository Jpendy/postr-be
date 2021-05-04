const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');
const Board = require('../lib/models/Board');
const Post = require('../lib/models/Post');
const Comment = require('../lib/models/Comment');

jest.mock('../lib/middleware/ensureAuth.js', () => (req, res, next) => {
    req.user = {
        id: '1',
        username: 'Jake',
        userImageUrl: 'http://placekitten.com/200/300'
    }
    next()
})

describe('postr-be routes', () => {
    beforeEach(() => {
        return setup(pool);
    });

    let user;
    let board;
    let post;
    let comment;
    beforeEach(async () => {
        user = await User.insert({
            googleId: '105191630947115329019',
            username: 'Jake',
            userImageUrl: 'http://placekitten.com/200/300'
        })

        board = await Board.insert({
            name: 'first board',
            userId: user.id,
        })

        post = await Post.insert({
            title: 'first post',
            imageUrl: 'placeholderImageUrl',
            body: 'this is my first posts body',
            userId: user.id,
            boardId: board.id
        })

        comment = await Comment.insert({
            body: 'first comment body',
            parentCommentId: null,
            userId: user.id,
            postId: post.id
        })
    })

    afterEach(async () => {
        await setup(pool)

        user = await User.insert({
            googleId: '105191630947115329019',
            username: 'Jake',
            userImageUrl: 'http://placekitten.com/200/300'
        })

        board = await Board.insert({
            name: 'first board',
            userId: user.id,
        })

        post = await Post.insert({
            title: 'first post',
            imageUrl: 'placeholderImageUrl',
            body: 'this is my first posts body',
            userId: user.id,
            boardId: board.id
        })

        comment = await Comment.insert({
            body: 'first comment body',
            parentCommentId: null,
            userId: user.id,
            postId: post.id
        })

        await Comment.insert({
            body: 'independant comment body',
            parentCommentId: null,
            userId: user.id,
            postId: post.id
        })

        const second = await Comment.insert({
            body: 'second comment body',
            parentCommentId: comment.id,
            userId: user.id,
            postId: null
        })

        await Comment.insert({
            body: 'most inner comment body',
            parentCommentId: second.id,
            userId: user.id,
            postId: null
        })

        await Comment.insert({
            body: 'third comment body',
            parentCommentId: comment.id,
            userId: user.id,
            postId: null
        })

    })

    it('it posts a new comment with POST', () => {
        return request(app)
            .post('/api/v1/comments')
            .send({
                body: 'second comment body',
                parentCommentId: null,
                userId: user.id,
                postId: post.id
            })
            .then(res => {
                expect(res.body).toEqual({
                    id: '2',
                    body: 'second comment body',
                    voteScore: '0',
                    parentCommentId: null,
                    dateCreated: expect.any(String),
                    dateModified: null,
                    userId: user.id,
                    postId: post.id
                })
            })
    })

    it('it gets a comment by id with GET', () => {
        return request(app)
            .get(`/api/v1/comments/${comment.id}`)
            .then(res => {
                expect(res.body).toEqual({
                    body: "first comment body",
                    dateCreated: expect.any(String),
                    dateModified: null,
                    id: 1,
                    parentCommentId: null,
                    postId: 1,
                    userId: 1,
                    voteScore: 0,
                    replies: null,
                })
            })
    })

    it('it updates a comment by id with PUT', () => {
        return request(app)
            .put(`/api/v1/comments/${comment.id}`)
            .send({
                ...comment,
                body: 'my updated body',
            })
            .then(res => {
                expect(res.body).toEqual({
                    ...comment,
                    body: 'my updated body',
                    dateModified: expect.any(String)
                })
            })
    })

    it('it can delete a comment with DELETE', () => {
        return request(app)
            .delete(`/api/v1/comments/${comment.id}`)
            .then(res => {
                expect(res.body).toEqual(comment)
            })
    })

    it('it munges comments recursively', () => {
        const comment = {
            id: '2',
            body: 'second comment body',
            vote_score: '0',
            parent_comment_id: null,
            date_created: 'expect.any(String)',
            date_modified: null,
            user_id: 1,
            post_id: 1,
            replies: [{
                id: '3',
                body: 'second comment body',
                vote_score: '0',
                parent_comment_id: '2',
                date_created: 'expect.any(String)',
                date_modified: null,
                user_id: 1,
                post_id: null,
                replies: [{
                    id: '4',
                    body: 'second comment body',
                    vote_score: '0',
                    parent_comment_id: '3',
                    date_created: 'expect.any(String)',
                    date_modified: null,
                    user_id: 1,
                    post_id: null,
                    replies: null
                }]
            }]
        }

        const result = Comment.commentsMunge(comment)
        expect(result).toEqual({
            id: '2',
            body: 'second comment body',
            voteScore: '0',
            parentCommentId: null,
            dateCreated: expect.any(String),
            dateModified: null,
            userId: 1,
            postId: 1,
            replies: [{
                id: '3',
                body: 'second comment body',
                voteScore: '0',
                parentCommentId: '2',
                dateCreated: expect.any(String),
                dateModified: null,
                userId: 1,
                postId: null,
                replies: [{
                    id: '4',
                    body: 'second comment body',
                    voteScore: '0',
                    parentCommentId: '3',
                    dateCreated: expect.any(String),
                    dateModified: null,
                    userId: 1,
                    postId: null,
                    replies: null
                }]
            }]
        })
    })
});