var config = {};

config.sensorsData = [
	{address: '127.0.0.1', port: 9090},
	{address: '127.0.0.1', port: 9091}
];

config.sensorsCount = config.sensorsData.length;

config.dbAddress = 'localhost';

config.location = "http://89.79.119.210:1331/measurements/"

config.httpPort = 8888;

module.exports = config;
