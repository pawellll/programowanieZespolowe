///add chartPlotter.js and monitorManager.js before this file!
var recentMeasurementsCanvasId = "measurementsGraph";
var archivalMeasurementsCanvasId = "measurementsGraphArchival";
var measurementGraph = null;
var archivalMeasurementGraph = null;

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

function createMeasurementsGraph(canvasId, data, graphInstance) {	
	if(canvasId == null || canvasId == ""){
		canvasId = recentMeasurementsCanvasId;
	}
	
	if(graphInstance != null){
		graphInstance.chartInstance.destroy();
	}
	
	var parentElement = $("#" + canvasId).parent();
	$("#" + canvasId).remove();
	parentElement.append('<canvas id="' + canvasId + '" data-title="Measurements" data-x-label="Timestamp" data-y-label="Value"></canvas>');
	graphInstance = new chartPlotter(canvasId);
	
	var data = [];
	var labels = [];
	
	for(var i = data.measurements.length - 1; i >= 0; i--){		
		data.push(data.measurements[i].value);
		labels.push(formatTimestamp(data.measurements[i].timestamp));
	}	
	
	graphInstance.addDataset(data, data.metadata.description);
	
	var xlabel = "";
	var ylabel = data.metadata.metricName;
	graphInstance.addLabels(labels, xlabel, ylabel);	
	graphInstance.plot();
	
	return graphInstance;
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
	
	getMeasurementsFromMonitorByResourceId(limitValue, null, null, recentMeasurementsCanvasId).then(function(graph){
		measurementGraph = graph;
	});
	
	interval = setInterval(function(){
		getMeasurementsFromMonitorByResourceId(limitValue, null, null, recentMeasurementsCanvasId).then(function(graph){
			measurementGraph = graph;
		});
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
	
	getMeasurementsFromMonitorByResourceId(null, startDate, endDate, archivalMeasurementsCanvasId).then(function(graph){
		archivalMeasurementGraph = graph;
	});	
}

function getMeasurementsFromMonitorByResourceId(limitValue, fromDate, toDate, canvasId, graphInstance) {
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
			return createMeasurementsGraph(canvasId, data, graphInstance);
		}).fail(function(){
			alert("Server connection error");
			clearInterval(interval);
			interval = null;
		});
	}
}

selectMeasurementClick(defaultLimit);