// expose our config directly to our application using module.exports
module.exports = {

	'mysql' : {
		'username'  : process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'adminrgv1vJT',
		'password'  : process.env.OPENSHIFT_MYSQL_DB_PASSWORD || 'paI-zSrdy52T',
		'host'   	: process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost',
		'port'   	: process.env.OPENSHIFT_MYSQL_DB_PORT || 3306,
		'dbname' 	: 'doomometer'
	}

};

