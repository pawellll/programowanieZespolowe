import requests
	
MONITOR_LIST = []

def getMonitors():
	file = open('monitors.cfg', 'r')
	
	for monitor in file:
		monitorStrings = monitor.replace("\n","").split(";")
		monitorObj = {}
		monitorObj['Name'] = monitorStrings[0]
		monitorObj['Ip'] = monitorStrings[1]
		MONITOR_LIST.append(monitorObj)
