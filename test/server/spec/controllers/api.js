'use strict';

var should = require('should'),
    app = _setup.server(),
    sinon = require('sinon'),
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

    it('should insert a game into the data store', function(done) {
        var spy = sinon.spy(app.gameRepository, 'createGame');
        request(app)
            .post('/api/game')
            .end(function() {
                spy.calledWith(sinon.match.has('id', sinon.match.string)).should.be.ok;
                done();
            });

    });

//    it('should pass required values when adding a user to a game', function(){
//
//    });
});