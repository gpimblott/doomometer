var fs = require("fs");
var dbpool = require('../config/dbpool');



var SpaceWeather = function () {};


SpaceWeather.refresh = function() {
    console.log("Space weather refresh");
    SpaceWeather.summary();
    SpaceWeather.today();
}



SpaceWeather.today = function() {
    /**
     * Create the list of space weather for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT message_type,name,issuetime,description from spaceweather_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/cache/spaceweather_data.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {

                        var data = "<h3>";


                        if (item.message_type === "ALT") {
                            data += "<font color=\"Crimson\">Alert : ";
                        } else if (item.message_type === "WAR") {
                            data += "<font color=\"SandyBrown\"> Warning : ";
                        } else if (item.message_type === "SUM") {
                            data += "<font color=\"Yellow\"> Summary : ";
                        } else if (item.message_type === "WAT") {
                            data += "<font color=\"Yellow\"> Watch : ";
                        } else {
                            data += "<font color=\"Green\">";
                        }
                        data += item.name + "</font></h3>";

                        data += "<p class='post-info'> Issued " + item.issuetime + "</p>";

                        data += "<p><table><tr><th>Title</th><th>Information</th></tr>";

                        item.description.split("\r\n").forEach( function( line) {


                            var parts = line.split(":");
                            if( undefined != parts[0] && undefined !=parts[1]) {
                                data += "<tr>";
                                data += "<td>";
                                data += parts[0];
                                data += "</td>";
                                data += "<td>";
                                data += parts[1];
                                data += "</td>";
                                data += "</tr>";
                            }


                        })


                        data += "</table></p>";


                        fileStream.write( data + "\n");

                    } );

                    fileStream.end();

                }
                else {
                    console.log('Error while performing Query.');
                }
                conn.release();
            }
        )
    });
}


SpaceWeather.summary = function() {
    /**
     * Create the list of virus for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * FROM spaceweather_summary_view ORDER BY date DESC limit 7', function (err, rows) {
                if (!err) {

                    var path = "views/cache/spaceweather_summary.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {


                        var row = "<tr>";
                        row += "<td><a href=\"spaceweather?date=" + formatLinkDate(item.date) + "\">" + formatSummaryDate(item.date) + "</a></td>";
                        row += "<td>" + item.count + "</td>";
                        row += "<td><a href=\"spaceweather?date=" + formatLinkDate(item.date) + "\">View</a></td>";
                        row += "</tr>";

                        fileStream.write( row + "\n");

                    } );

                    fileStream.end();

                }
                else {
                    console.log('Error while performing Query.');
                }
                conn.release();
            }
        )
    });
}


function formatSummaryDate(d) {

    var year = d.getFullYear();
    var month = d.getMonth()+1;
    var day = d.getDate();

    if( month < 10 ) month = '0' + month;
    if( day < 10 ) day = '0' + day;

    return day + "-" + month + "-" + year;
}

function formatLinkDate(d) {

    var year = d.getFullYear();
    var month = d.getMonth()+1;
    var day = d.getDate();

    if( month < 10 ) month = '0' + month;
    if( day < 10 ) day = '0' + day;

    return year + "-" + month + "-" + day;
}

module.exports = SpaceWeather;