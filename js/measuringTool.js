_controlMeasuringTool = null;

const measuringToolOptions = {
    position:'bottomleft', 
    unit:'metres', 
    showBearings:false, 
    clearMeasurementsOnStop: false, 
    showClearControl: true, 
	showUnitControl: false};

function showHideMeasuringTool(isVisible) {
	if (isVisible) {
		_controlMeasuringTool = L.control.polylineMeasure(measuringToolOptions).addTo(_map);
	}
	else {
		_map.removeControl(_controlMeasuringTool);
	}
};