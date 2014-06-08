"use strict";

module.exports = function(io, app){
    var game = io.of('/game');

    game.on('connection', function(socket){
        socket.on('joinGame', function(joinData){
            return app.gameRepository.addUserToGame({
                gameId: joinData.gameId,
                userId: socket.id,
                userName: joinData.userName
            }).then(function(){
                socket.emit('joinGame success');
                game.in(joinData.gameId).emit('userJoined', {
                    userId: socket.id,
                    userName: joinData.userName
                });
            }, function(){
                socket.emit('joinGame failed');
            })
        });
    });

};