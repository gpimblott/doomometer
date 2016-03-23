var fs = require("fs");
var dbpool = require('../config/dbpool');
var dateutil = require('../utils/DateTime.js');


var Disasters = function () {
};


Disasters.refresh = function () {
    console.log("Disasters refresh");
    Disasters.getOpenmapPoints();
    //Disasters.summary();
    //Disasters.todayTable();
}

Disasters.getOpenmapPoints = function () {
    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from disasters_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/cache/disaster_data.txt";
                    var fileStream = fs.createWriteStream(path);

                    rows.forEach(function (item, index) {

                        var row = "features[" + index + "] = poi(";
                        row += item.id + ",";
                        row += "\"" + item.alert_level + "\",";
                        row += "\"" + item.url + "\",";
                        row += "\"" + item.name + "\",";
                        row += item.latitude + ",";
                        row += item.longitude;
                        row += ");"

                        fileStream.write(row + "\n");

                    });

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

Disasters.getForDate = function (d, done) {
    /**
     * Create the list of virus' for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query("SELECT url,name,description,fromdate,todate,id,alert_level from disasters where date(time)='" +
            d + "' order by fromdate desc limit 20", function (err, rows) {

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

Disasters.getForToday = function (done) {
    /**
     * Create the list of virus' for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT url,name,description,fromdate,todate,id,alert_level from disasters_today_view', function (err, rows) {

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

Disasters.getSummary = function (done) {
    /**
     * Create the list of virus for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * FROM disasters_summary_view ORDER BY date DESC limit 7', function (err, rows) {

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


module.exports = Disasters;