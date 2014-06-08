"use strict";

var should = require('chai').should(),
    sinon = require('sinon'),
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
            socket.id = 'validSocketId';
            socket.listeners['joinGame']({gameId: 'validGameId', userName: 'user1'});
            app.gameRepository.addUserToGame.firstCall.args[0].should.eql({
                gameId: 'validGameId',
                userId: 'validSocketId',
                userName: 'user1'
            });
        });
    });
});