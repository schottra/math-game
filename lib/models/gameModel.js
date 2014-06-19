"use strict";

var questionGenerator = require('../util/questionGenerator');

module.exports = function(id){
    var game = {};
    game.id = id;
    game.questions = [];
    game.currentQuestion = questionGenerator.newQuestion(2);
    game.players = [];

    game.clientVisibleData = {
        id: game.id,
        questions: game.questions,
        currentQuestion: game.currentQuestion.text,
        players: game.players
    };

    return game;
};