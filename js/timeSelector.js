var _timeSlider = null;
var _timeStamps = null;
var _startTimeStamp = null;
var _endTimeStamp = null;
var _controlBar = null;
var _slider = null;

function setupTimeSelector() {
    if (!_controlBar) {
        _controlBar = L.control.bar('bottom-bar', {
            position: 'bottom',
            visible: true
        });
        _map.addControl(_controlBar);

        setTimeout(function () {
            _controlBar.show();
        }, 500);
    }

    if (_slider) {
        _slider.destroy();
    }

    // Get timestamps
    _timeStamps = _pointsGeojson.features.map(f => f.properties.ts);
    _timeStamps = _.uniq(_timeStamps);
    _timeStamps = _.sortBy(_timeStamps);


    _timeSlider = document.getElementById('time-selector');

    var format = {
        to: function (value) {
            return value;
        },
        from: function (value) {
            return value;
        }
    };

    var minRange = getStartOfDay(_timeStamps[0]);
    var maxRange = getEndOfDay(_timeStamps[_timeStamps.length - 1]);

    _slider = noUiSlider.create(_timeSlider, {
        start: [minRange, maxRange],
        range: { min: minRange, max: maxRange },
        step: 86400,
        behaviour: 'snap',
        connect: true,
        tooltips:
        {
            to: function (value) {
                return timestampToDay(value);
            },
            from: function (value) {
                return value;
            }
        },

        
    });

    // --- Update start and end date labels
    var strStart = timestampToDay(minRange);
    var strEnd = timestampToDay(maxRange);

    $("#lbl-start-date").text(strStart);
    $("#lbl-end-date").text(strEnd);

    $(document).trigger('timeSelectorSetupEnd', null);
}

function onValueChanged(values, handle) {
    _startTimeStamp = getStartOfDay(values[0]);
    _endTimeStamp = getEndOfDay(values[1]);


    // --- Refresh map
    showHideVectorPoints(false);
    configureVectorPoints();
    showHideVectorPoints(true);
}


function timestampToString(ts) {
    moment.locale('fr');
    return moment(ts * 1000).format('D MMM YYYY - H:mm:ss');
};
function timestampToDay(ts) {
    moment.locale('fr');
    return moment(ts * 1000).format('D MMM YYYY');
};

function getStartOfDay(ts) {
    const timezoneOffset = moment(ts * 1000).utcOffset();
    var epochStart = moment(ts * 1000).utc().add(timezoneOffset, 'minutes').startOf('day').unix();
    return epochStart;
}
function getEndOfDay(ts) {
    const timezoneOffset = moment(ts * 1000).utcOffset();
    var epochStart = moment(ts * 1000).utc().add(timezoneOffset, 'minutes').endOf('day').unix();
    return epochStart;
}