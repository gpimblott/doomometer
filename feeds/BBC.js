require('dotenv').config({path: '../process.env'});

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
    var text = "";

    req.on('error', function (error) {
        console.log(error);
    });

    req.on('response', function (res) {
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        stream.pipe(feedparser);
    });

    feedparser.on('end', function (error) {
        data = data + JSON.stringify(text);
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
            text = text + item.description;
            count = count + 1;
        }


    });
};


BBC.updateDatabase = function (response) {

    var numReports= response.length;


    if( numReports === undefined ){
        console.log("Failed to get response from uClassify")
        console.log(response);
        return;
    }

    var post = {
        channel: "BBC", report_date: new Date().toISOString()
    };

    for (var i = 0; i < response.length; i++) {

        var resp = response[i];

        for (var ci = 0; ci < resp.classification.length; ci++) {
            var className = resp.classification[ci].className;
            var p = (resp.classification[ci].p*100).toFixed(1);

            post[className] = p;
            //console.log( className + ":" + p );
        }

    }

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

BBC.refresh();