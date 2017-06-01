var config = {};

config.sensorsData = [
	{port: 1333}
];

config.location = 'http://89.79.119.210:1331/measurements/'

config.sensorsCount = config.sensorsData.length;

config.dbAddress = 'localhost';

config.httpPort = 1331;

config.credentialService = {};
config.credentialService.address = 'http://localhost';
config.credentialService.port = 1335;
config.credentialService.method = 'authenticate';

module.exports = config;
