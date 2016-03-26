var fs = require("fs");
var dbpool = require('../config/dbpool');

var Earthquakes = function () {};



Earthquakes.getOpenmapPoints = function() {

    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from earthquakes_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/earthquake_data.txt";
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



Earthquakes.getForDate = function(d, done) {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query("SELECT url,description,depth,time from earthquakes where date(time)='" +
                        d + "' order by magnitude desc limit 20", function (err, rows) {
                conn.release();
                if (err) {
                    console.log('Error while performing Query.');
                } else {
                    done(rows);
                }
            }

        )
    });
}

Earthquakes.getForToday = function(done) {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT url,description,depth,time from earthquakes_today_view order by magnitude desc limit 20', function (err, rows) {
                conn.release();
                if (err) {
                    console.log('Error while performing Query.');
                } else {
                    done(rows);
                }
            }
        )
    });
}


Earthquakes.getSummary = function(done) {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from earthquakes_summary_view order by date desc limit 7', function (err, rows) {
            conn.release();
                if (err) {
                    console.log('Error while performing Query.');
                } else {
                    done(rows);
                }

            }
        )
    });
}



module.exports = Earthquakes;