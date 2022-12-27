var _usedIcaoInMbTiles = [];
var _tracksCount = 0;

var _isUsedAirportsListDone = false;

function setupYearlyMbTiles() {
    var mapboxUrl = `https://thermalmap-tilehut-server-w4pyzgkhqa-od.a.run.app/${_targetYear}-tracks/{z}/{x}/{y}.pbf`;
    var layerId = `${_targetYear}tracks`;

    var mapboxVectorTileOptions = {
        rendererFactory: L.canvas.tile,
        vectorTileLayerStyles: { 
            [layerId]: function (properties, zoom) {
                var weight = 1;
                var opacity = 1;

                var trackIndex = (properties.flightId == undefined)
                    ? Math.floor(Math.random() * (20 - 1 + 1) + 1)
                    : properties.flightId;
                var trackColorcolor = "#" + _palette[trackIndex % _palette.length];

                // ----- Selected airport: hide needed tracks -----
                // Hide tracks without icao
                if (_currentAirportFilterValue && !properties.takeoff) {
                    trackColorcolor = 'rgba(0,0,0,0)';
                }

                // Hide tracks not selected
                if (_currentAirportFilterValue && properties.takeoff) {
                    if (!filterByTakeOffLocation(null, properties.takeoff)) {
                        trackColorcolor = 'rgba(0,0,0,0)';
                    }
                }

                // Collect used Icaos code to later filter selection
                if (properties.takeoff) {
                    if (_usedIcaoInMbTiles.indexOf(properties.takeoff) == -1) {
                        _usedIcaoInMbTiles.push(properties.takeoff);
                    }
                }
                _tracksCount++;

                return {
                    weight: weight,
                    color: trackColorcolor,
                    opacity: opacity
                }
            }
        }
    };

    _mapboxPbfLayer = L.vectorGrid.protobuf(mapboxUrl, mapboxVectorTileOptions);
    _mapboxPbfLayer.addTo(_map);

    setupTakeoffAirportSelecttion();

    _mapboxPbfLayer.on('load', function (e) {
        _mapboxPbfLayer.off('load');        // Remove event listener
        // Update list of selectable airfields according to airfields present in the tiles
        var oldCount = -1;
        var currentCount = 0;

        (async () => {
            console.log("Waiting for used Icao airfileds to be populated ...");
            // This is probably not needed anymore since the layer must be loaded now.
            //while (_usedIcaoInMbTiles.length == 0) {
            while (currentCount != oldCount) {
                oldCount = currentCount;
                currentCount = _tracksCount;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }       
                
            // _usedIcaoInMbTiles is populated
            if (!_isUsedAirportsListDone) {
                console.log(`Waiting for used Icao airfileds to be populated ...OK \n_usedIcaoInMbTiles.length= ${_usedIcaoInMbTiles.length}`);
                buildUsedAirportsList(_usedIcaoInMbTiles);
                startAirportSelectionPostProcessing(true);
                _isUsedAirportsListDone = true;
            }
            
            console.log(`_tracksCount= ${_tracksCount}`);
            // Triger UI Event to update display
            triggerEvent_mbtilesStatsChange();
        })();
    });

}
