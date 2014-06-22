"use strict";

var q = require('q'),
    _ = require('lodash'),
    randomstring = require('randomstring'),
    gameModel = require('../models/gameModel');

module.exports = function(){
    var games = {};
    var repo = {};

    repo.createGame = function(){
        var id = randomstring.generate(6);
        while( games[id] != null ) id = randomstring.generate(6);
        var game = gameModel(id);
        games[id] = game;
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

    //TODO: Function to add a new question to a game

    //TODO: Questions need to have ids instead of answering whatever the current one is
    repo.answerCurrentQuestion = function (gameId, userId, answer) {
        answer = parseInt(answer, 10);
        var result = {correct: false};
        return this.getGame(gameId)
        .then(function (game) {
            if(game.currentQuestion.hasBeenAnswered){
                return q.reject('question has already been answered correctly');
            }
            if( answer === game.currentQuestion.answer ){
                game.currentQuestion.hasBeenAnswered = true;
                game.currentQuestion.winner = userId;
                game.questions.push(game.currentQuestion);
                result.correct = true;
                result.updatedQuestion = game.currentQuestion;
            }
        })
        .then(function(){return result;});
    };

    return repo;
};