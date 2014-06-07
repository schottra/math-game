"use strict";

var should = require('should'),
    sinon = require('sinon'),
    q = require('q'),
    gameRepository = _setup.getRepository('gameRepository');

describe('Game Repository', function(){
    var app = {};
    var repo = {};

    beforeEach(function(){
        app = {};
        repo = gameRepository(app);
    });


    it('should reject if adding user to game that does not exist', function(){
        repo.addUserToGame({gameId: 'invalid', userName: 'user1'}).isRejected().should.be.true;
    });

    it('should resolve is adding user to game that exists', function(){
        repo.createGame({gameId: 'validId'});
        repo.addUserToGame({gameId: 'validId', userName: 'user1'}).isResolved().should.be.true;
    });

//    it('should correctly add new users to game record', function () {
//
//    });
//
//    it('should not allow a user with the same id to be added twice', function () {
//
//    });
});