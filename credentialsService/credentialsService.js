//String Variables
var LOG_FILE_NAME = 'output.log';
var STARTING_INFO = "CredentialsService started";
var AUTHENTICATE_ENDPOINT = '/authenticate';
var USERS_ENDPOINT = '/users';
var ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';
var ASTERISK = '*';
var ACCESS_GRANTED = "Access granted";
var ACCESS_DENIED = "Access denied";
var CANNOT_CREATE_USER = "Cannot create user: ";
var USER_EXIST = "User exists in database";
var INVAILD_REQUEST_BODY = "Invaild request body";
var ERROR_WHILE_GETTING_USERS = "Error while getting users: ";
var STARTING_AUTHENTICATION = "Starting authentication for user ";
var AUTHENTICATED = "Authenticated!";
var INVAILD_CREDENTIALS = "Invaild credentials";
var LACK_OF_CREDENTIALS = "Lack of credentials";
var USER = "User ";
var DOESNOT_EXIST = " doesnot exist";
var EXISTS = " exists";
var CREATED = " created";
var ERROR_WHILE_USER_CREATING = "Error while user creating: ";
var ERROR_WHILE_USER_REMOVING = "Error while user removing: ";
var USER_REMOVED = "User removed: ";

// Logging
var winston = require('winston');
winston.add(winston.transports.File, {
    filename: LOG_FILE_NAME,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: false
  });

winston.exitOnError = false;

winston.info(STARTING_INFO);

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
var cors = require('cors')

//Here we are configuring express to use body-parser as middle-ware.
credentialsService.use(bodyParser.urlencoded({ extended: false }));
credentialsService.use(bodyParser.json());
credentialsService.use(cors())

credentialsService.get(AUTHENTICATE_ENDPOINT, function(req, res) {
	res.header(ACCESS_CONTROL_ALLOW_ORIGIN, ASTERISK);

	checkCredentials(req, function(authResult){
		if(authResult){
			res.status(200);
			res.end(ACCESS_GRANTED);
		} else {
			res.status(401);
			res.end(ACCESS_DENIED);
		}
	});
});

credentialsService.post(USERS_ENDPOINT, function(req, res) {
	res.header(ACCESS_CONTROL_ALLOW_ORIGIN, ASTERISK);
			
	var username = req.body.username;
	var password = req.body.password;
			
	if (username && password) {
		checkIfUserExists(username, function(result) {
			var canCreateUser = result == false;
			if(canCreateUser) {
				createUser(req.body, res);
			} else {
				winston.info( CANNOT_CREATE_USER + USER_EXIST);
				res.status(409).send();
			}
		});
	} else {
		winston.info(CANNOT_CREATE_USER + INVAILD_REQUEST_BODY);
		res.status(400).send();
	}
});


credentialsService.get(USERS_ENDPOINT, function(req, res) {
	res.header(ACCESS_CONTROL_ALLOW_ORIGIN, ASTERISK);
	checkCredentials(req, function(authResult){
		if(authResult){
			UserModel.find({}, function(err, users) {
				if (err) {
					winston.error(ERROR_WHILE_GETTING_USERS + err);
					res.status(500).send();
					return;
				}
				var result = {
					users : []
				};
				for (var i = 0; i < users.length; ++i) {
					result.users.push({
						username : users[i].username
					});
				}
				res.status(200).json(result);
			});
		} else {
			res.status(401);
			res.end(ACCESS_DENIED);
		}
	});
});


credentialsService.delete(USERS_ENDPOINT, function(req, res) {
	res.header(ACCESS_CONTROL_ALLOW_ORIGIN, ASTERISK);
	checkCredentials(req, function(authResult){
		if(authResult){
			UserModel.remove( {				
				username : auth(req).name
			}, function(err, removed) {
				if (err) {
					winston.error(ERROR_WHILE_USER_REMOVING + err);
					res.status(500).send();			
				} else {
					winston.info(USER_REMOVED + auth(req).name);
					res.status(200).send();			
				}
			});
		} else {
			res.status(401);
			res.end(ACCESS_DENIED);
		}
	});
});

function checkCredentials(req, callback) {
	var credentials = auth(req);
	if(credentials) {
		winston.info(STARTING_AUTHENTICATION + credentials.name);
		var user = credentials.name;
		var password = credentials.pass;
		UserModel.findOne({
			username : user,
			password : password
		}, function(err, metadata) {
			if (!metadata) {
				winston.info(INVAILD_CREDENTIALS);
				callback(complete(false));
			} else {
				winston.info(AUTHENTICATED);
				callback(complete(true));
			}
		});	
	} else {
		winston.info(LACK_OF_CREDENTIALS);
		callback(complete(false));
	}
}

function checkIfUserExists(user, callback) {
	UserModel.findOne({
		username : user
	}, function(err, metadata) {
		if (!metadata) {
			winston.info(USER + user + DOESNOT_EXIST);
			callback(complete(false));
		} else {
			var result = metadata.username;
			winston.info(USER + result + EXISTS);
			callback(complete(true));
		}
	});	
}

function complete(value) {
	return value;
}

function createUser(body, res) {
	var data = {};

	data.username = body.username;
	data.password = body.password;

	UserModel.create(data, function(err, metadata) {
		if (err) {
			winston.error(ERROR_WHILE_USER_CREATING + err);
			res.status(500).send();
			return;
		} else {
			winston.info(USER + metadata.username + CREATED);
			res.status(201).send();
		}
	});
}

credentialsService.listen(config.httpPort);