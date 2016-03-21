var fs = require("fs");
var dbpool = require('../config/dbpool');
var dateutil = require('../utils/DateTime.js');


var Disasters = function () {};


Disasters.refresh = function() {
    console.log("Disasters refresh");
    Disasters.openmapPoints();
    Disasters.summary();
    Disasters.todayTable();
}

Disasters.openmapPoints = function() {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from disasters_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/cache/disaster_data.txt";
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

Disasters.todayTable = function() {
    /**
     * Create the list of virus' for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT url,name,description,fromdate,todate,id,alert_level from disasters_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/cache/disaster_top30.txt";
                    var fileStream = fs.createWriteStream(path);

                    fileStream.write("<!-- " + new Date().toISOString() + "-->\n")


                    rows.forEach( function (item, index) {

                        var row = "<h3><a href=\"" + item.url + "\" target=\"_blank\">" + item.name + "</a></h3>";
                        row += "<p class='post-info'>From " + dateutil.DDMMYY_Time(item.fromdate) +
                            " to " + dateutil.DDMMYY_Time(item.todate) + "</p>";
                        row += "<p>" + item.description + "</p>";


                        fileStream.write( row + "\n");

                    } );

                    fileStream.write("<p><i> Generated " + new Date().toISOString() + " </i></p>");
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

                    var path = "views/cache/disaster_summary.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {


                        var row = "<tr>";
                        row += "<td><a href=\"disasters?date=" + dateutil.formatLinkDate(item.date) + "\">" + dateutil.DDMMYY(item.date) + "</a></td>";
                        row += "<td>" + item.count + "</td>";
                        row += "<td><a href=\"disasters?date=" + dateutil.formatLinkDate(item.date) + "\">View</a></td>";
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



module.exports = Disasters;