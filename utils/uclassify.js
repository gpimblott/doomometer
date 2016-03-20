var https = require('https');

var host = 'api.uclassify.com'
var endpoint = '/v1/uClassify/Sentiment/classify';
var apiKey = 'Token dCcqN2x5dECq';
var method = 'POST';


var uclassify = function () {
};


uclassify.performRequest = function (data, success) {

   // var dataString = JSON.stringify(data);
    var dataString = data;

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length,
        'Authorization': apiKey
    };

    var options = {
        host: host,
        path: endpoint,
        method: method,
        headers: headers
    };

    var req = https.request(options, function (res) {
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            console.log(responseString);
            var responseObject = JSON.parse(responseString);
            success(responseObject);
        });
    });

    req.write(dataString);
    req.end();
}

module.exports=uclassify;
