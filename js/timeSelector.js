var _timeSlider = null;
var _startTimeStamp = null;
var _endTimeStamp = null;

function setupTimeSelector() {
    var controlBar = L.control.bar('bottom-bar', {
        position: 'bottom',
        visible: true
    });
    _map.addControl(controlBar);

    setTimeout(function () {
        controlBar.show();
    }, 500);


    // Get timestamps
    timeStamps = _pointsGeojson.features.map(f => f.properties.ts);
    timeStamps = _.uniq(timeStamps);
    timeStamps = _.sortBy(timeStamps);

    _timeSlider = document.getElementById('slider');
    var valuesForSlider = timeStamps; // 16 values

    var format = {
        to: function (value) {
            return value;
        },
        from: function (value) {
            return value;
        }
    };

    noUiSlider.create(_timeSlider, {
        start: [8, 24],
        // A linear range from 0 to 15 (16 values)
        range: { min: 0, max: valuesForSlider.length - 1 },
        // steps of 1
        //step: 1,
        tooltips: true,
        format: format,
        pips: { mode: 'steps', density: 5, orientation: 'vertical' },
    });

    // The display values can be used to control the slider
    _timeSlider.noUiSlider.set(['7', '28']);

    _timeSlider.noUiSlider.on('update', function (values, handle) {
        _startTimeStamp = values[0];
        _endTimeStamp = values[1];
        var strStart = moment(_startTimeStamp * 1000).format('D MMM YYYY - H:mm:ss');
        var strEnd = moment(_endTimeStamp * 1000).format('D MMM YYYY - H:mm:ss');

        console.log(`start=${strStart} \t end=${strEnd}`);

        $("#lbl-start-date").text(strStart);
        $("#lbl-end-date").text(strEnd);
    });
}

var dateValues = [
    document.getElementById('event-start'),
    document.getElementById('event-end')
];

