const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

jest.mock('../lib/middleware/ensureAuth.js', () => (req, res, next) => {
    req.user = {
        id: '2',
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
    beforeEach(async () => {
        user = await User.insertPostrUser({
            email: 'Jake@jake.com',
            passwordHash: 'hkjlhkjh',
            displayName: 'Jake'
        })
    })

    it('it can get a user by id with GET', () => {
        request(app)
            .get(`/api/v1/users/${user.id}`)
            .then(res => {
                expect(res.body).toEqual({
                    id: '2',
                    email: 'jake@jake.com',
                    displayName: 'Jake',
                    aboutMe: null,
                    passwordHash: 'hkjlhkjh',
                    userImageUrl: null
                })
            })
    })

    it('it can update a user by id with PUT', () => {
        return request(app)
            .put(`/api/v1/users/${user.id}`)
            .send({
                displayName: 'Jack Pendersmash',
                userImageUrl: 'my new image oh yeahhhh',
                aboutMe: 'this is allllll about me'
            })
            .then(res => {
                expect(res.body).toEqual({
                    id: '2',
                    email: 'jake@jake.com',
                    displayName: 'Jack Pendersmash',
                    userImageUrl: 'my new image oh yeahhhh',
                    aboutMe: 'this is allllll about me',
                    passwordHash: "hkjlhkjh"
                })
            })
    })

    it('it can delete a user by id with DELETE', () => {
        return request(app)
            .delete(`/api/v1/users/${user.id}`)
            .then(res => {
                expect(res.body).toEqual({
                    id: '2',
                    email: 'jake@jake.com',
                    displayName: 'Jake',
                    aboutMe: null,
                    passwordHash: 'hkjlhkjh',
                    userImageUrl: null
                })
            })
    })
});
