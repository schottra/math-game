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

    describe('with connected socket', function () {
        beforeEach(connectSocket);
        beforeEach(function () {
            gameNamespace.in.withArgs('validGameId').returns(room);
        });

        it('should pass required values when adding a user to a game', function(){
            socket.listeners['joinGame']({gameId: 'validGameId', userName: 'user1'});
            app.gameRepository.addUserToGame.firstCall.args[0].should.eql({
                gameId: 'validGameId',
                userId: 'validSocketId',
                userInfo: {name: 'user1'}
            });
        });

        it('should respond with game data when a user joins', function () {
            var callback = sinon.spy();
            var gameData = {id: 'validId'};
            app.gameRepository.getGame = sinon.stub().returns( q(gameData) );
            return socket.listeners['joinGame']({gameId: 'validGameId', userName: 'user1'}, callback)
            .finally(function(){
                callback.should.have.been.calledWith(gameData);
            });
        });

        it('should emit a failure message to socket when user join fails', function () {
            app.gameRepository.addUserToGame.returns(q.reject());
            var callback = sinon.stub();
            return socket.listeners['joinGame']({gameId: 'validGameId', userName: 'user1'}, callback)
            .finally(function(){
                callback.should.have.been.calledWith(sinon.match.instanceOf(Error));
            });
        });

        it('should emit a message to game room when a user joins', function(){
            return socket.listeners['joinGame']({gameId: 'validGameId', userName: 'user1'})
            .finally(function(){
                room.emit.should.have.been.calledWith('userJoined');
                room.emit.firstCall.args[1].should.eql({id: socket.id, userInfo: {name: 'user1'}});
            });
        });

        it('should emit a message to game room when a user leaves', function () {
            socket.rooms = ['validGameId'];
            socket.listeners['disconnect']();
            room.emit.should.have.been.calledWith('userLeft');
            room.emit.firstCall.args[1].should.eql(socket.id);
        });

        it('should notify game repository when user leaves', function () {
            socket.rooms = ['validGameId'];
            socket.listeners['disconnect']();
            app.gameRepository.removeUserFromGame.should.have.been.calledWith('validGameId', socket.id);
        });
    });
});