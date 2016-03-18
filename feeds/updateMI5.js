var mysql  = require('mysql');
var config = require('../config/db');

var FeedParser = require('feedparser');
var request = require('request');

var MI5 = function () {};


MI5.refresh = function() {

    var req = request("https://www.mi5.gov.uk/UKThreatLevel/UKThreatLevel.xml");


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
                console.log(item);

                var title = item.title;
                var link = item.link;
                var time = item.date;
                var description = item.description;

                var state = "UNKNOWN";
                if (startsWith($description, "The current UK threat level is ")) {
                    $state = substr($description, 31);
                    $a = explode(" ", $state);
                    $state = $a[0];
                }



            }

            connection.end();
        });
    });
}

module.exports = MI5;