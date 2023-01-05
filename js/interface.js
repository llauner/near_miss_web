
// Shorthand for $( document ).ready()
$(function () {
    
    // --- Setup custom events ---
    $(document).on('timeSelectorSetupEnd', function (e, eventInfo) {
        subscribers = $('.subscribers-timeSelectorSetupEnd');
        subscribers.trigger('setupEnd', [eventInfo]);
    });
});


// ----- Event handlers -----

// Zoom IN to 30s track
$('body').on('click', '#bt-zoom-in', function () {
    _map.flyTo(_currentMapCenter, _trackZoomLevel,
        {
            animate: false
        });
});
$('body').on('click', '#bt-zoom-out', function () {
    _map.flyTo(_currentMapCenter, _currentZoom,
        {
            animate:false
        });
});

// --- Help ---
$('#bt-help').on('click',
    function () {
        showHelp();
    });

// --- Time Slider ---
$('#time-selector').on('setupEnd', function (e, eventInfo) {
    _timeSlider.noUiSlider.on('set', function (values, handle) {
        _startTimeStamp = values[0];
        _endTimeStamp = values[1];
        var strStart = timestampToString(_startTimeStamp);
        var strEnd = timestampToString(_endTimeStamp);

        $("#lbl-start-date").text(strStart);
        $("#lbl-end-date").text(strEnd);

        // --- Refresh map
        showHideVectorPoints(false);
        configureVectorPoints();
        showHideVectorPoints(true);
    });
});