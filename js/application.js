var startZooomLevel = 5;
var minZoomLevel = 3;
var maxZoomLevel = 19;
var _trackZoomLevel = 15;
var center = [47.5, 4.8];
var _selectedYear = 2022;

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


    var baseMapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    baseMapLayer.addTo(_map);

    // Add scale
    L.control.scale({ maxWidth: 240, metric: true, imperial: false, position: 'bottomleft' }).addTo(_map);
}

function removeLayers() {
    if (_layerVectorPoints)
        _map.removeLayer(_layerVectorPoints);
    if (_layerShortTrack1)
        _map.removeLayer(_layerShortTrack1);
    if (_layerShortTrack2)
        _map.removeLayer(_layerShortTrack2);
    if (_antPolyline1)
        _map.removeLayer(_antPolyline1);
    if (_antPolyline2)
        _map.removeLayer(_antPolyline2);
}

function setupLayers() {
    setupVectorPoints();
    setupVectorTracks();
    setupTakeoffLocation();
}

function switchYear(newYear) {
    _selectedYear = newYear;
    removeLayers();
    setupLayers();
}
