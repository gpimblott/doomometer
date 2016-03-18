var mysql   = require('mysql');
var config  = require('./db');

var Database = function () {};

var pool = mysql.createPool({
    connectionLimit : 100,
    host     : config.mysql.host,
    user     : config.mysql.username,
    password : config.mysql.password,
    database : config.mysql.dbname,
    port     : config.mysql.port,
    debug    :  false
});

Database.getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
}


module.exports = Database;