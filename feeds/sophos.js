var mysql  = require('mysql');
var config = require('../config/db');

var FeedParser = require('feedparser');
var request = require('request');

var Sophos = function () {};


Sophos.refresh = function() {

    var req = request("http://www.sophos.com/en-us/rss/threats/latest-viruses.aspx");


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
        console.log(error);

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
                var pubDate =  item.pubdate;


                var post = {
                    name: title, time: pubDate, url: link };


                query = connection.query('INSERT IGNORE INTO virus SET ?', post, function (err, result) {
                    if (err) {
                        console.log(err);
                        console.log(query.sql);
                    }

                   // console.log(result);
                });


            }

            connection.end();
        });
    });
}

module.exports = Sophos;