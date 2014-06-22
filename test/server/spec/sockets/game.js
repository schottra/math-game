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
        room = {},
        socket = {} ;

    beforeEach(function () {
        app = {
            gameRepository: gameRepoMock()
        };
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
            app.gameRepository.addUserToGame = sinon.stub().returns( q(gameData) );
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
                app.gameRepository.addUserToGame.should.have.been.calledWith(gameId, {name: userName, id: socket.id});
            });
        });

        it('should respond with game data when a user joins', function () {
            return joinGame()
            .finally(function(){
                joinCallback.should.have.been.calledWith(gameData.clientVisibleData);
            });
        });

        it('should emit a failure message to socket when user join fails', function () {
            app.gameRepository.addUserToGame.returns(q.reject());
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
            app.gameRepository.removeUserFromGame.should.have.been.calledWith('validGameId', socket.id);
        });
    });
});