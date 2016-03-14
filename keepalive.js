var http = require('http');

var Keepalive = function () {
};

Keepalive.ping = function () {

    http.get({
        hostname: 'doomometer-gpimblott.rhcloud.com',
        port: 80,
        path: '/ping',
        agent: false  }, (res) => {

        console.log("Pinged server");
    });

};

module.exports = Keepalive;