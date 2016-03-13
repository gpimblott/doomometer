var fs = require("fs");
var dbpool = require('./config/dbpool');

var OverviewStats = function () {};

/**
 * Summary statistics
 */
var earthquakesToday = 0;
var virusToday = 0;
var disastersToday = 0;
var spaceWeatherToday = 0;
var averageMagnitude = 0;
var alertState = 'UNKNOWN';

OverviewStats.earthquakesToday = function() {
    return earthquakesToday;
}

OverviewStats.virusToday = function() {
    return virusToday;
}

OverviewStats.disastersToday = function() {
    return disastersToday;
}

OverviewStats.spaceWeatherToday = function() {
    return spaceWeatherToday;
}

OverviewStats.averageMagnitude = function() {
    return averageMagnitude;
}

OverviewStats.alertState = function() {
    return alertState;
}

/**
 *
 */
OverviewStats.update = function () {
    dbpool.getConnection(function (err, conn) {
        conn.query('SELECT count(*) as num from spaceweather_today_view', function (err, rows) {
                if (!err) {
                    spaceWeatherToday = rows[0].num;

                    console.log('Space weather: ', spaceWeatherToday);
                }
                else {
                    console.log('Error while performing Query.');
                }
                conn.release();
            }
        )
    });


    dbpool.getConnection(function (err, conn) {
        conn.query('SELECT count(*) as num from earthquakes_today_view', function (err, rows) {
                if (!err) {
                    earthquakesToday = rows[0].num;

                    console.log('Earthquakes: ', earthquakesToday);
                }
                else {
                    console.log('Error while performing Query.');
                }
                conn.release();
            }
        )
    });

    dbpool.getConnection(function (err, conn) {
        conn.query('SELECT count(*) as num from virus_today_view', function (err, rows) {
                if (!err) {
                    virusToday = rows[0].num;

                    console.log('Virus: ', virusToday);
                }
                else {
                    console.log('Error while performing Query.');
                }
                conn.release();
            }
        )
    });

    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT count(*) as num from disasters_today_view', function (err, rows) {
                if (!err) {
                    disastersToday = rows[0].num;

                    console.log('Disaster: ', disastersToday);
                }
                else {
                    console.log('Error while performing Query.');
                }
                conn.release();
            }
        )
    });

    dbpool.getConnection(function (err, conn) {
        conn.query('SELECT ROUND( AVG( magnitude ) , 2 ) as avg from earthquakes_today_view', function (err, rows) {
                if (!err) {
                    averageMagnitude = rows[0].avg;

                    console.log('Magnitude average: ', averageMagnitude);
                }
                else {
                    console.log('Error while performing Query.');
                }
                conn.release();
            }
        )
    });

    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT state FROM alertstates ORDER BY issuetime DESC limit 1', function (err, rows) {
                if (!err) {
                    alertState = rows[0].state;

                    console.log('Alert State: ', alertState);
                }
                else {
                    console.log('Error while performing Query.');
                }
                conn.release();
            }
        )
    });


    /**
     * Create the list of earthquakes for the front page
     */
    dbpool.getConnection(function (err, conn) {

        conn.query('SELECT * from earthquakes_today_view', function (err, rows) {
                if (!err) {

                    var path = "views/pages/earthquake_data.txt";
                    var fileStream = fs.createWriteStream(path);

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

};



module.exports = OverviewStats;