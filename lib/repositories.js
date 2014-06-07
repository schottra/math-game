"use strict";

module.exports = function(app){
    app.gameRepository = require('./repositories/gameRepository')(app);
};