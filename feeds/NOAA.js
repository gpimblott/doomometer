var mysql = require('mysql');
var config = require('../config/db');

var request = require('request');


var NOAA = function () {
};


NOAA.refresh = function () {

    var fs = require('fs');
    var obj;


    var records = [];
    var request = require('request');

    request.get('http://services.swpc.noaa.gov/products/alerts.json', function (error, response, body) {

        if (!error && response.statusCode == 200) {

            obj = JSON.parse(body);

            obj.forEach(function (report) {
                // console.log( obj );

                var parts;
                var messageCodeType = "";
                var messageCodeId = "";
                var serialNumber = "";
                var alert = "";
                var issueTime;
                var text = report.message;

                report.message.split("\r\n").forEach(function (line) {

                    parts = line.split(':');

                    //console.log("LINE:" + line);
                    if (undefined != parts && undefined != parts[0]) {

                        var tag = parts[0].trim();
                        var value = parts[1];

                        if (value != undefined) value = value.trim();


                        if (tag === "Space Weather Message Code") {
                            messageCodeType = value.substr(0, 3);
                            messageCodeId = value.substr(3);
                        } else if (tag === "Serial Number") {
                            serialNumber = value;
                        } else if (tag == "Issue Time") {
                            issueTime = new Date(value);
                        } else if (tag === "ALERT") {
                            alert = value;
                        } else if (tag === "WARNING") {
                            alert = value;
                        } else if (tag === "EXTENDED WARNING") {
                            alert = value;
                        } else if (tag === "SUMMARY") {
                            alert = value;
                        }
                    }
                });

                if (issueTime === undefined) {
                    issueTime = "";
                } else {
                    issueTime = issueTime.toISOString();
                }

                var record = [];
                record.push(serialNumber);
                record.push(issueTime);
                record.push(messageCodeType);
                record.push(messageCodeId);
                record.push(alert);
                record.push(text);

                records.push(record);

            });

            NOAA.updateDatabase(records);
        };
    })
}

NOAA.updateDatabase = function (records) {

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


        query = connection.query('INSERT INTO spaceweather (id,issuetime,message_type,message_code,name,description) VALUES ? '
            + 'ON DUPLICATE KEY UPDATE id=VALUES(id), issuetime=VALUES(issuetime), description=VALUES(description),name=VALUES(name)',

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


module.exports = NOAA;