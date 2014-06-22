'use strict';

var should = require('chai').should(),
    app = _setup.requireServer(),
    sinon = require('sinon'),
    q = require('q'),
    request = require('supertest');

describe('POST /api/game', function() {
    var sandbox;
    var returnedGame = {};

    beforeEach(function(){
        sandbox = sinon.sandbox.create();
        returnedGame = {
            clientVisibleData: {
                id: 'validGameId'
            }
        };
    });

    afterEach(function(){
        sandbox.restore();
    });

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
        var stub = sandbox.stub(app.gameRepository, 'createGame');
        stub.returns(q(returnedGame));
        request(app)
            .post('/api/game')
            .end(function(err,res) {
               res.body.should.have.property('id').eql('validGameId');
                done();
            });

    });

    it('should only expose client-visible properties when returning the created game', function(done) {
        var stub = sandbox.stub(app.gameRepository, 'createGame');
        stub.returns(q(returnedGame));
        request(app)
        .post('/api/game')
        .end(function(err,res) {
            res.body.should.deep.equal(returnedGame.clientVisibleData);
            done();
        });

    });

    it('should insert a game into the data store', function(done) {
        var spy = sandbox.spy(app.gameRepository, 'createGame');
        request(app)
            .post('/api/game')
            .end(function() {
                spy.should.have.been.called;
                done();
            });

    });
});