"use strict";

var questionGenerator = require('../util/questionGenerator');

module.exports = function(id){
    var game = {};

    var updateVisibleData = function(){
        game.clientVisibleData = {
            id: game.id,
            questions: game.questions,
            currentQuestion: {
                text: game.currentQuestion.text,
                hasBeenAnswered: game.currentQuestion.hasBeenAnswered
            },
            players: game.players
        };
    };

    game.id = id;
    game.questions = [];
    game.currentQuestion = {};
    game.players = [];

    game.newQuestion = function(){
        this.currentQuestion = questionGenerator.newQuestion(2);
        updateVisibleData();
    };

    game.newQuestion();

    return game;
};