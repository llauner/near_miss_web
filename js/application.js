var startZooomLevel = 5;
var minZoomLevel = 3;
var maxZoomLevel = 19;
var trackZoomLevel = 16;
var center = [47.5, 4.8];

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

// Leaflet Map options : https://leafletjs.com/reference-1.6.0.html#map-option
var _mapOptions = {
    //maxBounds: L.latLngBounds(MapMaxBounds[0], MapMaxBounds[1]),
    //maxBoundsViscosity: 1,
    scrollWheelZoom: true
}

function setupMap() {
    // Create the map
    _map = L.map('map', _mapOptions).setView(center, startZooomLevel);
    var sidebar = L.control.sidebar('sidebar').addTo(_map);

    var Thunderforest_Outdoors = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '45799462d9f6496aba635de79c086ea2',
        minZoom: minZoomLevel,
        maxZoom: maxZoomLevel,
        subdomains: ['a', 'b', 'c']
    });
    Thunderforest_Outdoors.addTo(_map);

    // Add scale
    L.control.scale({ maxWidth: 240, metric: true, imperial: false, position: 'bottomleft' }).addTo(_map);
}

function updateMapOptions(scrollWheelZoom) {
    setMapOption('scrollWheelZoom', scrollWheelZoom);
    showHideMeasuringTool(true);
}

function setMapOption( newMapOptionKey, newMapOptionVal ){
    // set map option
    L.Util.setOptions( _map, {[newMapOptionKey]: newMapOptionVal});
    // apply option to handler
    if ( _map[newMapOptionKey] instanceof L.Handler ) {
        if ( newMapOptionVal ) {
            _map[newMapOptionKey].enable();
        } else {
            _map[newMapOptionKey].disable();
        }
    }
}