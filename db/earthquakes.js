var fs = require("fs");
var dbpool = require('../config/dbpool');
var datetime = require('../utils/DateTime.js');

var Earthquakes = function () {};


Earthquakes.refresh = function() {
    console.log("Earthquakes refresh");


    Earthquakes.openmapPoints();
    Earthquakes.todayTable();
    Earthquakes.summary();
}

Earthquakes.openmapPoints = function() {

    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from earthquakes_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/cache/earthquake_data.txt";
                    var fileStream = fs.createWriteStream(path);

                    fileStream.write("// Created : " + new Date().toISOString() + "\n")

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

Earthquakes.todayTable = function() {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT url,description,depth,time from earthquakes_today_view order by magnitude desc limit 20', function (err, rows) {
                if (!err) {

                    var path = "views/cache/earthquake_top30.txt";
                    var fileStream = fs.createWriteStream(path);


                    fileStream.write("<!-- " + new Date().toISOString() + "-->\n")

                    fileStream.write("<p> Strongest 20 earthquakes in the last 24 hrs </p>");

                    fileStream.write(" <table>" );
                    fileStream.write("<tr>");
                    fileStream.write("<th>Description</th><th>Depth</th><th>Time</th><th></th>");
                    fileStream.write("</tr>");

                    rows.forEach( function (item, index) {

                        var date = new Date( item.time );

                        var row = "<tr>";
                        row += "<td><a href=\"" + item.url + "\" target=\"_blank\">" + item.description + "</a></td>";
                        row += "<td>" + item.depth + " km</td>";
                        row += "<td>" + datetime.DDMM_Time( item.time ) + "</td>";
                        row += "<td><a href=\"" + item.url + "\" target=\"_blank\">View</a></td>";
                        row += "</tr>";

                        fileStream.write( row + "\n");

                    } );

                    fileStream.write("</table>");
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

Earthquakes.summary = function() {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from earthquakes_summary_view order by date desc limit 7', function (err, rows) {
                if (!err) {

                    var path = "views/cache/earthquake_summary.txt";
                    var fileStream = fs.createWriteStream(path);

                    fileStream.write("<!-- " + new Date().toISOString() + "-->\n")
                    fileStream.write("<table><tr>");
                    fileStream.write("<tr><th>Date</th><th>Total earthquakes</th><th>Average Magnitude</th></tr>");

                    rows.forEach( function (item, index) {

                        var row = "<tr>";
                        row += "<td><a href=\"earthquakes?date=" + datetime.formatLinkDate(item.date) + "\">" + datetime.DDMMYY(item.date) + "</a></td>";
                        row += "<td>" + item.count + "</td>";
                        row += "<td>" + item.average.toFixed(2) + "</td>";
                        row += "<td><a href=\"earthquakes?date=" + datetime.formatLinkDate(item.date) + "\">View</a></td>";
                        row += "</tr>";

                        fileStream.write( row + "\n");

                    } );

                    fileStream.write("</table>");
                    fileStream.write("<p><i>Generated " + new Date().toISOString() + "</i></p>")
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



module.exports = Earthquakes;