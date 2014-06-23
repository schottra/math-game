"use strict";

var should = require('chai').should(),
    sinon = require('sinon'),
    q = require('q'),
    ioMock = _setup.requireMock('socket/io'),
    gameRepoMock = _setup.requireMock('repository/game'),
    gameSocket = _setup.requireSocket('game');

describe('Game Socket', function () {
    var app = {},
        io = {},
        gameNamespace = {},
        gameRepo = {},
        room = {},
        socket = {} ;

    beforeEach(function () {
        app = {
            gameRepository: gameRepoMock()
        };
        gameRepo = app.gameRepository;

        io = ioMock();
        gameNamespace = ioMock();
        room = ioMock();
        socket = ioMock();
        socket.id = 'validSocketId';
        socket.rooms = [];

        io.of.returns(gameNamespace);

        gameSocket(io, app);
    });

    var connectSocket = function () {
        gameNamespace.listeners['connection'](socket);
    };

    it('should attach to the correct namespace', function () {
        io.of.should.have.been.calledWith('/game');
    });

    it('should listen for game events', function(){
        connectSocket();
        socket.on.should.have.been.calledWith('joinGame');
        socket.on.should.have.been.calledWith('disconnect');
    });

    it('should assign connecting sockets a user id', function(){
        connectSocket();
        socket.emit.should.have.been.calledWith('userId assigned', sinon.match.string);
    });

    describe('with connected socket', function () {
        var gameData,
            gameId,
            userName,
            userInfo,
            joinCallback;

        beforeEach(connectSocket);
        beforeEach(function () {
            gameData = {
                clientVisibleData: {id: 'validId'}
            };
            gameRepo.addUserToGame = sinon.stub().returns( q(gameData) );
            gameId = 'validGameId';
            userName = 'user1';
            userInfo = {name: userName, id: socket.id};
            joinCallback = sinon.stub();
            gameNamespace.in.withArgs(gameId).returns(room);
        });

        var joinGame = function(){
            return socket.listeners['joinGame']({gameId: gameId, userName: userName}, joinCallback);
        };

        it('should pass required values when adding a user to a game', function(){
            return joinGame().
            finally(function(){
                gameRepo.addUserToGame.should.have.been.calledWith(gameId, {name: userName, id: socket.id});
            });
        });

        it('should respond with game data when a user joins', function () {
            return joinGame()
            .finally(function(){
                joinCallback.should.have.been.calledWith(gameData.clientVisibleData);
            });
        });

        it('should emit a failure message to socket when user join fails', function () {
            gameRepo.addUserToGame.returns(q.reject());
            return joinGame()
            .finally(function(){
                joinCallback.should.have.been.calledWith(sinon.match.instanceOf(Error));
            });
        });

        it('should emit a message to game room when a user joins', function(){
            return joinGame()
            .finally(function(){
                room.emit.should.have.been.calledWithMatch(
                    'userJoined',
                    {id: socket.id, name: 'user1'}
                );
            });
        });

        it('should emit a message to game room when a user leaves', function () {
            socket.rooms = ['validGameId'];
            socket.listeners['disconnect']();
            room.emit.should.have.been.calledWith(
                'userLeft',
                socket.id
            );
        });

        it('should notify game repository when user leaves', function () {
            socket.rooms = ['validGameId'];
            socket.listeners['disconnect']();
            gameRepo.removeUserFromGame.should.have.been.calledWith('validGameId', socket.id);
        });

        describe('when processing answers', function () {
            var answerData = {};
            var clock = {};
            beforeEach(function(done){
                answerData = {
                    gameId: gameId,
                    answer: 'theAnswer'
                };
                gameRepo.newQuestion.returns( q({
                    clientVisibleData: {
                    }
                }));
                clock = sinon.useFakeTimers();
                joinGame().done(done);
            });

            afterEach(function(){
                clock.restore();
            });

            var setupCorrectAnswer = function(){
                var updatedQuestion = {
                    winner: 'winnerId',
                    hasBeenAnswered: true
                };
                gameRepo.answerCurrentQuestion.returns( q({
                    correct: true,
                    updatedQuestion: updatedQuestion
                }) );
                return updatedQuestion;
            };

            var sendAnswer = function () {
                return socket.listeners['answerQuestion'](answerData);
            };

            it('should send correct arguments when processing an answer', function(){
                gameRepo.answerCurrentQuestion.returns( q({correct: false}) );
                return sendAnswer()
                .finally(function () {
                    gameRepo.answerCurrentQuestion.should.have.been.calledWith(
                        gameId, socket.id, answerData.answer
                    );
                });
            });

            it('should emit wrong answer event when answer is resolved as incorrect', function () {
                gameRepo.answerCurrentQuestion.returns( q({correct: false}) );
                return sendAnswer()
                .finally( function(){
                    socket.emit.should.have.been.calledWith(
                        'answerIncorrect'
                    );
                });
            });

            it('should emit questionEnded event when answer is resolved as correct', function() {
                var updatedQuestion = setupCorrectAnswer();
                return sendAnswer()
                .finally( function(){
                    room.emit.should.have.been.calledWith(
                        'questionEnded',
                        sinon.match(updatedQuestion)
                    );
                });
            });

            it('should not emit any events for rejected answers', function(){
                gameRepo.answerCurrentQuestion.returns( q.reject() );
                return sendAnswer()
                .finally( function(){
                    room.emit.should.not.have.been.calledWithMatch('questionEnded');
                    socket.emit.should.not.have.been.calledWithMatch('answerIncorrect');
                });
            });

            it('should schedule a new question after current question has been answered', function(){
                setupCorrectAnswer();
                return sendAnswer()
                .finally( function(){
                    clock.tick(10000);
                    gameRepo.newQuestion.should.have.been.calledWith(gameId);
                });
            });

            //TODO: This can't be tested reliably until some of the functionality in the game socket is broken
            // up and more accessible from tests
//            it('should use client visible data when emitting a new question', function () {
//                var filteredQuestion = {
//                    text: 'theText',
//                    hasBeenAnswered: false
//                };
//                var updatedGame = {
//                    clientVisibleData: {
//                        currentQuestion: filteredQuestion
//                    }
//                };
//                gameRepo.newQuestion.returns( q(updatedGame) );
//                setupCorrectAnswer();
//                return sendAnswer()
//                .finally( function(){
//                    clock.tick(10000);
//                    room.emit.should.have.been.calledWithMatch('newQuestion', filteredQuestion);
//                });
//            });

        });
    });
});