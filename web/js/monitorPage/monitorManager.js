var monitorsLocalStorageKey = "monitorsObject";
var currentMonitorLocalStorageKey = "currentMonitorObject";
initMonitors();

/// local storage functions
function addToLocalStorage(object, key){
	localStorage[key] = JSON.stringify(object);
}

function getFromLocalStorage(key){
	var serializedObject = localStorage[key];
	if(serializedObject != null){
		return JSON.parse(serializedObject);
	}
	return null;
}

/// monitor functions
function saveMonitors(){
	addToLocalStorage(window.monitorsObject, monitorsLocalStorageKey);
}

function getMonitors(){
	var monitors = getFromLocalStorage(monitorsLocalStorageKey);
	if(monitors == null){
		return {};
	}
	return monitors;
}

function setCurrentMonitor(monitorObject){
	addToLocalStorage(monitorObject, currentMonitorLocalStorageKey);	
}

function getCurrentMonitor(){
	return getFromLocalStorage(currentMonitorLocalStorageKey);	
}

function getCurrentMonitorObject(){
	var currentMonitorName = getCurrentMonitor();
	var monitor = getMonitors()[currentMonitorName];
	if(monitor != null){
		monitor.name = currentMonitorName;	
	}
	return monitor;
}

function initMonitors(){
	window.monitorsObject = getMonitors();
	if(window.monitorsObject == null){
		window.monitorsObject = {};
	}	
}

/// returns object like: {ip: '192.168.0.1'}
function getMonitor(name){
	return window.monitorsObject[name];
}

function removeMonitor(name){
	delete window.monitorsObject[name];
	var current = getCurrentMonitorObject();
	if(current.name == name){
		var keys = Object.keys(window.monitorsObject);
		if(keys.length > 0)
			setCurrentMonitor(keys[0]);
	}
	saveMonitors();
}

function addMonitor(name, monitor){
	window.monitorsObject[name] = monitor;
	saveMonitors();
}
