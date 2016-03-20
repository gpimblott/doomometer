var mysql = require('mysql');
var config = require('../config/db');

var FeedParser = require('feedparser');
var request = require('request');



var GDACS = function () {};


GDACS.refresh = function() {
    var req = request("http://www.gdacs.org/xml/rss.xml");


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



            while (item = stream.read()) {
               // console.log(item);

                var title = item.title;
                var pubDate = item.pubdate;
                var link = item.link;
                var description = item.description;
                var alertLevel = item["gdacs:alertlevel"]['#'];
                var fromDate = formatDate( item["gdacs:fromdate"]['#']);
                var toDate = formatDate( item["gdacs:todate"]['#'] );
                var eventType = item["gdacs:eventtype"]['#'];
                var country = item["gdacs:country"]['#'];
                var severity = item["gdacs:severity"]['#'];
                var lat = item["geo:point"]["geo:lat"]["#"];
                var lon = item["geo:point"]["geo:long"]["#"];
              //  var pictureURL = item["rss:enclosure"]['url'];
                var eventName = item["gdacs:eventname"]["#"];

                if( undefined === eventName ) eventName = "";
                if( undefined === country ) country = "Unknown";

                var post = {
                    description: description,
                    latitude:lat,
                    longitude:lon,
                    location_name:country,
                    name:title,
                    time:pubDate,
                    url:link,
                    event_type:2,
                    alert_level:alertLevel,
                    fromdate:fromDate,
                    todate:toDate,
                    disaster_type:eventType ,
                    severity: severity,
                    type: eventName};


                query = connection.query('INSERT IGNORE INTO disasters SET ?', post, function (err, result) {
                    if (err) {
                        console.log(err);
                        console.log(query.sql);
                    }

                });


            }

            connection.end();


        });


    });


//2013-01-19 03:14:07
function formatDate(dstr) {

    var d = new Date(dstr);

    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();

    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;

    var hour = d.getHours();
    var minute = d.getMinutes();
    var second = d.getSeconds();

    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}
}

module.exports = GDACS;