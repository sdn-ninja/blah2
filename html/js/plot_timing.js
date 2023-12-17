var timestamp = -1;
var nRows = 3;
var host = window.location.hostname;
var isLocalHost = (host === "localhost" || host === "127.0.0.1" || host === "192.168.0.112");

// setup API
var urlTimestamp = '';
if (isLocalHost) {
  urlTimestamp = '//' + host + ':3000/api/timestamp?timestamp=' + Date.now();
} else {
  urlTimestamp = '//' + host + '/api/timestamp?timestamp=' + Date.now();
}
var urlDetection = '';
if (isLocalHost) {
  urlDetection = '//' + host + ':3000/stash/detection?timestamp=' + Date.now();
} else {
  urlDetection = '//' + host + '/stash/timing?timestamp=' + Date.now();
}

// setup plotly
var layout = {
  autosize: false,
  margin: {
    l: 50,
    r: 50,
    b: 50,
    t: 10,
    pad: 0
  },
  hoverlabel: {
    namelength: 0
  },
  width: document.getElementById('data').offsetWidth,
  height: document.getElementById('data').offsetHeight,
  plot_bgcolor: "rgba(0,0,0,0)",
  paper_bgcolor: "rgba(0,0,0,0)",
  annotations: [],
  displayModeBar: false,
  xaxis: {
    title: {
      text: xTitle,
      font: {
        size: 24
      }
    },
    showgrid: false,
    ticks: '',
    side: 'bottom'
  },
  yaxis: {
    title: {
      text: yTitle,
      font: {
        size: 24
      }
    },
    showgrid: false,
    ticks: '',
    ticksuffix: ' ',
    autosize: false,
    categoryorder: "total descending"
  },
  legend: {
    orientation: "h",
    bgcolor: "#f78c58",
    bordercolor: "#000000",
    borderwidth: 2
  }
};
var config = {
  displayModeBar: false,
  scrollZoom: true
}

// setup plotly data
var data = [
  {
    z: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    colorscale: 'Jet',
    type: 'heatmap'
  }
];

Plotly.newPlot('data', data, layout, config);

// callback function
var intervalId = window.setInterval(function () {

  // check if timestamp is updated
  var timestampData = $.get(urlTimestamp, function () { })

    .done(function (data) {
      if (timestamp != data) {
        timestamp = data;

        // get new data
        var apiData = $.getJSON(urlDetection, function () { })
          .done(function (data) {

            // case draw new plot
            if (data.nRows != nRows) {
              nRows = data.nRows;

              // timestamp posix to js
              for (i = 0; i < data["timestamp"].length; i++)
              {
                data["timestamp"][i] = new Date(data["timestamp"][i]);
              }

              data_trace = [];
              keys = Object.keys(data);
              keys = keys.filter(item => item !== "timestamp");
              for (i = 0; i < keys.length; i++) {
                var trace = {
                  x: data["timestamp"],
                  y: data[keys[i]],
                  mode: 'lines+markers',
                  type: 'scatter',
                  name: keys[i],
                  line: {
                    width: 5
                  },
                  marker: {
                    size: 12
                  },
                };
                data_trace.push(trace);
              }

              Plotly.newPlot('data', data_trace, layout, config);
            }
            // case update plot
            else {
              // timestamp posix to js
              for (i = 0; i < data["timestamp"].length; i++)
              {
                data["timestamp"][i] = new Date(data["timestamp"][i]);
              }
              var xVec = [];
              var yVec = [];
              for (i = 0; i < keys.length; i++) {
                xVec.push(data["timestamp"]);
                yVec.push(data[keys[i]]);
              }
              var trace_update = {
                x: xVec,
                y: yVec
              };
              Plotly.update('data', trace_update);
            }

          })
          .fail(function () {
          })
          .always(function () {
          });
      }
    })
    .fail(function () {
    })
    .always(function () {
    });
}, 100);
