var mi5 = require("./mi5.js");
var emsc = require("./emsc.js");
var noaa = require("./noaa.js");
var usgs = require("./usgs.js");

var Feeds = function () {};


Feeds.refresh = function() {

    console.log("Refreshing feeds");

    mi5.refresh();
    emsc.refresh();
    usgs.refresh();
    noaa.refresh();
}

module.exports = Feeds;