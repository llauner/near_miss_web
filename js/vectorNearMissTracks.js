var _tracksJson = null;
var _layerShortTrack1 = null;
var _layerShortTrack2 = null;
var trackColorIndex = 0;

var _currentZoom = null;

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
function displayTracks(fid1, fid2, pointsGeoJsonIndex) {
    //// Get fid
    //var fid1 = $("#bt-show-track").data("fid1");
    //var fid2 = $("#bt-show-track").data("fid2");
    //var pointsToGeoJsonIndex = $("#bt-show-track").data("points-index");

    // Fly to position and zoom
    var center = _pointsGeojson.features[pointsGeoJsonIndex].geometry.coordinates[0];
    center = [center[1], center[0]];

    _currentZoom = _map.getZoom();
    _map.flyTo(center);
        //, 13,
        //{
        //    animate:false
        //});

    // --- Display tracks
    // Find geojson from both tracks
    var track1 = _.find(_tracksJson, { fid: fid1 });
    var track2 = _.find(_tracksJson, { fid: fid2 });

    if (_layerShortTrack1 != null && _layerShortTrack2 != null)
    {
        _map.removeLayer(_layerShortTrack1);
        _map.removeLayer(_layerShortTrack2);
    }

    _layerShortTrack1 = L.geoJSON(track1.track, {
        style: setTrackStyleFunction
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


    //var line1 = L.polyline(polyLine1);
    //line1.addTo(_map);
    //var line2 = L.polyline(polyLine2);
    //line2.addTo(_map);

    //line1.snakeIn();
    //line2.snakeIn();

    //line1.remove(_map);
    //line2.remove(_map);

    //var myIcon = L.icon({
    //    iconUrl: '/images/glider.png',
    //    iconSize: [50, 50]
    //});


    //L.motion.polyline(polyLine1, {
    //    color: "transparent"
    //}, {
    //    auto: true,
    //    duration: 10000,
    //   // easing: L.Motion.Ease.easeInOutQuart
    //}, {
    //    removeOnEnd: true,
    //    showMarker: true,
    //    icon: L.divIcon({
    //        icon: L.divIcon({
    //            html: "<i class='fa fa-plane fa-2x' aria-hidden='true'  motion-base='-48'></i>",
    //            iconSize:L.point(19, 24)
    //        })
    //    })
    //}).addTo(_map);

    //L.motion.polyline(polyLine2, {
    //    color: "transparent"
    //}, {
    //    auto: true,
    //    duration: 10000,
    //    //easing: L.Motion.Ease.easeInOutQuart
    //}, {
    //    removeOnEnd: true,
    //    showMarker: true,
    //    icon: L.divIcon({
    //        html: "<i class='fa fa-plane fa-2x' aria-hidden='true'  motion-base='-48'></i>",
    //        iconSize: L.point(19, 24)
    //    })
    //}).addTo(_map);


    //var myIcon = L.icon({
    //    iconUrl: '/images/glider.png',
    //    iconSize: [50, 50]
    //});


    //var myMovingMarker1 = L.Marker.movingMarker(polyLine1,
    //    7000,
    //    {
    //        loop: true,
    //        icon: myIcon
    //    }).addTo(_map);
    ////...


    //var myMovingMarker2 = L.Marker.movingMarker(polyLine2,
    //    7000,
    //    {
    //        loop: true,
    //        icon: myIcon
    //    }).addTo(_map);
    ////...


    //myMovingMarker1.start();
    //myMovingMarker2.start();


    //var line = L.polyline(pl),
    //    animatedMarker = L.animatedMarker(line.getLatLngs(),
    //        {
    //            distance: 1000,
    //            interval: 500,
    //            icon: myIcon
    //        });

    //_map.addLayer(animatedMarker);
    //animatedMarker.start();

};

setTrackStyleFunction = function (feature) {
    trackColorIndex++;
    vectorTracksStyle.color = "#" + _palette[trackColorIndex % _palette.length];
    return vectorTracksStyle;
}