var schedule = require('node-schedule');

var keepalive = require('./keepalive');
var feeds = require('./feeds/feeds.js');
var routes = require('./routes.js');

var Schedule = function () {
};

/**
 * Keep a local copy of the data for the main default pages
 */
Schedule.start = function () {
    console.log("Starting CRON jobs");

    var pingJob = schedule.scheduleJob('*/1 * * * *', function(){
        keepalive.ping();
    });

    var viewJob = schedule.scheduleJob('*/1 * * * *', function(){
        routes.refreshCachedData();
    });


    var feedsJob = schedule.scheduleJob('*/30 * * * *', function(){
        feeds.refresh();
    });

    //var bbcJob = schedule.scheduleJob('0 */3 * * *', function(){
    //    bbc.refresh();
    //});
}

module.exports = Schedule;
