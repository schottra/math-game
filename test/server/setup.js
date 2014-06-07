"use strict";

global._setup = {
    server: function(){
        return require('../../server');
    },

    getRepository: function(repositoryName){
        return require('../../lib/repositories/'+repositoryName);
    }
};