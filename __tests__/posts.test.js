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
        email: 'jake@jake.com',
        displayName: 'Jake',
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
        user = await User.insertPostrUser({
            email: 'Jake@jake.com',
            passwordHash: 'hkjlhkjh',
            displayName: 'Jake'
        })

        board = await Board.insert({
            name: 'first board',
            bgColor: '#FFFFFF',
            fontColor: null,
            id: "2",
            linkColor: null,
            postColor: '#EEE4E1',
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
                    board: "first board",
                    boardId: "1",
                    body: "this is my second posts body",
                    cloudinaryImagePublicId: null,
                    commentCount: "0",
                    createdBy: "Jake",
                    dateCreated: expect.any(String),
                    dateModified: null,
                    id: "2",
                    imageUrl: "placeholderImageUrl",
                    imageUrl: null,
                    title: "second post",
                    userId: "1",
                    voteScore: "0",
                    userId: user.id,
                    boardId: board.id
                })
            })
    })

    it('it gets all posts with GET', () => {
        return request(app)
            .get('/api/v1/posts')
            .then(res => {
                expect(res.body).toEqual({
                    count: "1", page: 1, postArray: [{
                        board: "first board",
                        boardId: "1",
                        body: "this is my first posts body",
                        cloudinaryImagePublicId: null,
                        commentCount: "1",
                        createdBy: "Jake",
                        dateCreated: expect.any(String),
                        dateModified: null,
                        id: "1",
                        imageUrl: null,
                        title: "first post",
                        userId: "1",
                        voteScore: "0"
                    }]
                })
            })
    })

    it('it gets a post by id with GET', () => {
        return request(app)
            .get(`/api/v1/posts/${post.id}`)
            .then(res => {
                expect(res.body).toEqual({
                    id: '1',
                    title: 'first post',
                    imageUrl: null,
                    cloudinaryImagePublicId: null,
                    body: 'this is my first posts body',
                    voteScore: '0',
                    dateCreated: expect.any(String),
                    dateModified: null,
                    userId: '1',
                    boardId: '1',
                    createdBy: 'Jake',
                    board: 'first board',
                    commentCount: '1',
                    comments: [
                        {
                            id: 1,
                            body: 'first comment body',
                            voteScore: 0,
                            dateCreated: expect.any(String),
                            dateModified: null,
                            parentCommentId: null,
                            parentPostId: null,
                            createdBy: 'Jake',
                            userId: 1,
                            postId: 1,
                            replies: null
                        }
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
                    cloudinaryImagePublicId: null,
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
                expect(res.body).toEqual({
                    boardId: "1",
                    body: "this is my first posts body",
                    cloudinaryImagePublicId: null,
                    dateCreated: expect.any(String),
                    dateModified: null,
                    id: "1",
                    imageUrl: null,
                    userId: "1",
                    voteScore: "0",
                    title: "first post",
                })
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
                        imageUrl: null,
                        cloudinaryImagePublicId: null,
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
                        imageUrl: null,
                        cloudinaryImagePublicId: null,
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
