_proximityInfo = null;

/**
 * setupTakeoffLocation
 *
 */
function setupTakeoffLocation() {
    var zipProximityInfoUrl = NetcoupeTracksDataUrl + `${_selectedYear}_proximity_info.zip`;
    _map.spin(true);
    JSZipUtils.getBinaryContent(zipProximityInfoUrl, function (err, data) {
        if (err) {
            toastr["error"]("Could not load ZIP: " + zipProximityInfoUrl);
            console.log(err);
            _map.spin(false);
        }
        JSZip.loadAsync(data).then(function (zip) {
            zip.file(Object.values(zip.files)[0].name).async("string")
                .then(function (data) {
                    if (typeof (data) !== 'object') {
                        data = JSON.parse(data);
                    }
                    _proximityInfo = data;
                    configureTakeoffLocation();
                })
                .finally(function () {
                    _map.spin(false);
                });
        });
    });
}

function configureTakeoffLocation() {
    (async () => {
        console.log("waiting for _pointsGeojson to be defined...");
        while (_pointsGeojson == null) // define the condition as you like
            await new Promise(resolve => setTimeout(resolve, 300));
        console.log("_pointsGeojson defined ! Can now inject info into properties...");

        // Enrich _pointsGeojson with take off information
        _.map(_pointsGeojson.features, injectTakeoffInformation);
    })();
}

function injectTakeoffInformation(f) {
    var fid1 = f.properties.fid1;
    var fid2 = f.properties.fid2;

    // Find takeoff location for fid
    tkoff_fid1 = _.find(_proximityInfo, { fid: fid1 });
    tkoff_fid2 = _.find(_proximityInfo, { fid: fid2 });


    // Enrich _pointsGeojson
    f.properties.fid1_tkoff_icao = tkoff_fid1 ? tkoff_fid1.tkoff_icao ? tkoff_fid1.tkoff_icao : "?" : "?";
    f.properties.fid1_tkoff_name = tkoff_fid1 ? tkoff_fid1.tkoff_name ? tkoff_fid1.tkoff_name : "?" : "?";

    f.properties.fid2_tkoff_icao = tkoff_fid2 ? tkoff_fid2.tkoff_icao ? tkoff_fid2.tkoff_icao : "?" : "?";
    f.properties.fid2_tkoff_name = tkoff_fid2 ? tkoff_fid2.tkoff_name ? tkoff_fid2.tkoff_name : "?" : "?";
}