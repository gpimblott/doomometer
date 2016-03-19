var alerts = require("./alerts.js");
var disasters = require("./disasters.js");
var earthquakes = require("./earthquakes.js");
var spaceweather = require("./spaceweather.js");
var virus = require("./virus.js");

var CacheFiles = function () {};


CacheFiles.refresh = function() {

    console.log("Refreshing cache pages");

    alerts.refresh();
    disasters.refresh();
    earthquakes.refresh();
    spaceweather.refresh();
    virus.refresh();
}

module.exports = CacheFiles;