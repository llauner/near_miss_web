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

    _timeSlider = document.getElementById('time-selector');
    var valuesForSlider = timeStamps;

    var format = {
        to: function (value) {
            return value;
        },
        from: function (value) {
            return value;
        }
    };

    var minRange = valuesForSlider[0];
    var maxRange = valuesForSlider[valuesForSlider.length - 1];

    noUiSlider.create(_timeSlider, {
        start: [minRange, maxRange],
        range: { min: minRange, max: maxRange },
        // steps of 1
        //step: 1,
        tooltips:
        {
            to: function (value) {
                return timestampToString(value);
            },
            from: function (value) {
                return value;
            }
        },

        //pips: { mode: 'steps', density: 5, orientation: 'vertical' }
    });

    // The display values can be used to control the slider
    //_timeSlider.noUiSlider.set([minRange, maxRange]);


    $(document).trigger('timeSelectorSetupEnd', null);
}


function timestampToString(ts) {
    return moment(ts * 1000).format('D MMM YYYY - H:mm:ss');
};