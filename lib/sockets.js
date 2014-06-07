"use strict";

module.exports = function(io, app){
    require('./sockets/game')(io,app);

    io.on('connection', function (socket) {
        console.log("client connected");
    });
};