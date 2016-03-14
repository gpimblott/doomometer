var fs = require("fs");
var dbpool = require('../config/dbpool');


var Disasters = function () {};


Disasters.refresh = function() {
    console.log("Disasters refresh");
    Disasters.today();
    Disasters.summary();
    Disasters.top30();
}

Disasters.today = function() {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from disasters_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/pages/disaster_data.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {

                        var row = "features[" + index + "] = poi(";
                        row += item.id + ",";
                        row += "\"" + item.alert_level + "\",";
                        row += "\"" + item.url + "\",";
                        row += "\"" + item.name + "\",";
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

Disasters.top30 = function() {
    /**
     * Create the list of virus' for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT url,name,description,fromdate,todate,id,alert_level from disasters_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/pages/disaster_top30.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {

                        var row = "<h3><a href=\"" + item.url + "\" target=\"_blank\">" + item.name + "</a></h3>";
                        row += "<p class='post-info'>From " + formatDate(item.fromdate) + " to " + formatDate(item.todate) + "</p>";
                        row += "<p>" + item.description + "</p>";


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

Disasters.summary = function() {
    /**
     * Create the list of virus for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * FROM disasters_summary_view ORDER BY date DESC limit 7', function (err, rows) {
                if (!err) {

                    var path = "views/pages/disaster_summary.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {


                        var row = "<tr>";
                        row += "<td><a href=\"disasters?date=" + formatLinkDate(item.date) + "\">" + formatSummaryDate(item.date) + "</a></td>";
                        row += "<td>" + item.count + "</td>";
                        row += "<td><a href=\"disasters?date=" + formatLinkDate(item.date) + "\">View</a></td>";
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

module.exports = Disasters;