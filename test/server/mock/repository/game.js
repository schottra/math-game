"use strict";

var sinon = require('sinon'),
    q = require('q');

module.exports = function(){
    return{
        createGame: sinon.stub().returns(q()),
        addUserToGame: sinon.stub().returns(q()),
        removeUserFromGame: sinon.stub().returns(q()),
        getGame: sinon.stub().returns(q())
    }
};