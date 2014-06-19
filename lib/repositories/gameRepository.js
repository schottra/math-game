"use strict";

var q = require('q'),
    _ = require('lodash'),
    randomstring = require('randomstring'),
    gameModel = require('../models/gameModel');

module.exports = function(){
    var games = {};
    var repo = {};

    repo.createGame = function(){
        var game = gameModel(randomstring.generate(6));
        games[game.id] = game;
        return q(game);
    };

    repo.addUserToGame = function(gameId, userInfo){
        return this.getGame(gameId)
        .then(function(game){
            if(_.some(game.players, {id: userInfo.id})){
                return q.reject('This player has already been added to the game');
            }

            userInfo.active = true;
            game.players.push(userInfo);
            return game;
        });
    };

    repo.removeUserFromGame = function(gameId, userId){
        return this.getGame(gameId)
        .then(function(game){
            var player = _.find(game.players, {id: userId});
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