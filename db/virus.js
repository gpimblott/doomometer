var fs = require("fs");
var dbpool = require('../config/dbpool');

var Virus = function () {};



Virus.getForToday = function( done ) {
    /**
     * Create the list of virus' for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT url,name,time from virus_today_view', function (err, rows) {
                if (err) {
                    console.log('Error while performing Query.');
                } else {
                    done( rows );
                }
                conn.release();
            }
        )
    });
}

Virus.getForDate = function(d, done) {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query("SELECT url,name,time from virus where date(time)='" +
            d + "' order by time desc limit 20", function (err, rows) {

                if (err) {
                    console.log('Error while performing Query.');
                } else {
                    done(rows);
                }
            conn.release();
            }

        )
    });
}

Virus.getSummary = function( done ) {
    /**
     * Create the list of virus for the summary
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from virus_summary_view order by date desc limit 7', function (err, rows) {
                if (err) {
                    console.log('Error while performing Query.');
                } else {
                    done( rows );
                }
                conn.release();
            }
        )
    });
}


module.exports = Virus;