"use strict";

var should = require('should'),
    q = require('q');

should.Assertion.add('resolve',  function(msg){
    var promise = this.obj;
    return promise
        .then(function(){return q();})
        .fail(function(){return q.reject(msg || 'promise was not rejected')})
});

should.Assertion.add('reject', function(msg){
    var promise = this.obj;
    return promise
        .then(function(){return q.reject(msg || 'promise was not rejected')})
        .fail(function(){return q();})
});