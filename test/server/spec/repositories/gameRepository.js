"use strict";

var should = require('chai').should(),
    sinon = require('sinon'),
    q = require('q'),
    _ = require('lodash'),
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

    it('should generate a unique id when creating a game', function() {
        //todo
    });

    it('should reject if adding user to game that does not exist', function(){
        return repo.addUserToGame({gameId: 'invalid', userId: 'validId1', userInfo:{}}).should.be.rejected;
    });

    describe('with game', function(){
        var gameId = null;
        beforeEach(function () {
            return repo.createGame().then(function(createdGame){gameId = createdGame.id;});
        });

        var getGame = function() {
            return repo.getGame(gameId);
        };

        var getUser = function(game){
            return _.find(game.players, {id: userId});
        };

        var userId = 'validId1';
        var userInfo = {id: userId, name: 'user1'};
        var addUser = function(){
            return repo.addUserToGame(gameId, userInfo);
        };

        it('should allow retrieving a game record by id', function(){
            return getGame()
            .then(function(returnedGame){
                returnedGame.should.not.be.undefined;
            });
        });

        it('should reject when retrieving non-existent game', function(){
            return repo.getGame('invalidId').should.be.rejected;
        });

        it('should resolve if adding user to game that exists', function(){
            return addUser();
        });

        it('should correctly add new users to game record', function () {
            return addUser()
            .then(getGame)
            .then(getUser)
            .then(function(user){
                user.should.exist;
            });
        });

        it('should not allow a user with the same id to be added twice', function () {
            return addUser()
            .then(function(){
                return addUser().should.be.rejected;
            })
        });

        it('should set player state to active when they join a game', function() {
            return addUser()
            .then(getGame)
            .then(getUser)
            .then(function(user){
                user.active.should.be.true;
            });
        });

        it('should set player state to inactive when they leave a game', function () {
            return addUser()
            .then(function(){
                repo.removeUserFromGame(gameId, userId)
                .then(getGame)
                .then(getUser)
                .then(function(user){
                    user.active.should.be.false;
                });
            })
        });

    });

});