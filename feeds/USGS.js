var mysql  = require('mysql');
var config = require('../config/db');

var FeedParser = require('feedparser');
var request = require('request');


var USGS = function () {};



USGS.refresh = function() {

    var req = request("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom");


    var feedparser = new FeedParser();

    req.on('error', function (error) {
        // handle any request errors
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

            while (item = stream.read()) {
                //console.log(item);

                var title = item.title;
                var link = item.link;
                var time = item.pubdate;

                var point = item["georss:point"]['#'];
                var latlon = point.split(' ');
                var elev = item["georss:elev"]['#'];
                var depth = Math.abs(elev / 1000);
                var location = title.substr(8);
                var magnitude = title.substr(1, 5).trim();


                var post = {
                    description: title, latitude: latlon[0], longitude: latlon[1], time: time,
                    event_type: 1, depth: depth, magnitude: magnitude, url: link,
                    location_name: location, name: location
                };


                query = connection.query('INSERT IGNORE INTO earthquakes SET ?', post, function (err, result) {
                    if (err) {
                        console.log(err);
                        console.log(query.sql);
                    }

                });


            }

            connection.end();
        });
    });
}

module.exports = USGS;

//USGS.refresh();