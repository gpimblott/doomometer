var fs = require("fs");
var dbpool = require('../config/dbpool');


var Alerts = function () {
};


Alerts.refresh = function () {
    console.log("Alerts refresh");
    //Alerts.summary();
}


Alerts.getAlerts = function (done) {
    /**
     * Create the list of virus for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * FROM alertstates  ', function (err, rows) {
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


module.exports = Alerts;