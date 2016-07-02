// expose our config directly to our application using module.exports
module.exports = {

	'mysql' : {
		'username'  : process.env.OPENSHIFT_MYSQL_DB_USERNAME,
		'password'  : process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
		'host'   	: process.env.OPENSHIFT_MYSQL_DB_HOST,
		'port'   	: process.env.OPENSHIFT_MYSQL_DB_PORT,
		'dbname' 	: 'doomometer',
		'timezone'  : 'utc'
	}

};

