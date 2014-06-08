"use strict";

var sinon = require('sinon');

module.exports = function(){
    var mock = {
        listeners: {},
        on: function(event, fn){
            mock.listeners[event] = fn;
        },
        of: sinon.stub()
    };

    sinon.stub(mock, "on");
    return mock;
};