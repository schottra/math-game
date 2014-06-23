"use strict";

var questionGenerator = require('../util/questionGenerator'),
    _ = require('lodash');

//TODO: Tests
module.exports = function(id){
    var game = {};

    game.id = id;
    game.questions = [];
    game.currentQuestion = {};
    game.players = [];

    game.newQuestion = function(){
        this.currentQuestion = questionGenerator.newQuestion(2);
    };

    game.getClientVisibleData = function(){
        var data = _.cloneDeep(this);
        if(! data.currentQuestion.hasBeenAnswered){
            data.currentQuestion.answer = null;
        }
        return data;
    };

    game.newQuestion();

    return game;
};