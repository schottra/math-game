"use strict";

var _ = require('lodash');

var getRandomNumbers = function(count, min, max){
    return _.times(count, function(){return _.random(min,max);});
};

var add = { text: '+', op: function(a,b){ return a+b;}};
var subtract = {text: '-', op: function(a,b){return a-b;}};
//var multiply = {text: 'x', op: function(a,b){return a*b;}};

var operators = [add, subtract];


var getOperations = function(count){
    return getRandomNumbers(count, 0, operators.length-1)
    .map(function(opIdx){return operators[opIdx];});
};

exports.newQuestion = function(operandCount){
    operandCount = operandCount || 2;
    var operands = getRandomNumbers(operandCount, 1, 10);
    var operations = getOperations(operandCount -1);

    //TODO: generate a postfix expression or AST and then parse it into infix to allow for
    //      more robust equations with operators that need precedence
    var result = operands[0];
    var text = "" + operands[0];
    for( var i = 1, j = 0; j < operations.length; i++, j++){
        var operation = operations[j];
        var operand = operands[i];
        result = operation.op(result, operand);
        text += " " + operation.text + " " + operand;
    }

    return {
        text: text,
        answer: result,
        hasBeenAnswered: false,
        winner: ''
    };
};