var fs = require("fs");
var dbpool = require('../config/dbpool');
var datetime = require('../utils/DateTime.js');

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

Earthquakes.top30 = function() {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT url,description,depth,time from earthquakes_today_view order by magnitude desc limit 20', function (err, rows) {
                if (!err) {

                    var path = "views/cache/earthquake_top30.txt";
                    var fileStream = fs.createWriteStream(path);


                    fileStream.write("<!-- " + new Date().toISOString() + "-->\n")


                    rows.forEach( function (item, index) {

                        var date = new Date( item.time );

                        var row = "<tr>";
                        row += "<td><a href=\"" + item.url + "\" target=\"_blank\">" + item.description + "</a></td>";
                        row += "<td>" + item.depth + " km</td>";
                        row += "<td>" + datetime.formatDate( item.time ) + "</td>";
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

                    var path = "views/cache/earthquake_summary.txt";
                    var fileStream = fs.createWriteStream(path);

                    fileStream.write("<!-- " + new Date().toISOString() + "-->\n")

                    rows.forEach( function (item, index) {

                        var row = "<tr>";
                        row += "<td><a href=\"earthquakes?date=" + datetime.formatLinkDate(item.date) + "\">" + datetime.formatSummaryDate(item.date) + "</a></td>";
                        row += "<td>" + item.count + "</td>";
                        row += "<td>" + item.average.toFixed(2) + "</td>";
                        row += "<td><a href=\"earthquakes?date=" + datetime.formatLinkDate(item.date) + "\">View</a></td>";
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



module.exports = Earthquakes;