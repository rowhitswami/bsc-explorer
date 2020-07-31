const BOUNDARIES = 'https://raw.githubusercontent.com/rowhitswami/bsc-explorer/master/app/data/bangalore_boundaries.geojson?token=AD6AJSA4YZLSIT42BDBTMTC7FWAWQ'
const BUS_STOPS = 'https://raw.githubusercontent.com/rowhitswami/bsc-explorer/master/app/data/bus_stops.geojson?token=AD6AJSDCDSGUDHDB2QQP7S27FWGKM'
const ROUTES = 'https://raw.githubusercontent.com/rowhitswami/bsc-explorer/master/app/data/routes.json?token=AD6AJSBGLIIC2N6K6IRXJF27FWHJC'
const SCHOOLS = 'https://raw.githubusercontent.com/rowhitswami/bsc-explorer/master/app/data/schools.json?token=AD6AJSF3P3XKWQACUX6CP2K7FWHLA'

var mymap = L.map('base-map').setView([12.9716, 77.59465], 11);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/dark-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoicm93aGl0c3dhbWkiLCJhIjoiY2tkN3A1dnRuMGJycjJ5czhqNmdscmZ1MyJ9.abR9R7t9yTNUfM3RON28AA'
}).addTo(mymap);

var myStyle = {
    "color": "#00eaff",
    "weight": 4,
    "opacity": 0.1
};

$.getJSON(BOUNDARIES, function (data) {
    L.geoJson(data, { style: myStyle }).addTo(mymap);
});

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
    }
}


var bus_stop_style = {
    radius: 2,
    fillColor: "#ff0055",
    color: "#ff0055",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

$.getJSON(BUS_STOPS, function (data) {
    L.geoJson(data.features, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, bus_stop_style);
        },
        onEachFeature: onEachFeature
    }).addTo(mymap);
});

$.getJSON(ROUTES, function (data) {
    var routes = Array()
    $.each(data.features, function(index, element) {
        var route = Array()
        $.each(element.geometry.coordinates, function(index, coordinate) {
            [coordinate[0], coordinate[1]] = [coordinate[1], coordinate[0]]
            route.push(coordinate)
        })
        routes.push(route)
    });
    const path = L.polyline.antPath(routes, {
        "delay": 200,
        "dashArray": [
          100,
          100
        ],
        "weight": 1,
        "color": "#ff0055",
        "pulseColor": "#FFFFFF",
        "paused": false,
        "reverse": false,
        "hardwareAccelerated": true
      });
      mymap.addLayer(path);
      mymap.fitBounds(path.getBounds())
})


