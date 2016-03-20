var mysql = require('mysql');
var config = require('../config/db');
var datetime = require('../utils/DateTime.js');

var FeedParser = require('feedparser');
var request = require('request');


var USGS = function () {
};


USGS.refresh = function () {

    var req = request("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom");

    var feedparser = new FeedParser();
    var records = [];

    req.on('error', function (error) {
        console.log(error);
    });

    req.on('response', function (res) {
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        records.length=0;
        stream.pipe(feedparser);
    });


    feedparser.on('end', function (error) {
        console.log("Updating USGS earthquakes");
        USGS.updateDatabase(records);
    });

    feedparser.on('error', function (error) {
        console.log(error);
    });

    feedparser.on('readable', function () {
        // This is where the action is!
        var stream = this
            , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            , item;


            while (item = stream.read()) {
                // console.log(item);

                var title = item.title;
                var link = item.link;

                var point = item["georss:point"]['#'];
                var latlon = point.split(' ');
                var elev = item["georss:elev"]['#'];
                var depth = Math.abs(elev / 1000);
                var location = title.substr(8);
                var magnitude = title.substr(1, 5).trim();


                // Extract the time from the description ???
                var pos = item.description.indexOf("Time</dt><dd>");
                var str2 = item.description.substr(pos + 13);
                var pos2 = str2.indexOf("</dd");
                var actualTime = new Date(str2.substr(0, pos2));

                if(isNaN(depth)) depth=0.0;

                var record = [];
                record.push(title);
                record.push(latlon[0]);
                record.push(latlon[1]);
                record.push(actualTime.toISOString());
                record.push(1);
                record.push(depth);
                record.push(magnitude);
                record.push(link);
                record.push(location);
                record.push(location);

                records.push(record);
            }

    });
}

USGS.updateDatabase = function (records) {

    //console.log(records);

    var connection = mysql.createConnection({
        host: config.mysql.host,
        user: config.mysql.username,
        password: config.mysql.password,
        database: config.mysql.dbname,
        port: config.mysql.port,
    });


    connection.connect(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }


        query = connection.query("INSERT IGNORE INTO earthquakes " +
            "(description,latitude,longitude,time,event_type,depth,magnitude,url,location_name,name) VALUES ?",[records],
            function (err, result ) {

                if (err) {
                    console.log(err);
                    console.log(query.sql);
                } else {
                    console.log(result);
                }
                records.length=0;
                connection.end();

            });

    })
}

module.exports = USGS;
