"use strict";

var should = require('should'),
    sinon = require('sinon'),
    q = require('q'),
    gameRepository = _setup.getRepository('gameRepository');

describe('Game Repository', function(){
    var repo = {};

    beforeEach(function(){
        repo = gameRepository();
    });


    it('should reject if adding user to game that does not exist', function(){
        return repo.addUserToGame({gameId: 'invalid', userName: 'user1'}).should.reject()
    });

    it('should resolve if adding user to game that exists', function(){
        return repo.createGame({id: 'validId'})
        .then(function(){
            repo.addUserToGame({gameId: 'validId', userName: 'user1'});
        }).should.resolve()
    });

    it('should allow retrieving a game record by id', function(){
        var game = {id: 'validId'};
        return repo.createGame(game)
        .then(function() {
            return repo.getGame('validId');
        })
        .then(function(returnedGame){
            returnedGame.should.eql(game);
        });
    });

    it('should reject when retrieving non-existent game', function(){
        return repo.getGame('invalidId').should.reject()
    });

//    it('should correctly add new users to game record', function () {
//
//    });
//
//    it('should not allow a user with the same id to be added twice', function () {
//
//    });
});