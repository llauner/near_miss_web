var _tracksJson = null;
var _layerShortTrack1 = null;
var _layerShortTrack2 = null;
var trackColorIndex = 0;
var _isAntPathPaused = false;

var _antPolyline1 = null;
var _antPolyline2 = null;

var _currentZoom = startZooomLevel;
var _currentMapCenter = null;

// --- Color palette ---
var _selectedPalette = "tol-rainbow";		// Current selected color palette name
var _selectedPaletteCount = 5;				// Number of different colors in the palette
var _palette = palette(_selectedPalette, _selectedPaletteCount);	

var vectorTracksStyle = {
    "color": "rgba(33, 78, 184)",
    "weight": 3,
    "opacity": 1
};

/**
 * setupVectorTracks
 *
 */
function setupVectorTracks() {
    var zipVectorTracksUrl = NetcoupeTracksDataUrl + `${_selectedYear}_nearmiss_tracks.zip`;
    _map.spin(true);
    JSZipUtils.getBinaryContent(zipVectorTracksUrl, function (err, data) {
        if (err) {
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
                    _tracksJson = data;
                })
                .finally(function () {
                    _map.spin(false);
                    if (!_tracksJson) {
                        console.log(err);
                        toastr["error"]("Could not load zip Vector Tracks: " + zipVectorTracksUrl);
                    }
                });
        });
    });
}

/**
 * 
 * @param {any} fid1
 * @param {any} fid2
 */
function displayTracks(ts, fid1, fid2) {
    // Get fid
    //console.log(`fid1=${fid1} \t fid2=${fid2}`);

    // Fly to position and zoom
    var feature = _.find(_pointsGeojson.features, el => el.properties.fid1 == fid1 && el.properties.fid2 == fid2 && el.properties.ts == ts);
    center = feature.geometry.coordinates[0];
    _currentMapCenter = [center[1], center[0]];

    var myZoom = _map.getZoom();
    _currentZoom = (myZoom < _trackZoomLevel) ? myZoom : _currentZoom;

    _map.flyTo(_currentMapCenter);


    // --- Display tracks
    // Find geojson from both tracks
    var track1 = _.find(_tracksJson, { fid: fid1, ts:ts});
    var track2 = _.find(_tracksJson, { fid: fid2, ts:ts });

    // --- Remove previous Layers if exists ---
    if (_layerShortTrack1 != null && _layerShortTrack2 != null)
    {
        _map.removeLayer(_layerShortTrack1);
        _map.removeLayer(_layerShortTrack2);
    }
    if (_antPolyline1 != null && _antPolyline2 != null) {
        _map.removeLayer(_antPolyline1);
        _map.removeLayer(_antPolyline2);
    }

    _layerShortTrack1 = L.geoJSON(track1.track, {
        style: setTrackStyleFunction,
    });

    _layerShortTrack2 = L.geoJSON(track2.track, {
        style: setTrackStyleFunction
    });
  
    _layerShortTrack1.addTo(_map);
    _layerShortTrack2.addTo(_map);

    //// --- Add Animation
    var polyLine1 = [];
    var polyLine2 = [];
    track1.track.coordinates.forEach(c => polyLine1.push([c[1], c[0]]));
    track2.track.coordinates.forEach(c => polyLine2.push([c[1], c[0]]));

    _antPolyline1 = new L.Polyline.AntPath(polyLine1,
        {
            hardwareAccelerated: true,
            delay: 500,
            color: _layerShortTrack1.color,
            dashArray: 30
        });

    _antPolyline2 = new L.Polyline.AntPath(polyLine2,
        {
            hardwareAccelerated: true,
            delay: 500,
            color: _layerShortTrack2.color,
            dashArray: 30
        });


    _antPolyline1.addTo(_map);
    _antPolyline2.addTo(_map);

    // --- Events
    _antPolyline1.on('click',
        function(layer, e) {
            antPathPauseResume();
        });

    _antPolyline2.on('click',
        function (layer, e) {
            antPathPauseResume(layer);
        });

};

function antPathPauseResume(layer) {
    if (_isAntPathPaused) {
        _antPolyline1.resume();
        _antPolyline2.resume();
    } else {
        _antPolyline1.pause();
        _antPolyline2.pause();
    }
    _isAntPathPaused = !_isAntPathPaused;

}



setTrackStyleFunction = function (feature) {
    trackColorIndex++;
    var color = "#" + _palette[trackColorIndex % _palette.length];
    feature.color = color;
    vectorTracksStyle.color = color;
    return vectorTracksStyle;
}
