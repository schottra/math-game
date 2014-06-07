'use strict';

var randomstring = require('randomstring');

module.exports = function(app){

    var endpoints = {};

    endpoints.createGame = function(req, res){
        var newGameData = {
          id: randomstring.generate(6)
        };
        app.gameRepository.createGame(newGameData)
            .then(function(){
                res.json(newGameData);
            });
    };

    return endpoints;
};
