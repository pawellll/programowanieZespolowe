///add chartPlotter.js and monitorManager.js before this file!
var graphCanvasId = "measurementsGraph";
var measurementsData = null;
var getMeasurementsDefaultUrl = 'http://89.79.119.210:1331/measurements';
var interval = null;
var measurementGraph = null;
var refreshInterval = 5000; ///5s interval
var limitValue = null;
var defaultLimit = 5 * 60; /// 5 minutes

function formatTimestamp(timestamp){
	var date = new Date(timestamp);
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();

	return formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);	
}

function createMeasurementsGraph(measurementIdValue) {	
	if(measurementGraph != null){
		measurementGraph.chartInstance.destroy();
	}
	var parentElement = $("#" + graphCanvasId).parent();
	$("#" + graphCanvasId).remove();
	parentElement.append('<canvas id="measurementsGraph" data-title="Measurements" data-x-label="Timestamp" data-y-label="Value"></canvas>');
	measurementGraph = new chartPlotter(graphCanvasId);
	
	var data = [];
	var labels = [];
	
	for(var i = measurementsData.measurements.length - 1; i >= 0; i--){		
		data.push(measurementsData.measurements[i].value);
		labels.push(formatTimestamp(measurementsData.measurements[i].timestamp));
	}	
	
	measurementGraph.addDataset(data, measurementsData.metadata.description);
	
	var xlabel = "";
	var ylabel = measurementsData.metadata.metricName;
	measurementGraph.addLabels(labels, xlabel, ylabel);	
	measurementGraph.plot();
}

function selectMeasurementClick(){
	if(interval != null){
		clearInterval(interval);
		interval = null;
	}
	
	var limitValue = document.getElementById('limitId').value;
	if(limitValue == "") return;
	
	getMeasurementsFromMonitorByResourceId(limitValue);
	interval = setInterval(function(){
		getMeasurementsFromMonitorByResourceId(limitValue);
	}, refreshInterval);		
}

function getMeasurementsFromMonitorByResourceId(limitValue) {
	measurementIdValue = localStorage.getItem("resourceForGraphGlobalIdStorage");
	console.log("local storage value: " + measurementIdValue);
	
	if(measurementIdValue) {
		var concatenatedUrl
		var currentMonitorObject = getCurrentMonitorObject();
		
		if(currentMonitorObject == null) {
			alert("Warning: no monitor choosed"); 
			clearInterval(interval);
			return;
		}
		
		concatenatedUrl = 'http://' + currentMonitorObject.ip + "/measurements/" + measurementIdValue;
		
		if(limitValue != null) {
			concatenatedUrl += "?limit=" + limitValue;
		}
		
		return $.ajax({
			url: concatenatedUrl,
			type: 'GET'
		}).then(function(data) {
			measurementsData = data;
			createMeasurementsGraph(measurementIdValue);
		}).fail(function(){
			alert("Server connection error");
		});
	}
}

getMeasurementsFromMonitorByResourceId(defaultLimit);
interval = setInterval(function(){
	getMeasurementsFromMonitorByResourceId(defaultLimit);
}, refreshInterval);
