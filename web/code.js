var API_KEY= 'BSup0ifQbuh2_NSrxZUUcKsgjtJxuf0_';
var WUNDERGROUND_API_KEY = '5794ac21ec0b9cbb';

function getSunPowerStatus(callback) {
    $.ajax({
        url : 'http://api.wunderground.com/api/' + WUNDERGROUND_API_KEY + '/conditions/q/CA/San_Francisco.json',
        data: null,
        dataType: "jsonp",
        success: function(data) {
            callback(data.current_observation.UV);
        }
    });
}

$(function() {
    getSunPowerStatus(function(energy) {
        if (energy > 0) {
            $('#network-status-solar').hide()
                .html('=>')
                .fadeIn('slow');
        }
        else {
            $('#network-status-solar').hide()
                .html('=X>')
                .fadeIn('slow');
        }
    });
});

function listDbs() {
    $.ajax({
        url : 'https://api.mongolab.com/api/1/databases?apiKey=' + API_KEY,
        data: null,
        success: function(data) {
            console.log(data);
        }
    });   
}

function listCollections() {
    $.ajax({
        url : 'https://api.mongolab.com/api/1/databases/p1data/collections?apiKey=' + API_KEY,
        data: null,
        success: function(data) {
            console.log(data);
        }
    });   
}

function listObjects() {
    $.ajax({
        url : 'https://api.mongolab.com/api/1/databases/p1data/collections/live?apiKey=' + API_KEY,
        data: null,
        success: function(data) {
            console.log(data);
        }
    });   
}

function insertReading(reading) {
    var API_KEY= 'BSup0ifQbuh2_NSrxZUUcKsgjtJxuf0_';
    $.ajax({
        url : 'https://api.mongolab.com/api/1/databases/p1data/collections/live?apiKey=' + API_KEY,
        data: JSON.stringify( { 'timestamp' : new Date().getTime(), 'reading' : reading } ),
        type: 'POST',
        contentType: 'application/json',
        success: function(data) {
            console.log(data);
        }
    });   
}

google.load('visualization', '1', {packages:['gauge', 'corechart']});
google.setOnLoadCallback(initCharts);
var chart;

var chartOptions = {
 width: 200, height: 200,
 redFrom: 90, redTo: 100,
 yellowFrom:75, yellowTo: 90,
 minorTicks: 5
};

function getLatestReading() {
    console.log('getting reading');
    var API_KEY= 'BSup0ifQbuh2_NSrxZUUcKsgjtJxuf0_';
    $.ajax({
        url : 'https://api.mongolab.com/api/1/databases/p1data/collections/live?apiKey=' + API_KEY + '&s={"timestamp" : -1}&l=1',
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
            var wattage = data[0].reading;
            
            var chartData = google.visualization.arrayToDataTable([
             ['Label', 'Value'],
             ['Power', wattage],
            ]);
            
            chart.draw(chartData, chartOptions);
        }
    });        
}

var areaChart;
var currentDayOfMonth = 14;
var rawData = [
      ['dummy', null, null],
      ['1', 100, 40],
      ['2', 90, 50],
      ['3', 80, 100],
      ['4', 110, 70],
      ['5', 120, 70],
      ['6', 150, 50],
      ['7', 100, 60],
      ['8', 90, 100],
      ['9', 80, 40],
      ['10', 80, 50],
      ['11', 70, 50],
      ['12', 50, 90],
      ['13', 60, 100],
      ['14', 70, 110],
      ['15', 100, null],
      ['16', 110, null],
      ['17', 120, null],
      ['18', 90, null],
      ['19', 60, null],
      ['20', 40, null],
      ['21', 50, null],
      ['22', 60, null],
      ['23', 100, null],
      ['24', 110, null],
      ['25', 100, null],
      ['26', 100, null],
      ['27', 90, null],
      ['28', 60, null],
      ['29', 60, null],
      ['30', 50, null]
    ];
    
var areaOptions = {
  hAxis: null,
  vAxis: {minValue: 0, maxValue: 200},
  legend: { position: 'none'},
  tooltip: { trigger: 'none'}
};

var cloneArray = function() {
    var newObj = (this instanceof Array) ? [] : {};
    for (var i in this) {
        if (this[i] && typeof this[i] == "object") {
            newObj[i] = this[i].cloneArray();
        }
        else
        {
            newObj[i] = this[i];
        }
    }
    return newObj;
}; 

Object.defineProperty( Object.prototype, "cloneArray", {value: cloneArray, enumerable: false});
    
function updateDataBySliderValue(sliderValue) {
    console.log('updateDataBySliderValue: ' + sliderValue);
    var data = rawData.cloneArray();
  
    for (var i=0;i<data.length;i++) {
        data[i][0] = '•';
    }
 
    var totalThisYear = 0;
    var totalLastYear = 0;

    // sum up usage up until the cutoff point
    for (var i=0;i<sliderValue;i++) {
        if (data[i][2]) {
            totalThisYear += parseInt(data[i][2]);
        }
        
        if (data[i][1]) {
            totalLastYear += parseInt(data[i][1]);
        }
    }
   
    // clear out data after cutoff
    for (var i=sliderValue+1;i<data.length;i++) {
        data[i][2] = null;
        data[i][1] = null;
    }
    
    console.log(data);
    
    var data = google.visualization.arrayToDataTable(data);
    
    $('#lastyear .energy').text(totalLastYear);
    $('#thisyear .energy').text(totalThisYear);
    
    areaChart.draw(data, areaOptions);
}

function drawAreaChart() {
    areaChart = new google.visualization.AreaChart(document.getElementById('area_div'));
    updateDataBySliderValue(30);
}

function initCharts() {   
    drawAreaChart();
   // drawGauge();
}

function drawGauge() {
    chart = new google.visualization.Gauge(document.getElementById('area_div'));
    var chartData = google.visualization.arrayToDataTable([
     ['Label', 'Value'],
     ['Power (W)', 0],
    ]);
    
    chart.draw(chartData, chartOptions);
    setInterval(getLatestReading, 5000);
    
    var data = google.visualization.arrayToDataTable([
      ['', '2013', '2012'],
      ['',  109, 120],
    ]);

    var options = {
      title: 'Power usage (Wh)',
    //  vAxis: {title: 'Year',  titleTextStyle: {color: 'red'}}
    };

    var chart2 = new google.visualization.BarChart(document.getElementById('bar_div'));
    chart2.draw(data, options);
    
    
}
   
$(function() {
    $( "#slider" ).slider({
        max: 30,
        min: 1,
        value: currentDayOfMonth,
        slide: function( event, ui ) {
            if (ui.value > currentDayOfMonth) {
                event.cancel();
                return;
            }
            updateDataBySliderValue(ui.value);
            var leftPos = $('a.ui-slider-handle').css('left');
            $('#slider_data').css('left', leftPos);
            $('#slider_data').css('display','block');
            $('#slider_data #date').text(currentDayOfMonth+1);
        }
    });
});

//listDbs();
//listCollections();
//listObjects();
//insertReading(44);
//getLatestReading();