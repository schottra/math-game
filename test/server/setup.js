"use strict";

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

global._setup = {
    server: function(){
        return require('../../server');
    },

    getRepository: function(repositoryName){
        return require('../../lib/repositories/'+repositoryName);
    }
};