//var getMeasurementsUrl = 'http://127.0.0.1:8888/measurements';
var getMeasurementsUrl = 'http://89.79.119.210:1030/measurements';

var measurementsData;

function getMeasurementsFromMonitor() {
	
	console.log("test");
	$.ajax({
        url: getMeasurementsUrl,
        type: 'GET'
    }).then(function(data) {
		measurementsData = data;
    	createTable();
    });
	
}
 
function createTable() {
	
	var tableRef = document.getElementById('resourcesTableId').getElementsByTagName('tbody')[0];
	for (var i = 0; i < measurementsData.streams.length; ++i) {
		var newRow   = tableRef.insertRow(tableRef.rows.length);
		var newIdCell  = newRow.insertCell(0);
		var newIdText  = document.createTextNode(measurementsData.streams[i].id);
		newIdCell.appendChild(newIdText);
		
		var newNameCell  = newRow.insertCell(1);
		var newNameText  = document.createTextNode(measurementsData.streams[i].metadata.resourceName);
		newNameCell.appendChild(newNameText);
		
		var newMetricCell  = newRow.insertCell(2);
		var newMetricText  = document.createTextNode(measurementsData.streams[i].metadata.metricName);
		newMetricCell.appendChild(newMetricText);
		
		var newDescriptionCell  = newRow.insertCell(3);
		var newDescriptionText  = document.createTextNode(measurementsData.streams[i].metadata.description);
		newDescriptionCell.appendChild(newDescriptionText);
		
		var unitText = "";
		if(measurementsData.streams[i].metadata.unitName !== undefined) {
			unitText = measurementsData.streams[i].metadata.unitName;
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
