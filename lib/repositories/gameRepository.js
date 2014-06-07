"use strict";

var q = require('q');

module.exports = function(){
    var games = {};
    var repo = {};

    //TODO: repo should generate game id
    repo.createGame = function(gameData){
        var game = (games[gameData.id] = gameData);
        game.players = game.players || {};
        return q();
    };

    repo.addUserToGame = function(data){
        return this.getGame(data.gameId)
        .then(function(game){
            game.players[data.userId] = {
                name: data.userName
            };
        });
    };

    repo.getGame = function(gameId){
        var game = games[gameId];
        return (game != null) ? q(game) : q.reject('Game does not exist');
    };

    return repo;
};