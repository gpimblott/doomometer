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
               // console.log(item);

                var title = item.title;
                var link = item["rss:link"]['#'];
                var description = item.description;
                var imagelink = item["rss:imagelink"]['#'];
                var state = "UNKNOWN";

                state = description.substr(31);
                var word = state.split(' ');
                state = word[0];


                var post = {
                    description: description, title: title, issuetime: meta.date.toISOString(),
                    imageurl: imagelink, url: link, source : meta.generator,
                    state: state };


                query = connection.query('INSERT IGNORE INTO alertstates SET ?', post, function (err, result) {
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

module.exports = MI5;