// Logging
var winston = require('winston');
winston.add(winston.transports.File, {
    filename: 'output.log',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: false
  });

winston.exitOnError = false;

winston.info("starting credentialsService");

var config = require('./config');

// Database connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://' + config.dbAddress + '/credentialsServiceDB');

// Uncaught exceptions handling
process.on('uncaughtException', function(err) {
  winston.error('Caught exception: ' + err);
  process.exit();
});

var userSchema = new mongoose.Schema({
	username: String,
	password: String
});

var UserModel = mongoose.model('UserModel', userSchema);

///////////////////////////////////////////////////////////////////////////////

var express = require('express');
var credentialsService = express();
var bodyParser = require("body-parser");
var auth = require('basic-auth');

//Here we are configuring express to use body-parser as middle-ware.
credentialsService.use(bodyParser.urlencoded({ extended: false }));
credentialsService.use(bodyParser.json());

credentialsService.get('/authenticate', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');

	var credentials = auth(req);

	var params = {};

	var credentials = auth(req)
	
	var username = credentials.name;
	var password = credentials.pass;
	
	winston.info("starting authentication for user " + username);
	winston.info("password: " + password);

	if (!credentials || credentials.name !== 'test' || credentials.pass !== 'test') {
		res.statusCode = 401
		res.end('Access denied')
	} else {
		res.end('Access granted')
	}
	var result = {};
	res.status(200).json(result);	

});

credentialsService.listen(config.httpPort);