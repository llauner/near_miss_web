var _availableTracks = null;            // List of available days
var _tracksGeojson = null;
var _layerVectorTracks = null;
var _selectedDayIndex = null;
var _selectedDayFilenames = null;
// --- Color palette ---
var _selectedPalette = "tol-rainbow";		// Current selected color palette name
var _selectedPaletteCount = 20;				// Number of different colors in the palette
var _palette = palette(_selectedPalette, _selectedPaletteCount);						// Current selected color palette

var _mapboxPbfLayer = null;

var _currentAirportFilterValue = null;

var vectorTracksStyle = {
						"color": "rgba(33, 78, 184)",
						"weight": 1.5,
						"opacity": 1
};

var clickedVectorTracksStyle = {
	"color": "#ff0000",
	"weight": 5,
	"opacity": 1
};


/**
 * selectTrack
 * @param {any} pickerDate
 */
function selectTrack() {

    _tracksGeojson = null;
	showHideVectorTracks(false);

    setupVectorTracks();			// Daily view of geojson tracks
   
    //setupYearlyMbTiles();			// Yearly view of Mbtiles
}

/**
 * setupVectorTracks
 *
 */
function setupVectorTracks() {
    var zipVectorTracksUrl = NetcoupeTracksDataUrl + "2022_nearmiss.zip";
    _map.spin(true);
        JSZipUtils.getBinaryContent(zipVectorTracksUrl, function(err, data) {
		if(err) {
			toastr["error"]("Could not load ZIP Vector Tracks: " + zipVectorTracksUrl);
			console.log(err);
			_map.spin(false);
		}
		JSZip.loadAsync(data).then(function (zip) {
			//zip.file(_selectedDayFilenames.VectorGeojsonTracksFileName).async("string")
			zip.file(Object.values(zip.files)[0].name).async("string")
			.then(function (data) {
				if (typeof (data) !== 'object') {
					data = JSON.parse(data);
				}
				_tracksGeojson = data;
				configureVectorTracks();
				enableTrackSelection();
				//setupTakeoffAirportSelecttion();
			})
			.finally(function() {
				_map.spin(false);
				if (!_tracksGeojson) {
					console.log(errorThrown);
					toastr["error"]("Could not load zip Vector Tracks: " + zipVectorTracksUrl);
				}
			});
		});
		});

        showHideMeasuringTool(true);
}

var trackColorIndex = 0;
function configureVectorTracks() {
    _palette = palette(_selectedPalette, _selectedPaletteCount);

	_layerVectorTracks = L.geoJSON(_tracksGeojson, {
		style: setTrackStyleFunction,
		onEachFeature: onEachFeature,			// Configure action when a track is clicked
		pointToLayer: function (feature, latlng) {
            var featureProperties = getFeatureProperties(feature);
            return new L.CircleMarker(latlng, {
                radius: 10
			})
				.bindPopup(`<b>${featureProperties.ts}</b>
                            <table style="; border-collapse: collapse; border-color: #D3D3D3;" border="1">
                            <tbody>
                            <tr>
                            <td style="width: 10.4478%;"><b>Alt 1</b></td>
                            <td style="width: 9.55228%;">${featureProperties.alt1}</td>
                            <td style="width: 21%;">&nbsp;</td>
                            </tr>
                            <tr>
                            <td style="width: 10.4478%;"><b>Delta</b></td>
                            <td style="width: 9.55228%;">&nbsp;</td>
                            <td style="width: 21%;">${featureProperties.delta}</td>
                            </tr>
                            <tr>
                            <td style="width: 10.4478%;"><b>Alt 2</b></td>
                            <td style="width: 9.55228%;">${featureProperties.alt2}</td>
                            <td style="width: 21%;">&nbsp;</td>
                            </tr>
                            <tr>
                            <td style="width: 10.4478%;"><b>Distance</b></td>
                            <td style="width: 9.55228%;">&nbsp;</td>
                            <td style="width: 21%;">${featureProperties.dist}</td>
                            </tr>
                            </tbody>
                            </table>
`);
        }
		//filter: filterByTakeOffLocation
	});


    _layerVectorTracks.addTo(_map);
    }

setTrackStyleFunction = function (feature) {
	trackColorIndex++;
	vectorTracksStyle.color = "#" + _palette[trackColorIndex % _palette.length];
	return vectorTracksStyle;
}

var _clickedFeatureOldStyle = null;
var _clickedLayer = null;
/**
 * onEachFeature
 * Change track style on click. Restore style of previously clicked track
 * @param {any} feature
 * @param {any} layer
 */
function onEachFeature(feature, layer) {
	//bind click
	layer.on('click', function (e) {
		if (_clickedFeatureOldStyle && _clickedLayer) {
			_clickedLayer.setStyle(_clickedFeatureOldStyle);
		}
		_clickedLayer = this;
		_clickedFeatureOldStyle = Object.assign({}, vectorTracksStyle);
		_clickedFeatureOldStyle.color = this.options.color;

		this.setStyle(clickedVectorTracksStyle);
	});

}


function updateVectorTracksStyle(color, opacity) {
	// Solid color
	if (color && opacity) {
		vectorTracksStyle.color = color;
		vectorTracksStyle.opacity = opacity;
		_layerVectorTracks.setStyle(vectorTracksStyle);
	}
	// Palette
	else {
		trackColorIndex = 0;
		_palette = palette(_selectedPalette, _selectedPaletteCount);
		_layerVectorTracks.setStyle(setTrackStyleFunction);
	}
	
}

/**
 * showHideVectorTracks
 *
 * @param {*} isVector
 */
function showHideVectorTracks(show) {
	if (_layerVectorTracks)
		if (show) {
            _layerVectorTracks.addTo(_map);
        }
		else {
            _layerVectorTracks.remove();
        }
}

/**
 * 
 * @param {any} feature
 */
function getFeatureProperties(feature) {
	var ts = moment(feature.properties.ts * 1000).format('d MMM YYYY - H:mm:ss');
	var alt1 = feature.properties.alt1;
	var alt2 = feature.properties.alt2;
	var delta = Math.abs(alt1 - alt2);
    var dist = feature.properties.dist;
    return {
        ts: ts,
		alt1: alt1,
		alt2: alt2,
		delta: delta,
		dist: dist
    };

}
