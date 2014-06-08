"use strict";

module.exports = function(io, app){
    var game = io.of('/game');

    game.on('connection', function(socket){
        socket.on('joinGame', function(joinData){
            console.log('client joined game', joinData.userName, joinData.gameId);
            //TODO: send a response when successfully added?
            app.gameRepository.addUserToGame({
                gameId: joinData.gameId,
                userId: socket.id,
                userName: joinData.userName
            });
        });
    });

};