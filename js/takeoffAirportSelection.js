var _airportsName = null;
var _selectableAirportsName = [];


function setupTakeoffAirportSelecttion() {
    _airportsName = null;
    _selectableAirportsName = [];

    (async () => {
        console.log("Waiting for data to be loaded: Airports + Tracks");
        while (_airportsGeojson == null) // define the condition as you like
            await new Promise(resolve => setTimeout(resolve, 1000));
        // Airports list is loaded
        console.log("Data loaded: Airports + Tracks");
        collectAirportsName();
        startAirportSelectionPostProcessing();
        $("#select-airfield").trigger("change");
    })();
}


/**
 * collectAirportsName
 * Collect airports name from the list
 * */
function collectAirportsName() {
    _airportsName = [];
    _airportsGeojson.features.forEach(a => {
        var airportName = extractAirportName(a);
        var icao = getAirportIcao(airportName);
        // Add only airports with existing icao
        if (icao) {
            _airportsName.push(airportName);
        }
    });
}

function extractAirportName(feature) {
    return `${feature.properties.name} - ${feature.properties.icao}`;
}

function getAirportIndex(airportName) {
    const index = _selectableAirportsName.findIndex(object => {
        return object.toLocaleLowerCase().includes(airportName.toLocaleLowerCase());
    });
    return index;
}

/**
 * Get Icao code from string
 * @param {str} airportLabel Lable of the airport: Le Versoud - LFLG
 * @returns {str} The Icao code as shown in the lable: LFLG
 */
function getAirportIcao(airportLabel) {
    var icao = airportLabel.split("-").pop().trim();
    return icao;
}


/**
 * assignAirportToTrack
 * */
function startAirportSelectionPostProcessing(isRefresh=false) {

    if (!isRefresh) {
        if (_tracksGeojson &&
            (_tracksGeojson.features[0].properties.takeoff == undefined || _tracksGeojson.features[0].properties.takeoff == "")) {
            console.log("No takeoff location in file. Finding takeoff location from airports list.")
            assignAirportAndBuildAirportsList();                        // No takeoff location found in geojson
        } else {
            console.log("Takeoff location found in .geojson");
            buildUsedAirportsList();                                    // Takeoff location provided in geojson
        }
    }
  
    // Sort list of airfields
    _selectableAirportsName.sort();
    // Populate select box
    $("#select-airfield").children().remove().end();
    $("#select-airfield").append(`<option value=0>Aucun</option>`);

    _selectableAirportsName.forEach( (a, i) => {
        $("#select-airfield").append(`<option value=${i+1}>${a}</option>`);
    });

    enableAirportFilterSelection();         // Enable select box
}

function buildUsedAirportsList(usedIcaoCodesArray = null) {
    // Geojson vector track = dayly display
    if (_tracksGeojson) {
        var flatMap = _.flatMap(_tracksGeojson.features, 'properties');
        var usedIcaoCodes = _.uniqBy(flatMap, 'takeoff');
        var arrIcaoCodes = _.map(usedIcaoCodes, 'takeoff');

        const checker = value =>
            arrIcaoCodes.some(element => value.includes(element));
        _selectableAirportsName = _airportsName.filter(checker);
    }
    // Mbtiles = yearly display
    else {
        if (usedIcaoCodesArray != null) {
            const checker = value =>
                usedIcaoCodesArray.some(element => value.includes(element));
            _selectableAirportsName = _airportsName.filter(checker);
        }
        else 
            _selectableAirportsName = _airportsName
    }
    
}

/**
 * Find takeoff location for each track
 * Build List of used airports in features
 */
function assignAirportAndBuildAirportsList() {
    _tracksGeojson.features.forEach(t => {
        var trackStartingPoint = t.geometry.coordinates[0];
        var takeoffAirportName = null;
        // Look for airports near the takeoff location
        _airportsGeojson.features.every(a => {
            var airportCenter = a.geometry.coordinates;
            var airportName = extractAirportName(a);

            var IsTrackStartingAtAirport = ptInCircle(trackStartingPoint, airportCenter, 1000);

            if (IsTrackStartingAtAirport) {
                takeoffAirportName = airportName;
                //console.log(`Airport found: ${takeoffAirportName}`)

                if (!_selectableAirportsName.includes(takeoffAirportName))
                    _selectableAirportsName.push(takeoffAirportName);
                return false;
            }
            return true;
        });

        if (takeoffAirportName != null) {
            t.properties.takeoff = takeoffAirportName;
        }
    });
}

/**
 * filterByTakeOffLocation
 * @param {any} feature
 */
function filterByTakeOffLocation(feature, featureIcao) {
    if (_currentAirportFilterValue == null)
        return true;
    var currrentSelectedAirportLabel = _selectableAirportsName[_currentAirportFilterValue - 1];

    var featureAirport = (feature) ? feature.properties.takeoff : featureIcao;
    var currentAirportFilterName = (feature) ? currrentSelectedAirportLabel : getAirportIcao(currrentSelectedAirportLabel)

    if (featureAirport === currentAirportFilterName)
        return true;
}


/**
 * @description Check if a pt is in, on or outside of a circle.
 * @param {[float]} pt The point to test. An array of two floats - x and y coordinates.
 * @param {[float]} center The circle center. An array of two floats - x and y coordinates.
 * @param {float} r The circle radius.
 * @returns {-1 | 0 | 1} -1 if the point is inside, 0 if it is on and 1 if it is outside the circle.
 */
function ptInCircle(pt, center, r) {
    if (pt && center) {
        var d = haversine(pt[1], pt[0], center[1], center[0]);
        return (d <= r) ? true : false;
    }
}


Number.prototype.toRad = function () //to rad function which is used by the haversine formula
{
    return this * Math.PI / 180;
}

function haversine(lat1, lng1, lat2, lng2) {  //haversine foruma which is used to calculate the distance between 2 coordinates

    var lon1 = lng1;
    var lon2 = lng2;
    var R = 6371000; // metres
    var a = lat1.toRad();
    var b = lat2.toRad();
    var c = (lat2 - lat1).toRad();
    var d = (lon2 - lon1).toRad();

    var a = Math.sin(c / 2) * Math.sin(c / 2) +
        Math.cos(a) * Math.cos(b) *
        Math.sin(d / 2) * Math.sin(d / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c;
    return d;
}