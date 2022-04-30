const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

describe('postr-be routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('test', () => {
    expect(true).toEqual(true)
  })


});
