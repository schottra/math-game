"use strict";

var q = require('q'),
    randomstring = require('randomstring');

module.exports = function(){
    var games = {};
    var repo = {};

    //TODO: repo should generate game id
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