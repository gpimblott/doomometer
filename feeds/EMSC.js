var mysql = require('mysql');
var config = require('../config/db');

var FeedParser = require('feedparser');
var request = require('request');



var EMSC = function () {};


EMSC.refresh = function() {
    var req = request("http://www.emsc-csem.org/service/rss/rss.php?typ=emsc");


    var feedparser = new FeedParser();

    req.on('error', function (error) {
        console.log(error);
    });

    req.on('response', function (res) {
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        stream.pipe(feedparser);
    });


    feedparser.on('error', function (error) {
        // always handle errors
    });
    feedparser.on('readable', function () {
        // This is where the action is!
        var stream = this
            , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            , item;


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


            // var values = [];

            while (item = stream.read()) {
                //console.log(item);

                var title = item.title;
                var link = item.link;

                var lat = item["geo:lat"]['#'];
                var lon = item["geo:long"]['#'];

                var depth = item["emsc:depth"]['#'];
                var time = item["emsc:time"]['#'];
                var magnitude = item["emsc:magnitude"]['#'];
                var parts = magnitude.split(' ');
                var location = title.substr(8);


                //var row = [title, lat, lon, time, 1, depth, parts[1], link,location,location];
                //values.push(row);

                var post = {
                    description: title, latitude: lat, longitude: lon, time: time,
                    event_type: 1, depth: depth, magnitude: parts[1], url: link,
                    location_name: location, name: location
                };


                query = connection.query('INSERT INTO earthquakes SET ?', post, function (err, result) {
                    if (err) {
                        console.log(err);
                    }

                });

                //console.log(query.sql);

            }

            connection.end();


        });


    });
}

module.exports = EMSC;