var mysql = require('mysql');
var config = require('../config/db');

var request = require('request');


var NOAA = function () {};


NOAA.refresh = function() {

    var fs = require('fs');
    var obj;


    var request = require('request');

    request.get('http://services.swpc.noaa.gov/products/alerts.json', function (error, response, body) {

        if (!error && response.statusCode == 200) {


            obj = JSON.parse(body);


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

                    if(issueTime===undefined) {
                        issueTime = "";
                    } else {
                        issueTime = issueTime.toISOString();
                    }

                    var post = {
                        id: serialNumber,
                        issuetime: issueTime,
                        message_type: messageCodeType,
                        message_code: messageCodeId,
                        name: alert,
                        description: text
                    };


                    query = connection.query('INSERT INTO spaceweather SET ? '
                        + 'ON DUPLICATE KEY UPDATE id=VALUES(id), issuetime=VALUES(issuetime), description=VALUES(description),name=VALUES(name)',
                        post, function (err, result) {

                            if (err) {
                                console.log(err);
                                console.log(query.sql);
                            }

                        });


                });

                connection.end();
            });
        }
    });
}

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

module.exports = NOAA;