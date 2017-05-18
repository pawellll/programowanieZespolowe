var config = require('./config');

// Database connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://' + config.dbAddress + '/monitordb');

// Logging
var winston = require('winston');
winston.add(winston.transports.File, {
    filename: 'output.log',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: false
  });
winston.exitOnError = false;

process.on('uncaughtException', function(err) {
  winston.error('Caught exception: ' + err);
  process.exit();
});

var sensorMetadataSchema = new mongoose.Schema({
	resourceId: String,
	hostName:String,
	unit: String,
	metricName: String,
	description: String,
	resourceName: String,
	time: Date,
	isComposite: Boolean
});

var SensorMetadata = mongoose.model('SensorMetadata', sensorMetadataSchema);

var sensorMeasurementSchema = new mongoose.Schema({
	resourceId: String,
	time: Date,
	value: Number
});

var SensorMeasurement = mongoose.model('SensorMeasurement', sensorMeasurementSchema);

///////////////////////////////////////////////////////////////////////////////

var sensorsCount = config.sensorsCount;
var sensorsData = config.sensorsData;

var net = require('net');


// reading measurments from sensors and saving to database

for (var i = 0; i < sensorsCount; ++i) {
	net.createServer(function(socket) {
		socket.on('data', function(data) {
			data = JSON.parse(data);
			
			if (data.resourceName) { // metadata json

				winston.info("received metadata from:" + data.resourceId + " hostName:" + data.hostName);

				data.isComposite = 'false';

				SensorMetadata.findOne({resourceId: data.resourceId}, function(err, metadata) {
					if (metadata) {
						SensorMetadata.update({resourceId: data.resourceId}, data, function(err, metadata) {
							if (err) winston.error(err);
						});
					} else {
						SensorMetadata.create(data, function(err, metadata) {
							if (err) winston.error(err);
						});
					}
				});
			} else { // measurement json
				winston.info("received measurement from:" + data.resourceId);
				SensorMeasurement.create(data, function(err, measurement) {
					if (err) winston.error(err);
				});
			}
		});

		socket.on("error", function(err) {
			winston.error(err);
		});
		
	}).listen(sensorsData[i].port);
}

///////////////////////////////////////////////////////////////////////////////

var express = require('express');
var app = express();
var bodyParser = require("body-parser");

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/measurements', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');

	winston.info("get /measurements");

	var params = {};

	// change names of the parameters passed in query
	// to names of the parameters used in database
	for (var key in req.query) {
		if (req.query.hasOwnProperty(key)) {
			if (key == 'unit')
				params.unit = req.query[key] == '%' ? 'percent' : req.query[key];
			else if (key == 'isComposite')
				params.isComposite = req.query[key];

		}
	}

	if (req.query["resource"]) {
		params.resourceName = createRegEx(req.query["resource"]);
	}

	if (req.query["metric"]) {
		params.metricName = createRegEx(req.query["metric"]);
	}

	if (req.query["description"]) {
		params.description = createRegEx(req.query["description"]);
	}

	winston.info("params:");
	winston.info(params);

	SensorMetadata.find(params, function(err, metadatas) {
		if (err) {
			winston.error(err);
			res.status(500).send();
			return;
		}
		
		var resJson = {streams: []};
		for (var i = 0; i < metadatas.length; ++i) {		
			resJson.streams.push({
				id: metadatas[i].resourceId,
				location: config.location + metadatas[i].resourceId,
				metadata: {
					resourceName: metadatas[i].resourceName,
					metricName: metadatas[i].metricName,
					unitName: metadatas[i].unitName,
					description: metadatas[i].description
				}
			});
		}
		
		res.status(200).json(resJson);	
	});
});

app.get('/hosts', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	
	winston.info("get /hosts");

	var params = {};

	if (req.query["name"]) {
		params.hostName = createRegEx(req.query["name"]);
	}

	winston.info("params:");
	winston.info(params);

	SensorMetadata.find(params, function(err, foundSensors) {

		if (err) {
			winston.error(err);
			res.status(500).send();
			return;
		}
		
		var hostNames = [];
		
		for(var i = 0; i<foundSensors.length; ++i) {
			var hostName = foundSensors[i].hostName;
			hostNames.push(hostName);
		}

		hostNames = hostNames.unique();

		var resJson = {hosts: []};

		for(var i = 0 ; i < hostNames.length; ++i) {
			var hostName = hostNames[i];
			var streams = [];

			addSensorsToHost(hostName, foundSensors, streams);

			resJson.hosts.push({hostName, "streams":streams});
		}

		winston.info("Found sensors:");
		winston.info(foundSensors);
	
		res.status(200).json(resJson);	
	});
});

function addSensorsToHost(hostName, foundSensors, streams) {

	for(var i = 0; i < foundSensors.length; ++i) {
		if (foundSensors[i].hostName === hostName) {
			var properSensorObject = convertToProperSensorObject(foundSensors[i]);
			streams.push(properSensorObject);
		}
	}

}

function convertToProperSensorObject(dbSensorObject) {
	var properSensorObject = {};

	properSensorObject["id"] = dbSensorObject.resourceId;
	properSensorObject["location"] = config.location + dbSensorObject.resourceId;
	properSensorObject["metadata"] = {};
	properSensorObject["metadata"]["resourceName"] = dbSensorObject.resourceName;
	properSensorObject["metadata"]["metricName"] = dbSensorObject.metricName;
	properSensorObject["metadata"]["unitName"] = dbSensorObject.unit;
	properSensorObject["metadata"]["description"] = dbSensorObject.description;
	properSensorObject["metadata"]["isComposite"] = dbSensorObject.isComposite;

	return properSensorObject;
}

app.get('/measurements/:id', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');

	winston.info("/measurements/{id} id:" + req.params.id + " limit:" + req.query.limit);
	
	var limit = 10;

	if (req.query.limit) {
		limit = req.query.limit;
	}

	if (!isInt(limit)) {
		winston.info("incorrect argument: limit is not integer");
    	res.status(400).send();	
    	return;		
	}
 
 	var result = {};

	SensorMetadata.findOne({resourceId: req.params.id}, function(err, metadata) {
		if (!metadata) {
			winston.info("sensor with given id not found");
			res.status(404).send();		
			return;
		}

		winston.info(metadata);

		result["metadata"] = {};
		result["metadata"]["resourceName"] = metadata.resourceId;
		result["metadata"]["metricName"] = metadata.metricName;
		result["metadata"]["unitName"] = metadata.unit;
		result["metadata"]["description"] = metadata.description;
		result["metadata"]["isComposite"] = metadata.isComposite;

		result["measurements"] = [];

		//get measurements here
		SensorMeasurement.find({resourceId:req.params.id}).sort({time: -1}).limit(Number(limit)).exec(function(err, measurements) {

			if (err) {
					winston.error("Error:");
					winston.error(err);
					res.status(500).send();
					return;
			}

			if (!measurements) {
				winston.info("no measurements found for id:" + req.params.id);
			} else {
				winston.info("adding " + measurements.length + " measurements");

				var table = []

				for(var i = 0; i <measurements.length; ++i) {

					var measurement = {value:(measurements[i]).value ,timestamp:(measurements[i]).time.getTime()}
					table.push(measurement);
				}

				result["measurements"] = table;
			}

			res.status(200).json(result);

		});
	});

});

app.post('/measurements', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	
	winston.info("create composite, body:");
	winston.info(req.body);

	if (checkParameters(req.body)) {
		addMeasurement(req.body, res);
	} else {
		winston.info("incomplete or incorrect parameters");
		res.status(400).send();
	}

});

var measurementsCounter = 1;
var compositeJobs = [];

function addMeasurement(body, res) {
	
	SensorMetadata.findOne({resourceId: body.id}, function(err, metadata) {

		if (!metadata) {
			winston.info("measurment to create composite not found")
			res.status(400).send();		
			return;
		}

		var data = {};
		
		data.resourceId = 'Composite_' + getRandomInt(1, 100000);
		data.unit = metadata.unit;
		data.metricName = body.name;
		data.description = 'period:' + body.period + ' interval:' + body.interval;
		data.resourceName = body.name;
		data.time = new Date();
		data.isComposite = true;

		SensorMetadata.create(data, function(err, metadata) { 

			if (err) {
				winston.error("err:" + err); 
				res.status(400).send();
			} else {
				res.status(201).send();
			}

		});

		winston.info("Adding job with params period:" + body.period + " id:" + body.id + " resourceId:" + data.resourceId);

		var jobId = setInterval(function() { movingAverage(body.period, body.id, data.resourceId); }, body.interval * 1000);
		compositeJobs[data.resourceId] = jobId;
		winston.info(compositeJobs);
	});
}

app.delete('/measurements', function (req, res) {
	res.header('Access-Control-Allow-Origin', '*');

	winston.info("delete measurement");

	var id = req.query.id;

	if (!id) {
		res.status(404).send();
	}

	// TODO: send statuses

	SensorMetadata.findOne({resourceId: id}, function(err, metadata) {

		if (!metadata || !metadata.isComposite) {
			winston.info("composite measurement with id:" + id + " doesn't exist");
			res.status(404).send();		
			return;
		}

		winston.info("delete measurement with id:" + id);

	
		SensorMetadata.remove({resourceId: id}, function(err, removed) {

			if (err) {
				winston.error("delete metadata error:" + err);
			} else {
				winston.info("delete metadata success. Stopping the job and deleting measurements");
				
				var jobObj = compositeJobs[id];

				if (jobObj) {
					winston.info("stopping the job");
					clearInterval(jobObj);
				} else {
					console.warn("there's no job in collection for given id");
				}
				

				SensorMetadata.remove({resourceId: id}, function(err, removed) {

					if (err) {
						winston.error("delete measurement error:" + err);
					} else {
						winston.info("delete measurement success");
						res.status(200).send();			
					}

				});

			}
		});

	});
});


function movingAverage(period, id, compositeId) {

	var currentTime = new Date();

	SensorMeasurement.find({resourceId: id, time: {$gt: currentTime.setSeconds(currentTime.getSeconds() - period)}}, function(err, measurements) {

		if (!measurements) {
			winston.info("measurement undefined, id:" + id + " compositeId:" + compositeId);
			return;
		}

		var sum = 0;

		for (var i = 0; i < measurements.length; ++i) {
			sum += measurements[i].value;
		}

		var avg = sum/measurements.length;

		var data = {};

		data.resourceId = compositeId;
		data.time = new Date();
		data.value = avg;

		SensorMeasurement.create(data, function(err, metadata) { 
			if (err) { 
				winston.error(err); 
			} else {
				winston.info("Composite measurement added");
			}
		});	

	});
}

function checkParameters(body) {
	return body.id && body.name && body.period && body.interval 
}

app.listen(config.httpPort);


//////////////////////// UTILS

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

function createRegEx(base) {
	// return { $regex: base + "*/" };
	return new RegExp(base + '*');
}

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
}
