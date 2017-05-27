#!python2

from __future__ import print_function
import requests
import time

def main():
	monitors = getMonitors()
	while True:
		mConcat = {}
		for monitor in monitors:
			res = getMeasurementsFromMonitor(monitor['ip'] + '/measurements')
			for label, group in res.items():
				m = mConcat.setdefault(label, [])
				m += group
		printTop(mConcat, 10)
		time.sleep(5)

def getMeasurementsFromMonitor(address):
	r = requests.get(address)

	measurements = {}
	for x in r.json()['streams']:
		m = measurements.setdefault(x['metadata']['metricName'], [])
		m.append(x['location'])

	return measurements

def printTop(measurements, num):
	for label, group in measurements.items():
		print('Top', num,  ':', label)
		top = getTopFromGroup(group, num)
		it = 1
		for m in top:
			print('\t', it, m['metadata']['resourceName'], ':', m['avValue'])
			it += 1
	print('\n')


def getTopFromGroup(group, num):
	top = []
	for location in group:
		measurement = requests.get(location).json()
		mIt = 0
		mSum = 0
		for m in measurement['measurements']:
			mIt += 1
			mSum += m['value']
		measurement['avValue'] = mSum/mIt
		top.append(measurement)
	sortedMeasurements = sorted(top, key=lambda x: x['avValue'], reverse=True)
	return sortedMeasurements[:num]	

def getMonitors():
	file = open('monitors.cfg', 'r')
	
	monitors = []
	for monitor in file:
		monitorStrings = monitor.replace("\n","").split(";")
		monitorObj = {}
		monitorObj['name'] = monitorStrings[0]
		monitorObj['ip'] = monitorStrings[1]
		monitors.append(monitorObj)
	return monitors

if __name__ == "__main__":
    main()