"use strict";

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    sinonChai = require('sinon-chai'),
    path = require('path'),
    baseDir = '../../',
    libDir = '../../lib';

chai.use(chaiAsPromised);
chai.use(sinonChai);

global._setup = {
    requireServer: function(){
        return require(path.join(baseDir, 'server'));
    },

    requireRepository: function(repositoryName){
        return require(path.join(libDir, 'repositories', repositoryName ));
    },

    requireSocket: function(socketName){
        return require(path.join(libDir, 'sockets', socketName));
    },

    requireMock: function(mockName){
        var mockPath = path.join(__dirname, 'mock', mockName);
        console.log("Looking for mock: ", mockPath);
        return require(mockPath);
    }
};