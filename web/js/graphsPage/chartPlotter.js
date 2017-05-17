///add chart.js, jQuery vendor files before this file!

window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

function chartPlotter(canvasId, type){
	this.element = null;
	this.elementId = "";
	this.options = {};
	this.data = [];
	this.labels = [];
	this.config = {};
	this.chartInstance = null;
	this.colorIndex = 0;
		
	this.constructor = function(canvasId, type){
		
		this.element = $("#" + canvasId);
		this.elementId = canvasId;
		
		var xlabel = this.element.data("x-label");
		var ylabel = this.element.data("y-label");
		var title = this.element.data("title");
		
		this.options = {
			responsive: true,
			title:{
				display:true,
				text: title
			},
			tooltips: {
				mode: 'index',
				intersect: false,
			},
			hover: {
				mode: 'nearest',
				intersect: true
			},
			scales: {
				xAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: xlabel
					}
				}],
				yAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: ylabel
					}
				}]
			}
		}
		
		this.config = {
			type: type != null ? type : 'line',
			data: {
				labels: [],
				datasets: []
			},
			options: this.options
		};				
	}
	
	this.getNextColor = function(){		
		var colorKey = Object.keys(window.chartColors)[this.colorIndex];
		var color = window.chartColors[colorKey];
		
		this.colorIndex++;		
		if(this.colorIndex >= Object.keys(window.chartColors).length){
			this.colorIndex = 0;
		}
		
		return color;
	}
	
	this.addDataset = function(data, title){
		var color = this.getNextColor();
		
		var newDataset = {
			label: title,
			backgroundColor: color,
			borderColor: color,
			data: data,
			fill: false			
		}
		
		this.config.data.datasets.push(newDataset);		
	}
	
	this.addLabels = function(labels){
		this.config.data.labels = labels;
	}
	
	this.plot = function(){		
		var ctx = document.getElementById(this.elementId).getContext("2d");
		this.chartInstance = new Chart(ctx, this.config);		
	}	
	
	this.constructor(canvasId, type);
}