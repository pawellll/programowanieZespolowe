///add chartPlotter.js before this file!
var graphCanvasId = "measurementsGraph";
var measurementsData = null;

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

function getMeasurementsFromMonitor(measurementIdValue, limitIdValue) {	
	var concatenatedUrl = getMeasurementsUrl + "/" + measurementIdValue;	
	
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
	getMeasurementsFromMonitor(measurementIdValue, limitIdValue);	
}