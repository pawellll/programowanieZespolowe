///add chartPlotter.js and monitorManager.js before this file!
var recentMeasurementsCanvasId = "measurementsGraph";
var archivalMeasurementsCanvasId = "measurementsGraphArchival";
var graphObjects = {};

var interval = null;
var refreshInterval = 5000; ///5s interval
var defaultLimit = 5 * 60; /// 5 minutes

function formatTimestamp(timestamp){
	var date = new Date(timestamp);
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();

	return formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);	
}

function createMeasurementsGraph(canvasId, measuresData) {	
	if(canvasId == null || canvasId == ""){
		canvasId = recentMeasurementsCanvasId;
	}	
	
	var data = [];
	var labels = [];
	
	if(canvasId == archivalMeasurementsCanvasId)
		for(var i = 0; i < measuresData.measurements.length; i++){		
			data.push(measuresData.measurements[i].value);
			labels.push(formatTimestamp(measuresData.measurements[i].timestamp));
		}	
	else
		for(var i = measuresData.measurements.length - 1; i >= 0; i--){		
			data.push(measuresData.measurements[i].value);
			labels.push(formatTimestamp(measuresData.measurements[i].timestamp));
		}	
	
	var graphInstance = graphObjects[canvasId];
	
	if(graphInstance == null){
		graphInstance = new chartPlotter(canvasId);
		graphInstance.addDataset(data, measuresData.metadata.description);
		
		var xlabel = "";
		var ylabel = measuresData.metadata.metricName;
		graphInstance.addLabels(labels, xlabel, ylabel);	
		graphInstance.plot();
		graphObjects[canvasId] = graphInstance;	
	}
	else{
		graphInstance.chartInstance.config.data.labels = labels;
		graphInstance.chartInstance.config.data.datasets[0].data = data;
		graphInstance.chartInstance.update();	
	}		
}

function selectMeasurementClick(value){
	if(interval != null){
		clearInterval(interval);
		interval = null;
	}
	
	var limitValue = document.getElementById('limitId').value;
	if(limitValue == ""){
		if(value == null){
			return			
		}
		limitValue = value;
	}
	
	getMeasurementsFromMonitorByResourceId(limitValue, null, null, recentMeasurementsCanvasId);
	
	interval = setInterval(function(){
		getMeasurementsFromMonitorByResourceId(limitValue, null, null, recentMeasurementsCanvasId);
	}, refreshInterval);		
}

function selectArchivalMeasurementClick(){	
	if(interval != null){
		clearInterval(interval);
		interval = null;
	}
	
	var startDate  = document.getElementById('fromDateInput').value;
	var endDate  = document.getElementById('toDateInput').value;
	
	if(startDate == "" || endDate == "") return;
	
	getMeasurementsFromMonitorByResourceId(null, startDate, endDate, archivalMeasurementsCanvasId);
}

function getMeasurementsFromMonitorByResourceId(limitValue, fromDate, toDate, canvasId) {
	measurementIdValue = localStorage.getItem("resourceForGraphGlobalIdStorage");
	
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
		else if(fromDate != null && toDate != null){			
			concatenatedUrl += "?from=" + fromDate;
			concatenatedUrl += "&to=" + toDate;
		}
		
		return $.ajax({
			url: concatenatedUrl,
			type: 'GET'
		}).then(function(data) {
			return createMeasurementsGraph(canvasId, data);
		}).fail(function(){
			alert("Server connection error");
			clearInterval(interval);
			interval = null;
		});
	}
}

selectMeasurementClick(defaultLimit);