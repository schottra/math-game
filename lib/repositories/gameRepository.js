"use strict";

var q = require('q'),
    randomstring = require('randomstring');

module.exports = function(){
    var games = {};
    var repo = {};

    repo.createGame = function(gameData){
        gameData = gameData || {};
        gameData.id = randomstring.generate(6);
        var game = (games[gameData.id] = gameData);
        game.players = game.players || {};
        return q(game);
    };

    repo.addUserToGame = function(data){
        return this.getGame(data.gameId)
        .then(function(game){
            if(game.players[data.userId] != null){
                return q.reject('This player has already been added to the game');
            }

            data.userInfo.active = true;
            game.players[data.userId] = data.userInfo;
            return game;
        });
    };

    repo.removeUserFromGame = function(gameId, userId){
        return this.getGame(gameId)
        .then(function(game){
            var player = game.players[userId];
            if( player == null ) {
                return q.reject("User is not in the specified game");
            }

            player.active = false;
            return game;
        });
    };

    repo.getGame = function(gameId){
        var game = games[gameId];
        return (game != null) ? q(game) : q.reject('Game does not exist');
    };

    return repo;
};