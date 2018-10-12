/**
 * ENTRY POINT for main.js.
 * Uses babel to compile es6 into 
 */
require('babel-register')({
    presets: ['env']
});

module.exports = require('./main.js');