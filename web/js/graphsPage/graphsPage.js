///add chartPlotter.js before this file!
var graphCanvasId = "measurementsGraph";

var measurementGraph = new chartPlotter(graphCanvasId);

var data = [];
var labels = [];

for(var i = 0;i < 20; i++)
{
	data.push(Math.random());
	labels.push("" + i);	
}

measurementGraph.addDataset(data, 'measurements for id: 1');
measurementGraph.addLabels(labels);

measurementGraph.plot();

///todo - getting measurement values from ajax - access global data object