"use strict";

var sinon = require('sinon');

module.exports = function(){
    var mock = {
        listeners: {},
        on: function(event, fn){
            this.listeners[event] = fn;
        },
        of: sinon.stub(),
        emit: sinon.stub()
    };
    sinon.spy(mock, 'on');
    return mock;
};