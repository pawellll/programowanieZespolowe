///add chartPlotter.js and monitorManager.js before this file!

function addNewMonitorClick(){	
	var monitorName = document.getElementById('newMonitorName').value;
	var monitorIp = document.getElementById('newMonitorIp').value;	
	
	if(monitorName == "" || monitorIp == "") return;
	
	var monitor = {ip : monitorIp };
	
	addMonitor(monitorName, monitor);	
	refreshMonitorList()
}

function refreshMonitorList(){
	var element = $("#monitorList");
	element.children().detach();
	
	var monitors = getMonitors();
	
	var monitorNames = Object.keys(monitors);
	var currentMonitorName = getCurrentMonitor()
	
	$.each(monitorNames, function(index, name) {
		var displayName = name == currentMonitorName ? (name + "(current)") : name
		var html = "<tr class='odd gradeX'>" +
						"<td>"+displayName +"</td>" +
						"<td>"+ monitors[name].ip + "</td>" +
						"<td class='center'><button id='submit' name='submit' class='form-btn semibold' onClick=\"selectMonitorClick('"+name+"')\" >Select monitor</button><button id='submit' name='submit' class='form-btn semibold' onClick=\"removeMonitorClick('"+name+"')\">Remove</button></td>" +
					"</tr>";
					
		element.append(html);		
	});	
}

function removeMonitorClick(name){
	removeMonitor(name);
	refreshMonitorList()
}

function selectMonitorClick(name){
	setCurrentMonitor(name);
	refreshMonitorList();
}

refreshMonitorList();
