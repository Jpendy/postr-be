const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const Post = require('../lib/models/Post');
const User = require('../lib/models/User');
const Board = require('../lib/models/Board');
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

    it('it creates a new post with POST', () => {
        return request(app)
            .post('/api/v1/posts')
            .send({
                title: 'second post',
                imageUrl: 'placeholderImageUrl',
                body: 'this is my second posts body',
                userId: user.id,
                boardId: board.id
            })
            .then(res => {
                expect(res.body).toEqual({
                    id: '2',
                    dateCreated: expect.any(String),
                    dateModified: null,
                    title: 'second post',
                    imageUrl: 'placeholderImageUrl',
                    body: 'this is my second posts body',
                    voteScore: '0',
                    userId: user.id,
                    boardId: board.id
                })
            })
    })

    it('it gets all posts with GET', () => {
        return request(app)
            .get('/api/v1/posts')
            .then(res => {
                expect(res.body).toEqual([{
                    id: '1',
                    dateCreated: expect.any(String),
                    dateModified: null,
                    title: 'first post',
                    imageUrl: 'placeholderImageUrl',
                    body: 'this is my first posts body',
                    voteScore: '0',
                    commentCount: '1',
                    userId: user.id,
                    boardId: board.id
                }])
            })
    })

    it('it gets a post by id with GET', () => {
        return request(app)
            .get(`/api/v1/posts/${post.id}`)
            .then(res => {
                expect(res.body).toEqual({
                    id: "1",
                    boardId: "1",
                    body: "this is my first posts body",
                    commentCount: "1",
                    voteScore: '0',
                    dateCreated: expect.any(String),
                    dateModified: null,
                    imageUrl: "placeholderImageUrl",
                    title: "first post",
                    userId: "1",
                    comments: [
                        {
                            body: "first comment body",
                            dateCreated: expect.any(String),
                            dateModified: null,
                            id: 1,
                            parentCommentId: null,
                            postId: 1,
                            replies: null,
                            userId: 1,
                            voteScore: 0,
                        },
                    ]
                })
            })
    })

    it('it updates a post by id with PUT', () => {
        return request(app)
            .put(`/api/v1/posts/${post.id}`)
            .send({
                title: 'updated post',
                imageUrl: 'placeholderImageUrl',
                body: 'this is my updated posts body',
            })
            .then(res => {
                expect(res.body).toEqual({
                    id: '1',
                    dateCreated: expect.any(String),
                    dateModified: expect.any(String),
                    title: 'updated post',
                    imageUrl: 'placeholderImageUrl',
                    body: 'this is my updated posts body',
                    voteScore: '0',
                    userId: user.id,
                    boardId: board.id
                })
            })
    })

    it('it deletes a post by id with DELETE', () => {
        return request(app)
            .delete(`/api/v1/posts/${post.id}`)
            .then(res => {
                expect(res.body).toEqual(post)
            })
    })

    it('it can post a new vote on a post and insert new vote to post vote history', () => {
        return request(app)
            .post(`/api/v1/posts/vote/${post.id}`)
            .send({
                voteHistory: null,
                vote: 1,
            })
            .then(res => {
                expect(res.body).toEqual({
                    post: {
                        id: "1",
                        boardId: "1",
                        body: "this is my first posts body",
                        voteScore: '1',
                        dateCreated: expect.any(String),
                        dateModified: null,
                        imageUrl: "placeholderImageUrl",
                        title: "first post",
                        userId: "1",
                    },
                    voteHistory: {
                        id: '1',
                        postId: '1',
                        userId: '1',
                        vote: 1
                    }
                })
            })
    })

    it('it can update a vote history and a posts vote score accordingly', async () => {
        await request(app).post(`/api/v1/posts/vote/${post.id}`).send({
            voteHistory: null,
            vote: -1,
        })

        return request(app)
            .post(`/api/v1/posts/vote/${post.id}`)
            .send({
                voteHistory: -1,
                vote: 1,
            })
            .then(res => {
                expect(res.body).toEqual({
                    post: {
                        id: "1",
                        boardId: "1",
                        body: "this is my first posts body",
                        voteScore: '1',
                        dateCreated: expect.any(String),
                        dateModified: null,
                        imageUrl: "placeholderImageUrl",
                        title: "first post",
                        userId: "1",
                    },
                    voteHistory: {
                        id: '1',
                        postId: '1',
                        userId: '1',
                        vote: 1
                    }
                })
            })
    })
});
