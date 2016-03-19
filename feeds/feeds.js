var mi5 = require("./MI5.js");
var emsc = require("./EMSC.js");
var noaa = require("./NOAA.js");
var usgs = require("./USGS.js");

var Feeds = function () {};


Feeds.refresh = function() {

    console.log("Refreshing feeds");

    mi5.refresh();
    emsc.refresh();
    usgs.refresh();
    noaa.refresh();
}

module.exports = Feeds;