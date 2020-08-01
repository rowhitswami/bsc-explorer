var route_map = L.map('route-map', { fullscreenControl: true }).setView([12.9716, 77.59465], 10);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'rowhitswami/ckdbliwct2a0x1inyze4sfgth',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoicm93aGl0c3dhbWkiLCJhIjoiY2tkN3A1dnRuMGJycjJ5czhqNmdscmZ1MyJ9.abR9R7t9yTNUfM3RON28AA'
}).addTo(route_map);

$.getJSON('static/data/routes.json', function (data) {
    var routes = Array()
    $.each(data.features, function (index, element) {
        var route = Array()
        $.each(element.geometry.coordinates, function (index, coordinate) {
            route.push(coordinate.reverse())
        })
        routes.push(route)
    });
    const path = L.polyline.antPath(routes, {
        "delay": 800,
        "dashArray": [
            20,
            100
        ],
        "weight": 1,
        "color": "#ff0080",
        "pulseColor": "#ff0080",
        "paused": true,
        "reverse": false,
        "hardwareAccelerated": true
    });
    route_map.addLayer(path);
    route_map.fitBounds(path.getBounds())
})

