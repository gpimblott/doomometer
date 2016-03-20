var mysql = require('mysql');
var config = require('../config/db');

var FeedParser = require('feedparser');
var request = require('request');


var EMSC = function () {
};


EMSC.refresh = function () {
    var req = request("http://www.emsc-csem.org/service/rss/rss.php?typ=emsc");


    var feedparser = new FeedParser();
    var records = [];

    req.on('error', function (error) {
        console.log(error);
    });

    req.on('response', function (res) {
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        records.length = 0;

        stream.pipe(feedparser);
    });


    feedparser.on('end', function (error) {

        console.log("Updating EMSC earthquakes");
        EMSC.updateDatabase(records);
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
            //console.log(item);

            var title = item.title;
            var link = item.link;

            var lat = item["geo:lat"]['#'];
            var lon = item["geo:long"]['#'];

            var depth = Math.abs(item["emsc:depth"]['#']);
            var time = new Date(item["emsc:time"]['#']);
            var magnitude = item["emsc:magnitude"]['#'];
            var parts = magnitude.split(' ');
            var location = title.substr(8);

            if (isNaN(depth)) {
                depth = 0.0;
            }
            var record = [];

            record.push(title);
            record.push(lat);
            record.push(lon);
            record.push(time.toISOString());
            record.push(1);
            record.push(depth);
            record.push(parts[1]);
            record.push(link);
            record.push(location);
            record.push(location);

            records.push(record);

        }

    });
}


EMSC.updateDatabase = function (records) {

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
            "(description, latitude,longitude,time,event_type,depth,magnitude,url,location_name,name) VALUES ?", [records],
            function (err, result) {

                if (err) {
                    console.log(err);
                    console.log(query.sql);
                } else {
                    console.log(result);
                }
                records.length = 0;
                connection.end();

            });

    })
}

module.exports = EMSC;