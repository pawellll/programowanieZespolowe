var config = {};

config.sensorsData = [
	{address: '127.0.0.1', port: 9090},
	{address: '127.0.0.1', port: 9091},
	{address: '127.0.0.1', port: 9092}
];

config.sensorsCount = config.sensorsData.length;

config.dbAddress = 'localhost';

config.httpPort = 8888;

module.exports = config;
