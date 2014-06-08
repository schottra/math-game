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
        socket = {} ;

    beforeEach(function () {
        app = {
            gameRepository: gameRepoMock()
        };
        io = ioMock();
        gameNamespace = ioMock();
        socket = ioMock();
        socket.id = 'validSocketId';

        io.of.returns(gameNamespace);

        gameSocket(io, app);
    });

    var connectSocket = function () {
        gameNamespace.listeners['connection'](socket);
    };

    it('should attach to the correct namespace', function () {
        io.of.calledWith('/game').should.be.true;
    });

    it('should listen for joinGame events', function(){
        connectSocket();
        socket.on.calledWith('joinGame').should.be.true;
    });

    describe('with connected socket', function () {
        beforeEach(connectSocket);

        it('should pass required values when adding a user to a game', function(){
            socket.listeners['joinGame']({gameId: 'validGameId', userName: 'user1'});
            app.gameRepository.addUserToGame.firstCall.args[0].should.eql({
                gameId: 'validGameId',
                userId: 'validSocketId',
                userName: 'user1'
            });
        });

        it('should emit a success message to socket when user join succeeds', function(){
            return socket.listeners['joinGame']({gameId: 'validGameId', userName: 'user1'})
            .finally(function(){
                socket.emit.calledWith('joinGame success').should.be.true;
            });
        });

        it('should emit a failure message to socket when user join fails', function () {
            app.gameRepository.addUserToGame.returns(q.reject());
            return socket.listeners['joinGame']({gameId: 'validGameId', userName: 'user1'})
            .finally(function(){
                socket.emit.calledWith('joinGame failed').should.be.true;
            });
        });

        it('should emit a message to game room when a user joins', function(){

        });

        it('should emit a message to game room when a user leaves', function () {

        });
    });
});