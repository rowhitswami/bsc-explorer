var SCHOOLS = 'https://raw.githubusercontent.com/rowhitswami/bsc-explorer/master/app/data/schools.json?token=AD6AJSF3P3XKWQACUX6CP2K7FWHLA'


var school_map = L.map('school-map', { fullscreenControl: true }).setView([12.9716, 77.59465], 10);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'rowhitswami/ckdbliwct2a0x1inyze4sfgth',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoicm93aGl0c3dhbWkiLCJhIjoiY2tkN3A1dnRuMGJycjJ5czhqNmdscmZ1MyJ9.abR9R7t9yTNUfM3RON28AA'
}).addTo(school_map);


var schoolIcon = L.icon({
    iconUrl: 'static/images/school.png',
    iconSize: [25, 25]
});

$.getJSON(SCHOOLS, function (data) {
    var school_points = Array()
    $.each(data.features, function (index, element) {
        if (element.geometry.coordinates) {
            [element.geometry.coordinates[0], element.geometry.coordinates[1]] = [element.geometry.coordinates[1], element.geometry.coordinates[0]]
            school_points.push({
                'lat': element.geometry.coordinates[0],
                'lng': element.geometry.coordinates[1],
                'name': element.properties.name,
                'address': element.properties.address_full,
                'type': element.properties.type.name
            })
        }
    })

    var school_cluster_group = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true
    });

    $.each(school_points, function (index, point) {
        var tooltip = "<b>Name: </b>" + point.name + "</br>"
        tooltip += "<b>Address: </b>" + point.address + "</br>"
        tooltip += "<b>Type: </b>" + point.type
        var marker = L.marker(new L.LatLng(point['lat'], point['lng']), { icon: schoolIcon });
        marker.bindPopup(tooltip);
        school_cluster_group.addLayer(marker);
    })

    school_map.addLayer(school_cluster_group);
})

