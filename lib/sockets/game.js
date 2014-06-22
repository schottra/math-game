"use strict";

var q = require('q');

module.exports = function(io, app){
    var game = io.of('/game');

    game.on('connection', function(socket){
        socket.emit('userId assigned', socket.id);
        socket.on('joinGame', function(joinData, responseFn){
            socket.join(joinData.gameId);
            var userInfo =  {
                id: socket.id,
                name: joinData.userName
            };

            return app.gameRepository.addUserToGame(joinData.gameId,userInfo)
            .then(function(gameData){
                if( responseFn != null ){
                    responseFn(gameData.clientVisibleData);
                }
                game.in(joinData.gameId).emit('userJoined', userInfo );
            })
            .catch( function(){
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