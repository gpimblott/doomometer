var mysql = require('mysql');
var config = require('../config/db');

var FeedParser = require('feedparser');
var request = require('request');


var GDACS = function () {
};


GDACS.refresh = function () {
    var req = request("http://www.gdacs.org/xml/rss.xml");

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
        console.log("Updating GDACS");
        GDACS.updateDatabase(records);
    });


    feedparser.on('error', function (error) {
        console.log(error);
    });

    feedparser.on('readable', function () {

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
                // console.log(item);

                var title = item.title;
                var pubDate = new Date(item.pubdate);
                var link = item.link;
                var description = item.description;
                var alertLevel = item["gdacs:alertlevel"]['#'];
                var fromDate = new Date(item["gdacs:fromdate"]['#']);
                var toDate = new Date(item["gdacs:todate"]['#']);
                var eventType = item["gdacs:eventtype"]['#'];
                var country = item["gdacs:country"]['#'];
                var severity = item["gdacs:severity"]['#'];
                var lat = item["geo:point"]["geo:lat"]["#"];
                var lon = item["geo:point"]["geo:long"]["#"];
                //  var pictureURL = item["rss:enclosure"]['url'];
                var eventName = item["gdacs:eventname"]["#"];

                if (undefined === eventName) eventName = "";
                if (undefined === country) country = "Unknown";

                var record = [];

                record.push(description);
                record.push(lat);
                record.push(lon);
                record.push(country);
                record.push(title);
                record.push(pubDate.toISOString());
                record.push(link);
                record.push(2);
                record.push(alertLevel);
                record.push(fromDate.toISOString());
                record.push(toDate.toISOString());
                record.push(eventType);
                record.push(severity);
                record.push(eventName);


                records.push(record);
            }

            connection.end();
        });

    });
}


GDACS.updateDatabase = function (records) {

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


        query = connection.query('INSERT IGNORE INTO disasters ' +
            '(description,latitude,longitude,location_name,name,time,url,event_type,alert_level,' +
            'fromdate,todate,disaster_type,severity,type) VALUES ?',
            [records], function (err, result) {
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
};


module.exports = GDACS;