"use strict";

module.exports = function(io){
    var game = io.of('/game');
    game.on('connection', function(socket){
       console.log('new game client');
    });
};