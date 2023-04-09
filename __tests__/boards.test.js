const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');
const Board = require('../lib/models/Board');

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
    })

    it('it can create a new board with POST', () => {
        return request(app)
            .post('/api/v1/boards')
            .send({
                name: 'second board',
                userId: user.id,
                bgColor: '#FFFFFF',
                fontColor: null,
                id: "2",
                linkColor: null,
                name: "second board",
                postColor: '#EEE4E1',
            })
            .then(res => {
                expect(res.body).toEqual({
                    bannerImageUrl: null,
                    bgColor: '#FFFFFF',
                    fontColor: null,
                    id: "2",
                    linkColor: null,
                    name: "second board",
                    postColor: '#EEE4E1',
                    userId: "1",
                    dateCreated: expect.any(String),
                })
            })
    })

    it('it gets all boards with GET', () => {
        return request(app)
            .get('/api/v1/boards')
            .then(res => {
                expect(res.body).toEqual([{
                    id: '1',
                    name: 'first board',
                    bannerImageUrl: null,
                    bgColor: '#FFFFFF',
                    fontColor: null,
                    linkColor: null,
                    postColor: '#EEE4E1',
                    postCount: "0",
                    userId: board.id,
                    dateCreated: expect.any(String),
                }])
            })

    })

    it('it can get a board by name with GET', () => {
        return request(app)
            .get(`/api/v1/boards/${board.name}`)
            .then(res => {
                expect(res.body).toEqual({
                    id: '1',
                    name: 'first board',
                    createdBy: 'Jake',
                    bannerImageUrl: null,
                    bgColor: '#FFFFFF',
                    fontColor: null,
                    linkColor: null,
                    postColor: '#EEE4E1',
                    postCount: "0",
                    posts: [],
                    userId: board.id,
                    dateCreated: expect.any(String),
                })
            })
    })

    it('it can update a board by id with PUT', () => {
        return request(app)
            .put(`/api/v1/boards/${board.id}`)
            .send({
                bannerImageUrl: null,
                bgColor: '#FFFFFF',
                fontColor: null,
                id: "1",
                linkColor: null,
                name: "new board name",
                postColor: '#EEE4E1',
                userId: "1",
            })
            .then(res => {
                expect(res.body).toEqual({
                    ...board,
                    bannerImageUrl: null,
                    bgColor: '#FFFFFF',
                    fontColor: null,
                    id: "1",
                    linkColor: null,
                    name: "new board name",
                    postColor: '#EEE4E1',
                    userId: "1",
                })
            })
    })

    it('it can delete a board by id using DELETE', () => {
        return request(app)
            .delete(`/api/v1/boards/${board.id}`)
            .then(res => {
                expect(res.body).toEqual(board)
            })
    })
});
