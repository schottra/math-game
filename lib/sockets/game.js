"use strict";

var q = require('q');

module.exports = function(io, app){
    var game = io.of('/game');
    var gameRepo = app.gameRepository;

    game.on('connection', function(socket){
        socket.emit('userId assigned', socket.id);

        socket.on('disconnect', function(){
            socket.rooms.forEach(function(gameId){
                game.in(gameId).emit('userLeft', socket.id);
                gameRepo.removeUserFromGame(gameId, socket.id);
            });
        });

        socket.on('joinGame', function(joinData, responseFn){
            socket.join(joinData.gameId);
            var userInfo =  {
                id: socket.id,
                name: joinData.userName
            };

            return gameRepo.addUserToGame(joinData.gameId,userInfo)
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

        //TODO: Pass along user id so repo can add winner to the question data
        socket.on('answerQuestion', function (answerData) {
            return gameRepo.answerCurrentQuestion(answerData.gameId, socket.id, answerData.answer)
            .then(function (result) {
                if(result.correct){
                    game.in(answerData.gameId).emit('questionEnded', result.updatedQuestion);
                }
                else{
                    socket.emit('answerIncorrect');
                }
            });
        });


    });

};