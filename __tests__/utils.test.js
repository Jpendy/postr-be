const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const { commentsMunge } = require('../lib/utils/munge');

describe('postr-be munging functions', () => {

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

        const result = commentsMunge(comment)
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
