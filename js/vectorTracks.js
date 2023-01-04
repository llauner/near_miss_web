var _pointsGeojson = null;
var _layerVectorPoints = null;
// --- Color palette ---
var _selectedPalette = "tol-rainbow";		// Current selected color palette name
var _selectedPaletteCount = 20;				// Number of different colors in the palette
var _palette = palette(_selectedPalette, _selectedPaletteCount);						// Current selected color palette

var _mapboxPbfLayer = null;

var _currentAirportFilterValue = null;

var vectorPointsStyle = {
						"color": "rgba(33, 78, 184)",
						"weight": 1.5,
						"opacity": 1
};

var clickedVectorPointsStyle = {
	"color": "#ff0000",
	"weight": 5,
	"opacity": 1
};


/**
 * selectPoint
 * @param {any} pickerDate
 */
function selectPoint() {

    _pointsGeojson = null;
	showHideVectorPoints(false);

    setupVectorPoints();			// Daily view of geojson tracks
   
    //setupYearlyMbTiles();			// Yearly view of Mbtiles
}

/**
 * setupVectorPoints
 *
 */
function setupVectorPoints() {
    var zipVectorTracksUrl = NetcoupeTracksDataUrl + "2022_nearmiss.zip";
    _map.spin(true);
        JSZipUtils.getBinaryContent(zipVectorTracksUrl, function(err, data) {
		if(err) {
			toastr["error"]("Could not load ZIP Vector Tracks: " + zipVectorTracksUrl);
			console.log(err);
			_map.spin(false);
		}
		JSZip.loadAsync(data).then(function (zip) {
            zip.file(Object.values(zip.files)[0].name).async("string")
			.then(function (data) {
				if (typeof (data) !== 'object') {
					data = JSON.parse(data);
				}
				_pointsGeojson = data;
				configureVectorPoints();
                enableTrackSelection();
                setupTimeSelector();
				//setupTakeoffAirportSelecttion();
			})
			.finally(function() {
				_map.spin(false);
            });
		});
		});

        showHideMeasuringTool(true);
}

var trackColorIndex = 0;
function configureVectorPoints() {
    _palette = palette(_selectedPalette, _selectedPaletteCount);

    _layerVectorPoints = L.geoJSON(_pointsGeojson, {
		style: setPointStyleFunction,
		onEachFeature: onEachFeature,			// Configure action when a track is clicked
		pointToLayer: function (feature, latlng) {
			var featureProperties = getFeatureProperties(feature);

            var circleRadius = 10;


            return new L.CircleMarker(latlng,
                    {
						radius: circleRadius
                    })
                .bindPopup(`<b>${featureProperties.ts_str}</b>
                            <table style="; border-collapse: collapse; border-color: #D3D3D3;" border="1">
                            <tbody>
                            <tr>
                            <td style="width: 10.4478%;"><b>Alt 1</b></td>
                            <td style="width: 9.55228%;">${featureProperties.alt1}</td>
                            <td style="width: 21%;">&nbsp;</td>
                            </tr>
                            <tr>
                            <td style="width: 10.4478%;background-color: #dbdbdb;"><b>Delta(m)</b></td>
                            <td style="width: 9.55228%;background-color: #dbdbdb;">&nbsp;</td>
                            <td style="width: 21%;background-color: #dbdbdb;">${featureProperties.delta}</td>
                            </tr>
                            <tr>
                            <td style="width: 10.4478%;"><b>Alt 2</b></td>
                            <td style="width: 9.55228%;">${featureProperties.alt2}</td>
                            <td style="width: 21%;">&nbsp;</td>
                            </tr>
                            <tr>
                            <td style="width: 10.4478%;background-color: #dbdbdb;"><b>Dist.(m)</b></td>
                            <td style="width: 9.55228%;background-color: #dbdbdb;">&nbsp;</td>
                            <td style="width: 21%;background-color: #dbdbdb;">${featureProperties.dist}</td>
                            </tr>
                            </tbody>
                            </table>

                            <a href="#zoomout" role="button" id="bt-zoom-out">
                                <i class="fa-solid fa-magnifying-glass-minus"></i>
                            </a>
                            <div style="float:right">
                                <a href="#zoomin" role="button" id="bt-zoom-in">
                                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                                </a>
                            </div>
                            `,
					{
						offset: [0, -50]
                    })
                .on('popupopen', function (e) {
					displayTracks(featureProperties.ts, featureProperties.fid1, featureProperties.fid2, featureProperties.pointsGeoJsonIndex );
                });
                ;
            
        }
		//filter: filterByTakeOffLocation
    });


    _layerVectorPoints.addTo(_map);
    }

setPointStyleFunction = function (feature) {
	trackColorIndex++;
	vectorPointsStyle.color = "#" + _palette[trackColorIndex % _palette.length];
	return vectorPointsStyle;
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
		_clickedFeatureOldStyle = Object.assign({}, vectorPointsStyle);
		_clickedFeatureOldStyle.color = this.options.color;

		this.setStyle(clickedVectorPointsStyle);

	});

}


function updateVectorPointsStyle(color, opacity) {
    // Palette
    trackColorIndex = 0;
    _palette = palette(_selectedPalette, _selectedPaletteCount);
    _layerVectorPoints.setStyle(setPointStyleFunction);
}

/**
 * showHideVectorPoints
 *
 * @param {*} isVector
 */
function showHideVectorPoints(show) {
	if (_layerVectorPoints)
		if (show) {
            _layerVectorPoints.addTo(_map);
        }
		else {
            _layerVectorPoints.remove();
        }
}

/**
 * 
 * @param {any} feature
 */
function getFeatureProperties(feature) {
    var ts = feature.properties.ts;
    var tsStr = moment(feature.properties.ts * 1000).format('D MMM YYYY - H:mm:ss');
	var alt1 = feature.properties.alt1;
	var alt2 = feature.properties.alt2;
	var delta = Math.abs(alt1 - alt2);
	var dist = feature.properties.dist;
	var fid1 = feature.properties.fid1;
	var fid2 = feature.properties.fid2;

    var pointsGeoJsonIndex = _.indexOf(_pointsGeojson.features, feature, 0);

	return {
		ts: ts,
        ts_str: tsStr,
        alt1: alt1,
        alt2: alt2,
        delta: delta,
		dist: dist, 
        fid1: fid1,
		fid2: fid2,
		pointsGeoJsonIndex: pointsGeoJsonIndex
};

}
