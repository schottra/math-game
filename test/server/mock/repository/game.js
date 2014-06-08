"use strict";

var sinon = require('sinon');

module.exports = function(){
    return{
        createGame: sinon.stub(),
        addUserToGame: sinon.stub(),
        getGame: sinon.stub()
    }
};