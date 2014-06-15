"use strict";

var q = require('q');

module.exports = function(io, app){
    var game = io.of('/game');

    game.on('connection', function(socket){

        socket.on('joinGame', function(joinData, responseFn){
            socket.join(joinData.gameId);
            var userInfo =  {
                name: joinData.userName
            };
            return app.gameRepository.addUserToGame({
                gameId: joinData.gameId,
                userId: socket.id,
                userInfo: userInfo
            }).then(function(){return app.gameRepository.getGame(joinData.gameId);})
            .then(function(gameData){
                if( responseFn != null ){
                    responseFn(gameData);
                }
                game.in(joinData.gameId).emit('userJoined', {
                    id: socket.id,
                    userInfo: userInfo
                });
            }, function(){
                responseFn(new Error('Failed to join game'));
            });
        });

        socket.on('disconnect', function(){
            socket.rooms.forEach(function(gameId){
                game.in(gameId).emit('userLeft', socket.id);
                app.gameRepository.removeUserFromGame(gameId, socket.id);
            });
        });
    });

};