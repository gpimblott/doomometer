#!/bin/env node
//  Doomometer
// Load in the environment variables
require('dotenv').config({path: 'process.env'});

require('console-stamp')(console, '[ddd mmm dd HH:MM:ss]]');

var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var schedule = require('./schedule.js');

var routes = require('./routes.js');

var feeds = require('./feeds/feeds.js');

var dateUtils = require('./utils/DateTime');


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
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initialize = function () {
        self.setupVariables();
        self.setupTerminationHandlers();

        self.app = express();

        self.app.set('view engine', 'ejs');

        self.app.use(cookieParser());
        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded({
            extended: true
        }));
        

        // This is for the uClassify feed
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        // Start the scheduled activities
        schedule.start();

        // Browser Cache
        var oneDay = 86400000;
        self.app.use('/', express.static('public', {maxAge: oneDay}));

        // Setup the secret cookie key
        var cookie_key = process.env.COOKIE_KEY || 'aninsecurecookiekey';
        self.app.use(session({secret: cookie_key }));

        // Setup the Google Analytics ID if defined
        self.app.locals.google_id = process.env.GOOGLE_ID || undefined;


        console.log("GA ID:" + self.app.locals.google_id);
        console.log("Cookie key:" + cookie_key);

        // Setup functions to call from template
        self.app.locals.DDMM_Time = dateUtils.DDMM_Time;
        self.app.locals.DDMMYY_Time = dateUtils.DDMMYY_Time;
        self.app.locals.DDMMYY = dateUtils.DDMMYY;
        self.app.locals.formatLinkDate = dateUtils.formatLinkDate;

        // Create all the routes and refresh the cache
        routes.create(self.app);
        routes.refreshCachedData();

        // Kick off an initial update of the feeds
        feeds.refresh();
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

};


/**
 *  main():  Main code.
 */
var dapp = new DoomApp();
dapp.initialize();
dapp.start();

