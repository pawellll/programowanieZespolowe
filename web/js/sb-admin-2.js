//var getMeasurementsUrl = 'http://127.0.0.1:8888/measurements';
var getMeasurementsUrl = 'http://89.79.119.210:1030/measurements';
//var getHostsUrl = 'http://127.0.0.1:8888/hosts';
var getHostsUrl = 'http://89.79.119.210:1030/hosts';

var streamsData;
var measurementsData;
var hostsData;

function getStreamsFromMonitor() {
	
	var filterNameId = document.getElementById('filterNameId').value;
	var filterMetricId = document.getElementById('filterMetricId').value;
	var filterDescriptionId = document.getElementById('filterDescriptionId').value;
	var filterUnitId = document.getElementById('filterUnitId').value;
	
	var concatenatedUrl = getMeasurementsUrl;
	
	if(filterNameId) {
		concatenatedUrl += "?resource=" + filterNameId;
	}
	else if(filterMetricId) {
		concatenatedUrl += "?metric=" + filterMetricId;
	}
	else if(filterDescriptionId) {
		concatenatedUrl += "?description=" + filterDescriptionId;
	}
	else if(filterUnitId) {
		concatenatedUrl += "?unit=" + filterUnitId;
	}
	
	console.log(concatenatedUrl);
	$.ajax({
        url: concatenatedUrl,
        type: 'GET'
    }).then(function(data) {
		streamsData = data;
    	createStreamsTable();
    });
	
}

function getMeasurementsFromMonitor() {
	
	var measurementIdValue = document.getElementById('measurementId').value;
	var concatenatedUrl = getMeasurementsUrl + "/" + measurementIdValue;
	
	var limitIdValue = document.getElementById('limitId').value;
	if(limitIdValue) {
		concatenatedUrl += "?limit=" + limitIdValue;
	}
	
	console.log(concatenatedUrl);
	
	$.ajax({
        url: concatenatedUrl,
        type: 'GET'
    }).then(function(data) {
		measurementsData = data;
		console.log(measurementsData);
		createSimpleMeasurementsTable();
    });
	
}

function getHostsFromMonitor() {
	
	var concatenatedUrl = getHostsUrl;
	
	var hostNameIdValue = document.getElementById('hostNameId').value;
	if(hostNameIdValue) {
		concatenatedUrl += "?name=" + hostNameIdValue;
	}
	
	console.log(concatenatedUrl);
	
	$.ajax({
        url: concatenatedUrl,
        type: 'GET'
    }).then(function(data) {
		hostsData = data;
		console.log(hostsData);
		createHostsTable();
    });
	
}
 
function createStreamsTable() {
	
	var tableRef = document.getElementById('resourcesTableId').getElementsByTagName('tbody')[0];
	while(tableRef.rows.length > 0) {
		tableRef.deleteRow(0);
	}
	
	var tableRef = document.getElementById('resourcesTableId').getElementsByTagName('tbody')[0];
	for (var i = 0; i < streamsData.streams.length; ++i) {
		var newRow   = tableRef.insertRow(tableRef.rows.length);
		var newIdCell  = newRow.insertCell(0);
		var newIdText  = document.createTextNode(streamsData.streams[i].id);
		newIdCell.appendChild(newIdText);
		
		var newNameCell  = newRow.insertCell(1);
		var newNameText  = document.createTextNode(streamsData.streams[i].metadata.resourceName);
		newNameCell.appendChild(newNameText);
		
		var newMetricCell  = newRow.insertCell(2);
		var newMetricText  = document.createTextNode(streamsData.streams[i].metadata.metricName);
		newMetricCell.appendChild(newMetricText);
		
		var newDescriptionCell  = newRow.insertCell(3);
		var newDescriptionText  = document.createTextNode(streamsData.streams[i].metadata.description);
		newDescriptionCell.appendChild(newDescriptionText);
		
		var unitText = "";
		if(streamsData.streams[i].metadata.unitName !== undefined) {
			unitText = streamsData.streams[i].metadata.unitName;
		}
		var newUnitCell  = newRow.insertCell(4);
		var newUnitText  = document.createTextNode(unitText);
		newUnitCell.appendChild(newUnitText);
		
		
		var newButtonCell  = newRow.insertCell(5);
		
		var newEditButton  = document.createElement("BUTTON");
		var newEditButtonText = document.createTextNode("Edit");
		newEditButton.setAttribute("id", "editButtonId" + i);
		newEditButton.setAttribute("name", "editButtonName" + i);
		newEditButton.setAttribute("className", "form-btn semibold");
		newEditButton.appendChild(newEditButtonText);
		newButtonCell.appendChild(newEditButton);
		
		var newRemoveButton  = document.createElement("BUTTON");
		var newRemoveButtonText = document.createTextNode("Remove");
		newRemoveButton.setAttribute("id", "removeButtonId" + i);
		newRemoveButton.setAttribute("name", "removeButtonName" + i);
		newRemoveButton.setAttribute("className", "form-btn semibold");
		newRemoveButton.appendChild(newRemoveButtonText);
		newButtonCell.appendChild(newRemoveButton);
	}
	
}

function createSimpleMeasurementsTable() {
	document.getElementById('measurementLabelId').innerHTML = "Last measurements for resource name: " + measurementsData.metadata.resourceName + " , metric name: " + measurementsData.metadata.metricName;
	
	var tableRef = document.getElementById('measurementsTableId').getElementsByTagName('tbody')[0];
	while(tableRef.rows.length > 0) {
		tableRef.deleteRow(0);
	}
	console.log(measurementsData);
	console.log(measurementsData.measurements);
		
	for (var i = 0; i < measurementsData.measurements.length; ++i) {
		console.log(measurementsData.measurements[i].value);
		var newRow   = tableRef.insertRow(tableRef.rows.length);
		var newValueCell  = newRow.insertCell(0);
		var newValueText  = document.createTextNode(measurementsData.measurements[i].value);
		newValueCell.appendChild(newValueText);
		
		var newTimestampCell  = newRow.insertCell(1);
		var date = new Date(parseInt(measurementsData.measurements[i].timestamp));
		var newTimestampText = document.createTextNode(date);
		newTimestampCell.appendChild(newTimestampText);
	}
	
}

function createHostsTable() {
	
	var tableRef = document.getElementById('hostsTableId').getElementsByTagName('tbody')[0];
	while(tableRef.rows.length > 0) {
		tableRef.deleteRow(0);
	}
	console.log(hostsData);
	console.log(hostsData.hosts);
		
	for (var i = 0; i < hostsData.hosts.length; ++i) {
		console.log(hostsData.hosts[i].value);
		var newRow   = tableRef.insertRow(tableRef.rows.length);
		var newHostNameCell  = newRow.insertCell(0);
		var newHostNameText  = document.createTextNode(hostsData.hosts[i].hostName);
		newHostNameCell.appendChild(newHostNameText);
		
	}
	
}

$(function() {
    $('#side-menu').metisMenu();
});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    $(window).bind("load resize", function() {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    // var element = $('ul.nav a').filter(function() {
    //     return this.href == url;
    // }).addClass('active').parent().parent().addClass('in').parent();
    var element = $('ul.nav a').filter(function() {
        return this.href == url;
    }).addClass('active').parent();

    while (true) {
        if (element.is('li')) {
            element = element.parent().addClass('in').parent();
        } else {
            break;
        }
    }
});


