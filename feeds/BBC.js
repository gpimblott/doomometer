var mysql = require('mysql');
var config = require('../config/db');
var uclassify = require('../utils/uclassify.js');

var FeedParser = require('feedparser');
var request = require('request');


var BBC = function () {
};


BBC.refresh = function () {
    var req = request("http://feeds.bbci.co.uk/news/world/rss.xml?edition=uk");


    var feedparser = new FeedParser();
    var count = 0;
    var data = "{\"texts\":[";

    req.on('error', function (error) {
        console.log(error);
    });

    req.on('response', function (res) {
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        stream.pipe(feedparser);
    });

    feedparser.on('end', function (error) {
        data = data + "]}";

        uclassify.performRequest(data, BBC.updateDatabase);
    });

    feedparser.on('error', function (error) {
        console.log(error);
    });

    feedparser.on('readable', function () {
        // This is where the action is!
        var stream = this
            , meta = this.meta
            , item;

        while (item = stream.read()) {
            // console.log(item);

            if (count != 0 ) {
                data = data + ",";
            }

            data = data + JSON.stringify(item.description );
            count = count + 1;
        }


    });
};


BBC.updateDatabase = function (response) {

    var numReports= response.length;
    var negative = 0.0;
    var positive = 0.0;
    var numnegative = 0;
    var numpositive = 0;

    if( numReports === undefined ){
        console.log("Failed to get response from uClassify")
        console.log(response);
        return;
    }

    for (var i = 0; i < response.length; i++) {

        var resp = response[i];
        var neg = 0;
        var pos = 0;


        for (var ci = 0; ci < 2; ci++) {
            var className = resp.classification[ci].className;
            var p = resp.classification[ci].p;

            if (className === "negative") {
                neg = p;
            } else {
                pos = p;
            }
        }

        if (neg > pos) {
            numnegative = numnegative + 1;
        } else {
            numpositive = numpositive + 1;
        }

        negative = negative + neg;
        positive = positive + pos;

    }

    negative = (negative/numReports * 100).toFixed(1);
    positive = (positive/numReports * 100).toFixed(1);


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

        var post = {
            channel: "BBC", reports: numReports, sampletime: new Date().toISOString(),
            negative: negative, positive: positive,
            numnegative: numnegative, numpositive: numpositive
        };


        query = connection.query('INSERT IGNORE INTO news SET ?', post, function (err, result) {
            if (err) {
                console.log(err);
                console.log(query.sql);
            }

        });

        console.log(query.sql);
        connection.end();
    });


}

module.exports = BBC;

//BBC.refresh();