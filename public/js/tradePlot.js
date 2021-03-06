// Highchart
let options4bigIndex = {
	chart: {
		type: "area"
	},
	title:{
		text:""
	},
	xAxis: {
		title: { 
			text: "時間",
		},
		type: "datetime",
	},
	yAxis: {
		title: {
			text: "點數"
		},
	},
	series: [{
		name: "大盤指數",
		data: [],
		color: "#0066ff",
	}],
	exporting: {
		enabled: false,
	}
};

let options4future = {
	chart: {
		type: "area"
	},
	title:{
		text:""
	},
	xAxis: {
		title: { 
			text: "時間",
		},
		type: "datetime",
	},
	yAxis: {
		title: {
			text: "點數"
		},
	},
	series: [{
		name: "台指期",
		data: [],
		color: "#ff6600",
	}],
	exporting: {
		enabled: false,
	}
};

let bigIndex = new Highcharts.Chart("bigIndex", options4bigIndex);
let future = new Highcharts.Chart("future", options4future);

// ajax
fetchPack("/api/1.0/realtime/getIndex", "GET")
	.then(result => {

		// update initial options
		bigIndex.update({
			yAxis: {
				min: result.bigIndex.low-30,
				max: result.bigIndex.high+30,
				plotLines: [{
					color: "#0022ff",
					width: 1,
					value: result.bigIndex.open,
					label: {
						text: `Open at ${result.bigIndex.open}`,
						style: {
							color: "#0022ff",
							fontWeight: "bold"
						},
						verticalAlign: "top",
						y: -10,
					},
				},
				{
					color: "#0022ff",
					width: 1,
					value: result.bigIndex.high,
					dashStyle: "Dash",
					label: {
						text: `High: ${result.bigIndex.high}`,
						style: {
							color: "#0022ff",
							fontWeight: "bold"
						},
						verticalAlign: "top",
						x: 300,
						y: -10,
					},
				},
				{
					color: "#0022ff",
					width: 1,
					value: result.bigIndex.low,
					dashStyle: "Dash",
					label: {
						text: `Low: ${result.bigIndex.low}`,
						style: {
							color: "#0022ff",
							fontWeight: "bold"
						},
						verticalAlign: "top",
						x: 150,
						y: 20,
					},
				}],
			}
		});
		future.update({
			yAxis: {
				min: result.futureIndex.low-30,
				max: result.futureIndex.high+30,
				plotLines: [{
					color: "#ff4000",
					width: 1,
					value: result.futureIndex.open,
					label: {
						text: `Open at ${result.futureIndex.open}`,
						style: {
							color: "#ff4000",
							fontWeight: "bold"
						},
						verticalAlign: "top",
						y: -10,
					},
				},
				{
					color: "#ff4000",
					width: 1,
					value: result.futureIndex.high,
					dashStyle: "Dash",
					label: {
						text: `High: ${result.futureIndex.high}`,
						style: {
							color: "#ff4000",
							fontWeight: "bold"
						},
						verticalAlign: "top",
						x: 300,
						y: -10,
					},
				},
				{
					color: "#ff4000",
					width: 1,
					value: result.futureIndex.low,
					dashStyle: "Dash",
					label: {
						text: `Low: ${result.futureIndex.low}`,
						style: {
							color: "#ff4000",
							fontWeight: "bold"
						},
						verticalAlign: "top",
						x: 150,
						y: 20,
					},
				}],
			}
		});

		// update initial series
		bigIndex.series[0].update({ data: result.bigIndex.data }, false);
		future.series[0].update({ data: result.futureIndex.data }, false);

		// redraw plots
		bigIndex.redraw();
		future.redraw();
	});


// socket
socket.on("bigIndexContainer", (receiver) => {    

	// update options
	bigIndex.update({
		yAxis: {
			min: receiver.low-30,
			max: receiver.high+30,
			plotLines: [{
				color: "#0022ff",
				width: 1,
				value: receiver.open,
				label: {
					text: `Open at ${receiver.open}`,
					style: {
						color: "#0022ff",
						fontWeight: "bold"
					},
					verticalAlign: "top",
					y: -10,
				},
			},
			{
				color: "#0022ff",
				width: 1,
				value: receiver.high,
				dashStyle: "Dash",
				label: {
					text: `High: ${receiver.high}`,
					style: {
						color: "#0022ff",
						fontWeight: "bold"
					},
					verticalAlign: "top",
					x: 300,
					y: -10,
				},
			},
			{
				color: "#0022ff",
				width: 1,
				value: receiver.low,
				dashStyle: "Dash",
				label: {
					text: `Low: ${receiver.low}`,
					style: {
						color: "#0022ff",
						fontWeight: "bold"
					},
					verticalAlign: "top",
					x: 150,
					y: 20,
				},
			}],
		}
	});

	// update series
	bigIndex.series[0].update({ data: receiver.data }, false);

	// redraw plots
	bigIndex.redraw();
});


socket.on("futureContainer", (receiver) => {

	// update options
	future.update({
		yAxis: {
			min: receiver.low-30,
			max: receiver.high+30,
			plotLines: [{
				color: "#ff4000",
				width: 1,
				value: receiver.open,
				label: {
					text: `Open at ${receiver.open}`,
					style: {
						color: "#ff4000",
						fontWeight: "bold"
					},
					verticalAlign: "top",
					y: -10,
				},
			},
			{
				color: "#ff4000",
				width: 1,
				value: receiver.high,
				dashStyle: "Dash",
				label: {
					text: `High: ${receiver.high}`,
					style: {
						color: "#ff4000",
						fontWeight: "bold"
					},
					verticalAlign: "top",
					x: 300,
					y: -10,
				},
			},
			{
				color: "#ff4000",
				width: 1,
				value: receiver.low,
				dashStyle: "Dash",
				label: {
					text: `Low: ${receiver.low}`,
					style: {
						color: "#ff4000",
						fontWeight: "bold"
					},
					verticalAlign: "top",
					x: 150,
					y: 20,
				},
			}],
		}
	});

	// update series
	future.series[0].update({ data: receiver.data }, false);

	// redraw plots
	future.redraw();
});