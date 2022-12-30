var _tracksJson = null;
var _layerShortTrack1 = null;
var _layerShortTrack2 = null;
var trackColorIndex = 0;

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
    var zipVectorTracksUrl = NetcoupeTracksDataUrl + "2022_nearmiss_tracks.zip";
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
                    if (!_pointsGeojson) {
                        console.log(errorThrown);
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
function displayTracks() {
    // Get fid
    var fid1 = $("#bt-show-track").data("fid1");
    var fid2 = $("#bt-show-track").data("fid2");

    // Find geojson from both tracks
    var track1 = _.find(_tracksJson, { fid: fid1 });
    var track2 = _.find(_tracksJson, { fid: fid2 });

    _layerShortTrack1 = L.geoJSON(track1.track, {
        style: setTrackStyleFunction
    });

    _layerShortTrack2 = L.geoJSON(track2.track, {
        style: setTrackStyleFunction
    });
  
    _layerShortTrack1.addTo(_map);
    _layerShortTrack2.addTo(_map);
    
};

setTrackStyleFunction = function (feature) {
    trackColorIndex++;
    vectorTracksStyle.color = "#" + _palette[trackColorIndex % _palette.length];
    return vectorTracksStyle;
}