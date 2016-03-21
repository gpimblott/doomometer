var fs = require("fs");
var dbpool = require('../config/dbpool');
var dateutil = require ('../utils/DateTime.js');

var Virus = function () {};


Virus.refresh = function() {
    console.log("Virus refresh");
    Virus.summary();
    Virus.todayTable();
}


Virus.todayTable = function() {
    /**
     * Create the list of virus' for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT url,name,time from virus_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/cache/virus_top30.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {

                        var date = new Date( item.time );

                        var row = "<tr>";
                        row += "<td><a href=\"" + item.url + "\" target=\"_blank\">" + item.name + "</a></td>";
                        row += "<td>" + dateutil.DDMM_Time( item.time ) + "</td>";
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

                    var path = "views/cache/virus_summary.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {

                        var row = "<tr>";
                        row += "<td><a href=\"virus?date=" + dateutil.formatLinkDate(item.date) + "\">" + dateutil.DDMMYY(item.date) + "</a></td>";
                        row += "<td>" + item.count + "</td>";
                        row += "<td><a href=\"virus?date=" + dateutil.formatLinkDate(item.date) + "\">View</a></td>";
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


module.exports = Virus;