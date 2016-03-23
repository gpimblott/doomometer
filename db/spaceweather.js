var dbpool = require('../config/dbpool');


var SpaceWeather = function () {
};


SpaceWeather.getForToday = function (done) {
    /**
     * Create the list of space weather for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT message_type,name,issuetime,description from spaceweather_today_view', function (err, rows) {
                if (err) {
                    console.log('Error while performing Query.');
                }
                done(rows);
                conn.release();
            }
        )
    });
}


SpaceWeather.getForDate = function (d , done) {
    /**
     * Create the list of space weather for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query("SELECT message_type,name,issuetime,description from spaceweather where date(issuetime)='" +
                            d + "' order by issuetime desc", function (err, rows) {
                if (err) {
                    console.log('Error while performing Query.');
                }
                done(rows);
                conn.release();
            }
        )
    });
}


SpaceWeather.getSummary = function (done) {
    /**
     * Create the list of virus for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * FROM spaceweather_summary_view ORDER BY date DESC limit 7', function (err, rows) {
                if (err) {
                    console.log('Error while performing Query.');
                }
                done(rows);
                conn.release();
            }
        )
    });
}

module.exports = SpaceWeather;