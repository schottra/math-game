"use strict";

var q = require('q');

var games = {};
var repo = {};

module.exports = function(app){
    repo.createGame = function(gameData){
        var game = (games[gameData.id] = gameData);
        game.players = game.players || {};
        return q();
    };

    repo.addUserToGame = function(data){
        var game = games[data.gameId];
        if( game == null ){
            return q.reject('Game does not exist');
        }

        game.players[data.userId] = {
            name: data.userName
        };

        return q();
    };



    return repo;
};