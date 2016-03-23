/**
 * Database routines
 */
var earthquakes = require('./db/earthquakes.js');
var disasters = require('./db/disasters.js');
var alerts = require('./db/alerts.js');
var virus = require('./db/virus.js');
var spaceWeather = require('./db/spaceweather.js');

var bbc = require('./feeds/BBC.js');

var stats = require('./db/overview');


/**
 * Cache todays data and the summaries, it's not a lot and gets used all the time
 */
var earthquakesToday = null;
var earthquakesSummary = null;

var disastersToday = null;
var disastersSummary = null;

var virusToday = null;
var virusSummary = null;

var spaceWeatherToday = null;
var spaceWeatherSummary = null;

var alertsToday = null;


var Routes = function () {
};

/**
 * Keep a local copy of the data for the main default pages
 */
Routes.refreshCachedData = function () {

    // Overview stats
    stats.refresh();

    // Earthquakes
    earthquakes.getForToday(function (rows) {
        earthquakesToday = rows;
    });
    earthquakes.getSummary(function (rows) {
        earthquakesSummary = rows;
    });

    earthquakes.getOpenmapPoints();

    // Disasters
    disasters.getForToday(function (rows) {
        disastersToday = rows;
    });
    disasters.getSummary(function (rows) {
        disastersSummary = rows;
    });

    disasters.getOpenmapPoints();

    // Virus
    virus.getForToday(function (rows) {
        virusToday = rows;
    });
    virus.getSummary(function (rows) {
        virusSummary = rows;
    });

    // Alerts
    alerts.getAlerts(function (rows) {
        alertsToday = rows;
    });

    // Virus
    spaceWeather.getForToday(function (rows) {
        spaceWeatherToday = rows;
    });
    spaceWeather.getSummary(function (rows) {
        spaceWeatherSummary = rows;
    });
}

Routes.create = function (app) {

    /**
     * Home page
     */
    app.get('/', function (req, res) {
        res.render('pages/index',
            {
                earthquakesToday: stats.earthquakesToday(),
                virusToday: stats.virusToday(),
                disastersToday: stats.disastersToday(),
                spaceWeatherToday: stats.spaceWeatherToday(),
                averageMagnitude: stats.averageMagnitude(),
                alertState: stats.alertState()
            });
    });

    /**
     * Earthquakes
     */
    app.get('/earthquakes', function (req, res) {
        var date = req.query.date;

        if (date != undefined) {
            earthquakes.getForDate(date, function (rows) {
                res.render('pages/earthquakes.ejs', {rows: rows, summary: earthquakesSummary});
            });
        } else {
            res.render('pages/earthquakes.ejs', {rows: earthquakesToday, summary: earthquakesSummary});
        }
    });


    /**
     * Disasters
     */
    app.get('/disasters', function (req, res) {
        var date = req.query.date;

        if (date != undefined) {
            disasters.getForDate(date, function (rows) {
                res.render('pages/disasters.ejs', {rows: rows, summary: disastersSummary});
            });
        } else {
            res.render('pages/disasters.ejs', {rows: disastersToday, summary: disastersSummary});
        }

    });

    /**
     * Alerts
     */
    app.get('/alerts', function (req, res) {
        res.render('pages/alerts.ejs', {rows: alertsToday});
    });


    /**
     * Cyber threats
     */
    app.get('/cyber', function (req, res) {
        var date = req.query.date;

        if (date != undefined) {
            virus.getForDate(date, function (rows) {
                res.render('pages/cyber.ejs', {rows: rows, summary: virusSummary});
            });
        } else {
            res.render('pages/cyber.ejs', {rows: virusToday, summary: virusSummary});
        }

    });

    app.get('/spaceweather', function (req, res) {
        var date = req.query.date;

        if (date != undefined) {
            spaceWeather.getForDate(date, function (rows) {
                res.render('pages/spaceweather.ejs', {rows: rows, summary: spaceWeatherSummary});
            });
        } else {
            res.render('pages/spaceweather.ejs', {rows: spaceWeatherToday, summary: spaceWeatherSummary});
        }
    });


    /**
     * Ping/pong to keep service awake
     */
    app.get('/ping', function (req, res) {
        res.send('pong');
    });


    app.get('/about', function (req, res) {
        res.render('pages/about.ejs');
    })

    app.get('/news', function (req, res) {
        res.render('pages/news.ejs');
    })


    app.get('/bbc', function (req, res) {
        bbc.refresh();
        res.send("Parsing BBC news");
    })
}

module.exports = Routes;