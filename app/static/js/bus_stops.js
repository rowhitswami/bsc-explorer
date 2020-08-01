var bus_stop_map = L.map('bus-stop-map', { fullscreenControl: true }).setView([12.9716, 77.59465], 10);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'rowhitswami/ckdbliwct2a0x1inyze4sfgth',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoicm93aGl0c3dhbWkiLCJhIjoiY2tkN3A1dnRuMGJycjJ5czhqNmdscmZ1MyJ9.abR9R7t9yTNUfM3RON28AA'
}).addTo(bus_stop_map);


var busStopIcon = L.icon({
    iconUrl: 'static/images/bus_stop.png',
    iconSize: [25, 25]
});

$.getJSON('static/data/bus_stops.geojson', function (data) {

    var bus_stop_cluster_group = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true
    });

    $.each(data.features, function (index, point) {
        var tooltip = "<b>Name: </b>" + point.properties.name
        var marker = L.marker(new L.LatLng(point.properties.lat, point.properties.lon), { icon: busStopIcon });
        marker.bindPopup(tooltip);
        bus_stop_cluster_group.addLayer(marker);
    })

    bus_stop_map.addLayer(bus_stop_cluster_group);
})

