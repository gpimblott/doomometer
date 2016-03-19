var fs = require("fs");
var dbpool = require('../config/dbpool');



var Alerts = function () {};


Alerts.refresh = function() {
    console.log("Alerts refresh");
    Alerts.summary();
}


Alerts.summary = function() {
    /**
     * Create the list of virus for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * FROM alertstates  ', function (err, rows) {
                if (!err) {

                    var path = "views/pages/alerts.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach( function (item, index) {


                        var title = "<h3><a href=\"" + item.url + "\" target=\"_blank\">";
                        title += item.source + " : ";
                        title += item.title + " : ";
                        title += item.state + "</a></h3>";

                        fileStream.write( title + "\n");

                        fileStream.write(  "<p class='post-info'> Issued " + item.issuetime +  "</p>");


                        var table = "<table>";
                        table += "<tr><th>Description</th><th></th></tr>";
                        table += "<tr>";
                        table += "<td>" + item.description + "</td>";
                        table += "<td> <a href ";
                        table += "\"" + item.url + "\" target=\"_blank\">";
                        table += "<img src=\"" + item.imageurl + "\" alt=\"Threat state\" </a>";
                        table += "</td></tr>";
                        table += "</table>";


                        fileStream.write( table + "\n");

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



module.exports = Alerts;