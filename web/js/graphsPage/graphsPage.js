///add chartPlotter.js and monitorManager.js before this file!
var graphCanvasId = "measurementsGraph";
var measurementsData = null;
var getMeasurementsDefaultUrl = 'http://89.79.119.210:1331/measurements';

function createMeasurementsGraph(measurementIdValue) {	
	var measurementGraph = new chartPlotter(graphCanvasId);
	
	var data = [];
	var labels = [];
	
	for(var i = 0; i < measurementsData.measurements.length; i++){		
		data.push(measurementsData.measurements[i].value);
		labels.push(i);
	}	
	
	measurementGraph.addDataset(data, measurementsData.metadata.description);
	
	var xlabel = "";
	var ylabel = measurementsData.metadata.metricName;
	measurementGraph.addLabels(labels, xlabel, ylabel);	
	measurementGraph.plot();
}

function getMeasurementsFromMonitor(measurementIdValue, limitIdValue, monitorName) {	
	var concatenatedUrl
	var currentMonitorObject = getCurrentMonitorObject();
	
	if(currentMonitorObject == null && monitorName == null){
		concatenatedUrl = getMeasurementsDefaultUrl + "/" + measurementIdValue;	
	}
	else{
		var monitor = getMonitor(monitorName);
		if(monitor == null){
			concatenatedUrl = 'http://' + currentMonitorObject.ip + "/measurements/" + measurementIdValue;
		}
		else{
			concatenatedUrl = 'http://' + monitor.ip + "/measurements/" + measurementIdValue;			
		}
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
	var measurementIdValue = document.getElementById('measurementId').value;
	var limitIdValue = document.getElementById('limitId').value;
	var monitorName = document.getElementById('monitorName').value;
	
	if(measurementIdValue == "") return;
	
	getMeasurementsFromMonitor(measurementIdValue, limitIdValue, monitorName);	
}

function refreshMonitorCombo(){
	var element = $("#monitorName");
	element.children().detach();
	
	var monitors = getMonitors();
	
	var monitorNames = Object.keys(monitors);
	
	element.append("<option name='Empty'>Choose</option>");
		
	$.each(monitorNames, function(index, name) {
		element.append("<option name='"+name+"'>"+name+"</option>");			
	});	
}

refreshMonitorCombo();