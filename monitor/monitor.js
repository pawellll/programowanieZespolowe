var config = require('./config');

var mongoose = require('mongoose');

mongoose.connect('mongodb://' + config.dbAddress + '/monitordb');

var sensorMetadataSchema = new mongoose.Schema({
	resourceId: String,
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

				console.log("received metadata from:" + data.resourceId);

				data.isComposite = 'false';

				SensorMetadata.findOne({resourceId: data.resourceId}, function(err, metadata) {
					if (metadata) {
						SensorMetadata.update({resourceId: data.resourceId}, data, function(err, metadata) {
							if (err) console.log(err);
						});
					} else {
						SensorMetadata.create(data, function(err, metadata) {
							if (err) console.log(err);
						});
					}
				});
			} else { // measurement json
				console.log("received measurement from:" + data.resourceId);
				SensorMeasurement.create(data, function(err, measurement) {
					if (err) console.log(err);
				});
			}
		});
		
	}).listen(sensorsData[i].port, sensorsData[i].address);
}

///////////////////////////////////////////////////////////////////////////////

var express = require('express');
var app = express();
var bodyParser = require("body-parser");

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/measurements', function(req, res) {
	console.log("get /measurements");

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

	console.log("params:");
	console.log(params);

	SensorMetadata.find(params, function(err, metadatas) {
		if (err) {
			console.log(err);
			res.status(200).send();
		}
		
		var resJson = {streams: []};
		for (var i = 0; i < metadatas.length; ++i) {		
			resJson.streams.push({
				id: metadatas[i].resourceId,
				location: 'http://www.example.com/measurements/' + metadatas[i].resourceId,
				metadata: {
					resourceName: metadatas[i].resourceName,
					metricName: metadatas[i].metricName,
					unitName: metadatas[i].unitName,
					description: metadatas[i].description
				}
			});
		}
		
		res.json(resJson);
		res.status(200).send();	
	});
});

app.get('/measurements/:id', function(req, res) {
	console.log("/measurements/{id} id:" + req.params.id + " limit:" + req.query.limit);
	
	var limit = 10;

	if (req.query.limit) {
		limit = req.query.limit;
	}

	if (!isInt(limit)) {
		console.log("incorrect argument: limit is not integer");
    	res.status(400).send();	
    	return;		
	}
 
 	var result = {};

	SensorMetadata.findOne({resourceId: req.params.id}, function(err, metadata) {
		if (!metadata) {
			console.log("sensor with given id not found");
			res.status(404).send();		
			return;
		}

		console.log(metadata);

		result["metadata"] = {};
		result["metadata"]["resourceName"] = metadata.resourceId;
		result["metadata"]["metricName"] = metadata.metricName;
		result["metadata"]["unitName"] = metadata.unit;
		result["metadata"]["description"] = metadata.description;
		result["metadata"]["isComposite"] = metadata.isComposite;

		result["measurements"] = [];

		//get measurements here
		SensorMeasurement.find({resourceId:req.params.id}).sort({time: -1}).limit(limit).exec(function(err, measurements) {

			if (!measurements) {
				console.log("no measurements found for id:" + req.params.id);
			} else {
				console.log("adding " + measurements.length + " measurements");

				var table = []

				for(var i = 0; i <measurements.length; ++i) {

					var measurement = {value:(measurements[i]).value ,timestamp:(measurements[i]).time.getTime()}
					table.push(measurement);
				}

				result["measurements"] = table;
			}

			res.json(result);
			res.status(200).send();

		});
	});

});

app.post('/measurements', function(req, res) {
	
	console.log("create composite, body:");
	console.log(req.body);

	if (checkParameters(req.body)) {
		addMeasurement(req.body, res);
	} else {
		console.log("incomplete or incorrect parameters");
		res.status(400).send();
	}

});

var measurementsCounter = 1;
var compositeJobs = [];

function addMeasurement(body, res) {
	
	SensorMetadata.findOne({resourceId: body.id}, function(err, metadata) {

		if (!metadata) {
			console.log("measurment to create composite not found")
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
				console.log("err:" + err); 
				res.status(400).send();
			} else {
				res.status(201).send();
			}

		});

		console.log("Adding job with params period:" + body.period + " id:" + body.id + " resourceId:" + data.resourceId);

		var jobId = setInterval(function() { movingAverage(body.period, body.id, data.resourceId); }, body.interval * 1000);
		compositeJobs[data.resourceId] = jobId;
		console.log(compositeJobs);
	});
}

app.delete('/measurements', function (req, res) {
	console.log("delete measurement");

	var id = req.query.id;

	if (!id) {
		res.status(404).send();
	}

	// TODO: send statuses

	SensorMetadata.findOne({resourceId: id}, function(err, metadata) {

		if (!metadata || !metadata.isComposite) {
			console.log("composite measurement with id:" + id + " doesn't exist");
			res.status(404).send();		
			return;
		}

		console.log("delete measurement with id:" + id);

	
		SensorMetadata.remove({resourceId: id}, function(err, removed) {

			if (err) {
				console.log("delete metadata error:" + err);
			} else {
				console.log("delete metadata success. Stopping the job and deleting measurements");
				
				var jobObj = compositeJobs[id];

				if (jobObj) {
					console.log("stopping the job");
					clearInterval(jobObj);
				} else {
					console.warn("there's no job in collection for given id");
				}
				

				SensorMetadata.remove({resourceId: id}, function(err, removed) {

					if (err) {
						console.log("delete measurement error:" + err);
					} else {
						console.log("delete measurement success");
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
			console.log("measurement undefined, id:" + id + " compositeId:" + compositeId);
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
				console.log(err); 
			} else {
				console.log("Composite measurement added");
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
	return { $regex: "/*" + base + "*/" };
}