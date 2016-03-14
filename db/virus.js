var fs = require("fs");
var dbpool = require('../config/dbpool');


var Virus = function () {};


Virus.refresh = function() {
    console.log("Virus refresh");
    Virus.summary();
    Virus.top30();
}


Virus.top30 = function() {
    /**
     * Create the list of virus' for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT url,name,time from virus_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/pages/virus_top30.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {

                        var date = new Date( item.time );

                        var row = "<tr>";
                        row += "<td><a href=\"" + item.url + "\" target=\"_blank\">" + item.description + "</a></td>";
                        row += "<td>" + item.name + " km</td>";
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

Virus.summary = function() {
    /**
     * Create the list of virus for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from virus_summary_view order by date desc limit 7', function (err, rows) {
                if (!err) {

                    var path = "views/pages/virus_summary.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {

                        var row = "<tr>";
                        row += "<td><a href=\"virus?date=" + formatLinkDate(item.date) + "\">" + formatSummaryDate(item.date) + "</a></td>";
                        row += "<td>" + item.count + "</td>";
                        row += "<td><a href=\"virus?date=" + formatLinkDate(item.date) + "\">View</a></td>";
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

module.exports = Virus;