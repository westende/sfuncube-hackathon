var API_KEY= 'BSup0ifQbuh2_NSrxZUUcKsgjtJxuf0_';
var WUNDERGROUND_API_KEY = '5794ac21ec0b9cbb';
var UNIT_PRICE = 170; // Per kW

// Network status logic
(function() {
  var sunPower = 0;
  var previousGridUsage = 0;

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

  $(window).on('newEnergyReading', function(ev, data) {
    var usage = data.reading / 1000;
    var gridUsage = usage - sunPower;

    if (gridUsage > 0) {
      $('#usage-status-label').html('Spending:');
      $('#usage-status-amount').css({ 'color': '#FF0000' });
    }
    else {
      $('#usage-status-label').html('Earning:');
      $('#usage-status-amount').css({ 'color': '#00FF00' });
    }

    $('#usage-status-amount').html('$ ' + Math.abs(gridUsage * UNIT_PRICE).toFixed(2) + ' hour');
  });

  $(window).on('newEnergyReading', function(ev, data) {
    var usage = data.reading / 1000;
    var gridUsage = usage - sunPower;

    if (gridUsage < 0) {
      gridUsage = -1;
    }
    else if (gridUsage > 0) {
      gridUsage = 1;
    }
    else {
      gridUsage = 0;
    }

    if (gridUsage != previousGridUsage) {
      if (gridUsage < 0) {
        $('#network-status-grid').hide()
          .removeClass('status-neg')
          .removeClass('status-null')
          .addClass('status-pos')
          .fadeIn('slow');
      }
      else if (gridUsage > 0) {
        $('#network-status-grid').hide()
          .removeClass('status-pos')
          .removeClass('status-null')
          .addClass('status-neg')
          .fadeIn('slow');
      }
      else {
        $('#network-status-grid').hide()
          .removeClass('status-pos')
          .removeClass('status-neg')
          .addClass('status-null')
          .fadeIn('slow');
      }
    }

    previousGridUsage = gridUsage;
  });

  function setNetworkStatus() {
    energy = 0.03;

    //getSunPowerStatus(function(energy) {
      // If the value changed
      if (!sunPower && energy || sunPower && !energy) {
        if (energy > 0) {
          $('#network-status-solar').hide()
            .removeClass('status-null')
            .addClass('status-pos')
            .fadeIn('slow');
        }
        else {
          $('#network-status-solar').hide()
            .removeClass('status-pos')
            .addClass('status-null')
            .fadeIn('slow');
        }
      }
      sunPower = energy;
    //});

    getLatestReading();
  }

  $(function() {
    setNetworkStatus();
    setInterval(setNetworkStatus, 10000);
  });
})();

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


function getLatestReading() {
    var API_KEY= 'BSup0ifQbuh2_NSrxZUUcKsgjtJxuf0_';
    $.ajax({
        url : 'https://api.mongolab.com/api/1/databases/p1data/collections/live?apiKey=' + API_KEY + '&s={"timestamp" : -1}&l=1',
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
          var wattage = data[0].reading;

          $(window).trigger('newEnergyReading', { 'reading': wattage });
            
          /*var chartData = google.visualization.arrayToDataTable([
           ['Label', 'Value'],
           ['Power', wattage],
          ]);

          chart.draw(chartData, chartOptions);*/
        }
    });        
}

google.load('visualization', '1', {packages:['corechart']});
google.setOnLoadCallback(drawAreaChart);

var chart;
var target = 5;
var progress = 1;
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
    
var graphWidth = 500;
var graphHeight = 150;
    
var areaOptions = {
    width: graphWidth,
    height: graphHeight+20,
    hAxis: null,
    vAxis: {minValue: 0, maxValue: 200},
    legend: { position: 'none'},
    tooltip: { trigger: 'none'},
    chartArea: {top: 0, left: 0, width: graphWidth, height: graphHeight-20},
    areaOpacity: 0.7,
    backgroundColor: { fill: 'transparent' },
    vAxis: { gridlines: {color: 'transparent'} },
    colors: ['#999999', '#FF89C8']
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
      //  data[i][1] = null;
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

function updateIcecreams(target, progress) {
    console.log('updateIcecreams with target' + target);
    $container = $('.progress .icecreams');
    $container.html('');
    
    $('.target .value').text(target);
    $('.progress .earn_value').text(progress);
    
    for(var i=0;i<target;i++) {
        console.log('adding icecream');
        if (i < progress) {
            $container.append('<div class="icecream_small icecream_small_on"></div>');
        } else {
            $container.append('<div class="icecream_small"></div>');
        }
    }
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

$('body').ready(function() {
    updateIcecreams(target,progress);
          
    $('a.button').click(function() {
      if ($(this).hasClass('plus')) {
          if (target < 10) {
              target++;
          }
      } else {
          if (target > 1) {
              target--;
          }
      }
      $('.target .value').text(target);
      updateIcecreams(target,progress);
    });
});
