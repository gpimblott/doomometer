var mysql = require('mysql');
var config = require('../config/db');

var FeedParser = require('feedparser');
var request = require('request');

var Sophos = function () {
};


Sophos.refresh = function () {

    var req = request("http://www.sophos.com/en-us/rss/threats/latest-viruses.aspx");

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


    feedparser.on('error', function (error) {
        console.log(error);

    });

    feedparser.on('end', function (error) {
        console.log("Updating Sophos");
        Sophos.updateDatabase(records);
    });

    feedparser.on('readable', function () {

        var stream = this
            , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            , item;


        while (item = stream.read()) {
            //console.log(item);

            var title = item.title;
            var link = item.link;
            var pubDate = new Date(item.pubdate);

            var record = [];
            record.push(title);
            record.push(pubDate.toISOString());
            record.push(link);

            records.push(record);
        }
    });
}

Sophos.updateDatabase = function (records) {

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


        query = connection.query('INSERT IGNORE INTO virus (name,time,url) VALUES ?', [records], function (err, result) {
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


module.exports = Sophos;