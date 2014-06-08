"use strict";

var should = require('chai').should(),
    sinon = require('sinon'),
    ioMock = _setup.requireMock('socket/io'),
    gameSocket = _setup.requireSocket('game');

describe('Game Socket', function () {
    var app = {},
        io = {},
        gameNamespace = {},
        socket = {} ;

    beforeEach(function () {
        app = {};
        io = ioMock();
        gameNamespace = ioMock();
        socket = ioMock();
        io.of.returns(gameNamespace);

        gameNamespace.on.withArgs('connection').callsArgWith(1, socket);
        gameSocket(io, app);
    });

    it('should attach to the correct namespace', function () {
        io.of.calledWith('/game').should.be.true;
    });

    it('should listen for joinGame events', function(){
        socket.on.calledWith('joinGame').should.be.true;
    });

});