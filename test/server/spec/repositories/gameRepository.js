"use strict";

var should = require('chai').should(),
    sinon = require('sinon'),
    q = require('q'),
    gameRepository = _setup.requireRepository('gameRepository');

describe('Game Repository', function(){
    var repo = {};

    beforeEach(function(){
        repo = gameRepository();
    });

    it('should generate an id when creating a game', function () {
        repo.createGame().then( function(game){
            game.should.have.property('id').type('string');
        });
    });

    it('should reject if adding user to game that does not exist', function(){
        return repo.addUserToGame({gameId: 'invalid', userName: 'user1'}).should.be.rejected;
    });

    describe('with game', function(){
        var game = {};
        beforeEach(function () {
            return repo.createGame().then(function(createdGame){game = createdGame;});
        });
        afterEach(function(){
           game = {}
        });

        it('should resolve if adding user to game that exists', function(){
            return repo.addUserToGame({gameId: game.id, userName: 'user1'});
        });

        it('should allow retrieving a game record by id', function(){
            return repo.getGame(game.id)
            .then(function(returnedGame){
                returnedGame.should.eql(game);
            });
        });

        it('should reject when retrieving non-existent game', function(){
            return repo.getGame('invalidId').should.be.rejected;
        });

        it('should correctly add new users to game record', function () {
            return repo.addUserToGame({gameId: game.id, userId: 'validId1', userName: 'user1'})
            .then(function(){
                repo.getGame(game.id).then(function(retrieved){
                    retrieved.players.should.containEql({'validId1': {name: 'user1'}});
                });
            });
        });

        it('should not allow a user with the same id to be added twice', function () {
            return repo.addUserToGame({gameId: game.id, userId: 'validId1', userName: 'user1'})
            .then(function(){
                return repo.addUserToGame({gameId: game.id, userId: 'validId1', userName: 'user2'}).should.be.rejected;
            })
        });

    });

});