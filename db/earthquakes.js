var fs = require("fs");
var dbpool = require('../config/dbpool');


var Earthquakes = function () {};


Earthquakes.refresh = function() {
    console.log("Earthquakes refresh");
    Earthquakes.today();
    Earthquakes.top30();
    Earthquakes.summary();
}

Earthquakes.today = function() {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from earthquakes_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/pages/earthquake_data.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {


                        var row = "features[" + index + "] = poi(";
                        row += item.id + ",\"";

                        var size = "small";
                        if(item.magnitude<2.0) {
                            size="small";
                        } else if(item.magnitude<3.0) {
                            size="medium";
                        } else if(item.magnitude>3.0) {
                            size="large";
                        }

                        row += size + "\",";
                        row += "\"" + item.url + "\",";
                        row += "\"" + item.description + "\",";
                        row += item.latitude + ",";
                        row += item.longitude ;
                        row += ");"

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

Earthquakes.top30 = function() {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT url,description,depth,time from earthquakes_today_view order by magnitude desc limit 20', function (err, rows) {
                if (!err) {

                    var path = "views/pages/earthquake_top30.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {

                        var date = new Date( item.time );

                        var row = "<tr>";
                        row += "<td><a href=\"" + item.url + "\" target=\"_blank\">" + item.description + "</a></td>";
                        row += "<td>" + item.depth + " km</td>";
                        row += "<td>" + formatDate( item.time ) + "</td>";
                        row += "<td><a href=\"" + item.url + "\" target=\"_blank\">View</a></td>";
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

Earthquakes.summary = function() {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from earthquakes_summary_view order by date desc limit 7', function (err, rows) {
                if (!err) {

                    var path = "views/pages/earthquake_summary.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {

                        var row = "<tr>";
                        row += "<td><a href=\"earthquakes?date=" + formatLinkDate(item.date) + "\">" + formatSummaryDate(item.date) + "</a></td>";
                        row += "<td>" + item.count + "</td>";
                        row += "<td>" + item.average.toFixed(2) + "</td>";
                        row += "<td><a href=\"earthquakes?date=" + formatLinkDate(item.date) + "\">View</a></td>";
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


function formatDate(d) {

    var hrs = d.getUTCHours();
    var minute = d.getUTCMinutes();

    if( hrs < 10 ) hrs = '0' + hrs;
    if( minute < 10) minute = '0' + minute;

    return hrs + ":" + minute + " UTC";
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

module.exports = Earthquakes;