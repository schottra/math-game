'use strict';

var randomstring = require('randomstring');

exports.createGame = function(req, res){
    res.json({
        id: randomstring.generate(6)
    });
};