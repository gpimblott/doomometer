var mi5 = require("./MI5.js");
var emsc = require("./EMSC.js");
var noaa = require("./NOAA.js");
var usgs = require("./USGS.js");
var gdacs = require("./GDACS.js");
var sophos = require("./sophos.js");

var Feeds = function () {};


Feeds.refresh = function() {

    console.log(" *** Refreshing feeds from remote sites *** ");

    mi5.refresh();
    emsc.refresh();
    usgs.refresh();
    noaa.refresh();
    gdacs.refresh();
    sophos.refresh();
}

module.exports = Feeds;