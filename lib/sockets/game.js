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
                    responseFn(gameData.getClientVisibleData());
                }
                game.in(joinData.gameId).emit('userJoined', userInfo );
            })
            .catch( function(){
                responseFn({error: 'gameNotFound'});
            });
        });

        //TODO: config constant for delay amount?
        var scheduleNewQuestion = function(gameId){
            setTimeout(function(){
                gameRepo.newQuestion(gameId).then(function(gameData){
                    game.in(gameId).emit('newQuestion', gameData.getClientVisibleData().currentQuestion);
                });
            }, 5000);
        };

        socket.on('answerQuestion', function (answerData) {
            return gameRepo.answerCurrentQuestion(answerData.gameId, socket.id, answerData.answer)
            .then(function (result) {
                if(result.correct){
                    game.in(answerData.gameId).emit('questionEnded', result.updatedQuestion);
                    scheduleNewQuestion(answerData.gameId);
                }
                else{
                    socket.emit('answerIncorrect');
                }
            });
        });


    });

};