'use strict';

module.exports = function(app){

    var endpoints = {};

    endpoints.createGame = function(req, res){
        app.gameRepository.createGame()
            .then(function(returnedGame){
                res.json(returnedGame.getClientVisibleData());
            });
    };

    return endpoints;
};
