#!/bin/env node
//  Doomometer
require('console-stamp')(console, '[ddd mmm dd HH:MM:ss]]');

var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var schedule = require('node-schedule');
var keepalive = require('./keepalive');

var stats = require('./db/overview');

var feeds = require('./feeds/feeds.js');
var cacheFiles = require('./db/cacheFiles.js');



/**
 *  Define the sample application.
 */
var DoomApp = function () {

        //  Scope.
        var self = this;


        /*  ================================================================  */
        /*  Helper functions.                                                 */
        /*  ================================================================  */

        /**
         *  Set up server IP address and port # using env variables/defaults.
         */
        self.setupVariables = function () {
            //  Set the environment variables we need.
            self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
            self.port = process.env.OPENSHIFT_NODEJS_PORT || 8090;

            if (typeof self.ipaddress === "undefined") {
                //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
                //  allows us to run/test the app locally.
                console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
                self.ipaddress = "127.0.0.1";
            }
            ;
        };


        /**
         *  terminator === the termination handler
         *  Terminate server on receipt of the specified signal.
         *  @param {string} sig  Signal to terminate on.
         */
        self.terminator = function (sig) {
            if (typeof sig === "string") {
                console.log('%s: Received %s - terminating sample app ...',
                    Date(Date.now()), sig);
                process.exit(1);
            }
            console.log('%s: Node server stopped.', Date(Date.now()));
        };


        /**
         *  Setup termination handlers (for exit and a list of signals).
         */
        self.setupTerminationHandlers = function () {
            //  Process on exit and signals.
            process.on('exit', function () {
                self.terminator();
            });

            // Removed 'SIGPIPE' from the list - bugz 852598.
            ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
                'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
            ].forEach(function (element, index, array) {
                process.on(element, function () {
                    self.terminator(element);
                });
            });
        };


        /*  ================================================================  */
        /*  App server functions (main app logic here).                       */
        /*  ================================================================  */

        /**
         *  Create the routing table entries + handlers for the application.
         */
        self.createRoutes = function () {


            self.app.get('/earthquakes', function (req, res) {
                res.render('pages/earthquakes.ejs')
            });

            self.app.get('/cyber' , function(req,res) {
                res.render('pages/cyber.ejs')
            });

            self.app.get('/disasters' , function(req,res) {
                res.render('pages/disasters.ejs')
            });

            self.app.get('/spaceweather' , function(req,res) {
                res.render('pages/spaceweather.ejs')
            });


            self.app.get('/alerts' , function(req,res) {
                res.render('pages/alerts.ejs')
            });

            self.app.get('/ping' , function (req,res) {
                console.log("ping");
                res.send('pong');
            });

            self.app.get('/about' , function(req,res) {
                res.render('pages/about.ejs');
            })

            self.app.get('/', function (req, res) {
                res.render('pages/index',
                    {   earthquakesToday : stats.earthquakesToday() ,
                        virusToday       : stats.virusToday(),
                        disastersToday   : stats.disastersToday(),
                        spaceWeatherToday: stats.spaceWeatherToday(),
                        averageMagnitude : stats.averageMagnitude(),
                        alertState       : stats.alertState() });
            });

            self.app.get('/test', function (req, res) {
                res.render('pages/index2',
                    {   earthquakesToday : stats.earthquakesToday() ,
                        virusToday       : stats.virusToday(),
                        disastersToday   : stats.disastersToday(),
                        spaceWeatherToday: stats.spaceWeatherToday(),
                        averageMagnitude : stats.averageMagnitude(),
                        alertState       : stats.alertState() });
            });

            self.app.get('/updatefeeds', function (req,res) {
                feeds.refresh();
                res.send("Feeds updated");
            })

            self.app.get('/updatecache', function (req,res) {
                cacheFiles.refresh();
                res.send("Cache  updated");
            })

        };



        /**
         * Create Cron jobs to Cache the slow changing data
         */
        self.createCronJobs = function () {

            console.log("Starting CRON jobs");

            var pingJob = schedule.scheduleJob('*/1 * * * *', function(){
                keepalive.ping();
            });

            var statsJob = schedule.scheduleJob('*/1 * * * *', function(){
                stats.refresh();
            });

            var cacheFilesJob = schedule.scheduleJob('*/5 * * * *', function(){
                cacheFiles.refresh();
            });


            var feedsJob = schedule.scheduleJob('*/30 * * * *', function(){
                feeds.refresh();
            });

        };


        /**
         *  Initialize the server (express) and create the routes and register
         *  the handlers.
         */
        self.initializeServer = function () {

            self.app = express();

            self.app.set('view engine', 'ejs');

            self.app.use(cookieParser());
            self.app.use(bodyParser.json());
            self.app.use(bodyParser.urlencoded({
                extended: true
            }));

            self.app.use(session({secret: 'mysecretkeyforthiscookie'}));

            self.createCronJobs();
            self.createRoutes();

            // Browser Cache
            var oneDay = 86400000;
            self.app.use('/', express.static('public', {maxAge: oneDay}));
        };


        self.initData = function() {
            feeds.refresh();
            cacheFiles.refresh();

        }

        /**
         *  Initializes the sample application.
         */
        self.initialize = function () {
            self.setupVariables();
            self.setupTerminationHandlers();

            // Create the express server and routes.
            self.initializeServer();

            // Initialise all of the tables etc before the schedules kick in
            self.initData();
        };


        /**
         *  Start the server (starts up the sample application).
         */
        self.start = function () {
            //  Start the app on the specific interface (and port).
            self.app.listen(self.port, self.ipaddress, function () {
                console.log('%s: Node server started on %s:%d ...',
                    Date(Date.now()), self.ipaddress, self.port);
            });
        };

    }
    ;
/*  Sample Application.  */


/**
 *  main():  Main code.
 */
var zapp = new DoomApp();
zapp.initialize();
zapp.start();

