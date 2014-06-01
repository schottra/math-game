'use strict';

var should = require('should'),
    app = require('../../../server'),
    request = require('supertest');

describe('POST /api/game', function() {

    it('should respond with JSON object', function(done) {
        request(app)
            .post('/api/game')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.be.an.Object;
                done();
            });
    });

    it('should return an object containing an id as a string', function(done) {
        request(app)
            .post('/api/game')
            .end(function(err,res) {
               res.body.should.have.property('id').type('string');
                done();
            });

    });
});