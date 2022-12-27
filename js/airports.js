var _airportsGeojson  = null;
var _layerAirports = null;

/**
 * setupAirports
 *
 */
function setupAirports() {
	// --- Get Netcoupe OpenAIP airports ---
	var airportsUrl = NetcoupeTracksDataUrl + OpenAipAirportsFileName;
	_map.spin(true);
    $.ajax({
        url: airportsUrl,
        type: 'GET',
        context: document.body,
        dataType: "json",
        success: function(result) {
            if (typeof (result) !== 'object') {
                result = JSON.parse(result);
            }
			_airportsGeojson = result;
			configureAirports();
			enableAirportsSelection();
			if (_isShowAirportsOnStartup) {
				showAirportsOnStartup();
			}
        },
        error: function(result, status, errorThrown) {
            console.log(errorThrown);
            toastr["error"]("Could not load Airports: " + airportsUrl);
		},
		complete: function(jqXHR, textStatus) {
			_map.spin(false);
		}
	});
}

function configureAirports() {
	var _airportsMarkers = [];

	_airportsGeojson.features.forEach(f => {
		var displayAirport = f.properties.icao;		// Keep airfields with ICAO name only

		if (f.properties.icao) {
			var text = f.properties.icao;
			var message = `${text}<br>${f.properties.name}`;

			var fontAwesomeIcon = L.divIcon({
				html: `<i class="fas fa-plane">${text}</i>`,
				iconSize: [2, 2],
				className: 'airport-icon'
				});
				
			marker  =  L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]], {
				icon: fontAwesomeIcon
			}).bindPopup(message);
	
			_airportsMarkers.push(marker);
		}
		
	});
	_layerAirports =  L.layerGroup(_airportsMarkers);
}

function showHideAirports(show) {
	if (show) {
		_layerAirports.addTo(_map);
	}
	else {
		_layerAirports.remove();
	}
}

function showAirportsOnStartup() {
	$('#chk-airports').prop('checked', true);
	$('#chk-airports').trigger('change');
}