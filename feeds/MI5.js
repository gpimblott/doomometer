var mysql = require('mysql');
var config = require('../config/db');

var FeedParser = require('feedparser');
var request = require('request');

var MI5 = function () {
};


MI5.refresh = function () {

    var req = request("https://www.mi5.gov.uk/UKThreatLevel/UKThreatLevel.xml");

    var records = [];
    var feedparser = new FeedParser();

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
        console.log("Updating MI5");
        MI5.updateDatabase(records);
    });

    feedparser.on('error', function (error) {
        console.log(error);
    });

    feedparser.on('readable', function () {
        // This is where the action is!
        var stream = this
            , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            , item;


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


            var record = [];
            record.push(description);
            record.push(title);
            record.push(meta.date.toISOString());
            record.push(imagelink);
            record.push(link);
            record.push(meta.generator);
            record.push(state);

            records.push(record);
        }

    });
}

MI5.updateDatabase = function (records) {

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


        query = connection.query('INSERT IGNORE INTO alertstates (description,title,issuetime,imageurl,url,source,state) VALUES ? ',

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

module.exports = MI5;