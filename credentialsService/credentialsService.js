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
	
	if (checkCredentials(credentials)) {
		res.status(200);
		res.end('Access granted');
	} else {
		res.status(401);
		res.end('Access denied');
	}
	
});

credentialsService.post('/createUser', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');

	var credentials = auth(req);
	if (checkCredentials(credentials) && validUser(req.body) ) {
		createUser(req.body, res);
		res.status(201).send();
	} else {
		winston.info("Cannot create user");
		res.status(400).send();
	}
});


credentialsService.get('/users', function(req, res) {
	var credentials = auth(req);
	if (checkCredentials(credentials)) {
		UserModel.find({}, function(err, users) {
			if (err) {
				winston.error("Error while getting users: " + err);
				res.status(500).send();
				return;
			}
			var result = {
				users : []
			};
			for (var i = 0; i < result.length; ++i) {
				result.users.push({
					username : users[i].username
				});
			}
			res.status(200).json(result);
		});
	} else {
		res.status(401);
		res.end('Access denied');
	}
});


function checkCredentials(credentials) {
	if(credentials && credentials.name === 'test' && credentials.pass === 'test') {
		winston.info("Starting authentication for user " + credentials.name);
		return true;
	} else {
		winston.info("Invaild credentials");
		return false;
	}
}

var validUserResult;
function validUser(body) {
	validUserResult = 'undefined';
	if(body.username && body.password) {
		checkIfUserExists(body.username, function(out) {return !out;/*winston.info("out " + out)*/;});
//		while(validUserResult === 'undefined') {
//			sleep(1000);
//			winston.info("sleeping...");
//		} 
		winston.info("LOG " + validUserResult);
		//return !validUserResult;
	} else {
		return false;
	}
}

function sleep(milliseconds) {
	  var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

function checkIfUserExists(user, callback) {
	UserModel.findOne({
		username : user
	}, function(err, metadata) {
		if (!metadata) {
			winston.info("User " + user + " doesnot exist");
			callback(complete(false));
		} else {
			var result = metadata.username;
			winston.info("User " + result + " exists");
			callback(complete(true));
		}
	});	
	function complete(value) {
		winston.info("LOG comp " + value);
		return value;
	}
}


function createUser(body, res) {
	var data = {};

	data.username = body.username;
	data.password = body.password;

	UserModel.create(data, function(err, metadata) {
		if (err) {
			winston.error("Error while user creating: " + err);
			res.status(500).send();
			return;
		} else {
			winston.info("User " + metadata.username + " created");
			res.status(201).send();
		}
	});
}

credentialsService.listen(config.httpPort);