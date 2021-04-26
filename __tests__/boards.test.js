const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');
const Board = require('../lib/models/Board');

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
    beforeEach(async () => {
        user = await User.insert({
            username: 'Jake',
            userImageUrl: 'http://placekitten.com/200/300'
        })

        board = await Board.insert({
            name: 'first board',
            userId: user.id,
        })
    })

    it('it can create a new board with POST', () => {
        const board2 = {
            name: 'second board',
            userId: user.id,
        }

        return request(app)
            .post('/api/v1/boards')
            .send(board2)
            .then(res => {
                expect(res.body).toEqual({
                    id: '2',
                    dateCreated: expect.any(String),
                    ...board2
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
                    userId: board.id,
                    dateCreated: expect.any(String),
                }])
            })

    })

    it('it can get a board by id with GET', () => {
        return request(app)
            .get(`/api/v1/boards/${board.id}`)
            .then(res => {
                expect(res.body).toEqual({
                    id: '1',
                    name: 'first board',
                    userId: board.id,
                    dateCreated: expect.any(String),
                })
            })
    })

    it('it can update a boards name by id with PUT', () => {
        return request(app)
            .put(`/api/v1/boards/${board.id}`)
            .send({ name: 'new name' })
            .then(res => {
                expect(res.body).toEqual({
                    ...board,
                    name: 'new name'
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
