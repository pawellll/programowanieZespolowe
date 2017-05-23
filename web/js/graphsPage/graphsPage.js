///add chartPlotter.js and monitorManager.js before this file!
var graphCanvasId = "measurementsGraph";
var measurementsData = null;
var getMeasurementsDefaultUrl = 'http://89.79.119.210:1331/measurements';
var interval = null;
var measurementGraph = null;
var refreshInterval = 5000; ///5s interval

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
		labels.push(measurementsData.measurements[i].timestamp);
	}	
	
	measurementGraph.addDataset(data, measurementsData.metadata.description);
	
	var xlabel = "";
	var ylabel = measurementsData.metadata.metricName;
	measurementGraph.addLabels(labels, xlabel, ylabel);	
	measurementGraph.plot();
}

function getMeasurementsFromMonitor(measurementIdValue, limitIdValue) {	
	var concatenatedUrl
	var currentMonitorObject = getCurrentMonitorObject();
	
	if(currentMonitorObject == null ){
		concatenatedUrl = getMeasurementsDefaultUrl + "/" + measurementIdValue;	
	}
	else{
		concatenatedUrl = 'http://' + currentMonitorObject.ip + "/measurements/" + measurementIdValue;
	}
	
	if(limitIdValue) {
		concatenatedUrl += "?limit=" + limitIdValue;
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

function selectMeasurementClick(){
	if(interval != null){
		interval();
		interval = null;
	}
	
	var measurementIdValue = document.getElementById('measurementId').value;
	var limitIdValue = document.getElementById('limitId').value;
	
	if(measurementIdValue == "") return;
	
	interval = setInterval(function(){
		getMeasurementsFromMonitor(measurementIdValue, limitIdValue);
	}, refreshInterval);		
}

function getMeasurementsFromMonitorByResourceId() {
	measurementIdValue = localStorage.getItem("resourceForGraphGlobalIdStorage");
	console.log("local storage value: " + measurementIdValue);
	
	if(measurementIdValue) {
		var concatenatedUrl
		var currentMonitorObject = getCurrentMonitorObject();
		
		if(currentMonitorObject == null ){
			concatenatedUrl = getMeasurementsDefaultUrl + "/" + measurementIdValue;	
		}
		else{
			concatenatedUrl = 'http://' + currentMonitorObject.ip + "/measurements/" + measurementIdValue;
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

getMeasurementsFromMonitorByResourceId();
interval = setInterval(function(){
	getMeasurementsFromMonitorByResourceId();
}, refreshInterval);
