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
    console.log('MOOOOOOCK MOCK')
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
                    id: '1',
                    body: 'first comment body',
                    voteScore: '0',
                    dateCreated: expect.any(String),
                    dateModified: null,
                    parentCommentId: null,
                    userId: user.id,
                    postId: post.id
                })
            })
    })
});