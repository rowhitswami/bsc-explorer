const BOUNDARIES = 'https://raw.githubusercontent.com/rowhitswami/bsc-explorer/master/app/data/bangalore_boundaries.geojson?token=AD6AJSA4YZLSIT42BDBTMTC7FWAWQ'
const BUS_STOPS = 'https://raw.githubusercontent.com/rowhitswami/bsc-explorer/master/app/data/bus_stops.geojson?token=AD6AJSDCDSGUDHDB2QQP7S27FWGKM'
const ROUTES = 'https://raw.githubusercontent.com/rowhitswami/bsc-explorer/master/app/data/routes.json?token=AD6AJSBGLIIC2N6K6IRXJF27FWHJC'
const SCHOOLS = 'https://raw.githubusercontent.com/rowhitswami/bsc-explorer/master/app/data/schools.json?token=AD6AJSF3P3XKWQACUX6CP2K7FWHLA'

var mymap = L.map('base-map', {
    renderer: L.canvas()
}).setView([12.9716, 77.59465], 11);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'rowhitswami/ckdbliwct2a0x1inyze4sfgth',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoicm93aGl0c3dhbWkiLCJhIjoiY2tkN3A1dnRuMGJycjJ5czhqNmdscmZ1MyJ9.abR9R7t9yTNUfM3RON28AA'
}).addTo(mymap);

var myStyle = {
    "color": "#00eaff",
    "weight": 4,
    "opacity": 0.1
};

// $.getJSON(BOUNDARIES, function (data) {
//     L.geoJson(data, { style: myStyle }).addTo(mymap);
// });

function busStopTooltip(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
    }
}


var bus_stop_style = {
    radius: 1,
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
        onEachFeature: busStopTooltip
    }).addTo(mymap);
});


var school_style = {
    radius: 1,
    fillColor: "#00aeff",
    color: "#00aeff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

function schoolTooltip(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
    }
}


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

    $.each(school_points, function(index, point) {
        var tooltip  = point.name + ", " + point.address
        tooltip += "(" + point.type + ")"
        L.circleMarker([point['lat'], point['lng']], school_style).addTo(mymap).bindPopup(tooltip);
    })
})

$.getJSON(ROUTES, function (data) {
    var routes = Array()
    $.each(data.features, function (index, element) {
        var route = Array()
        $.each(element.geometry.coordinates, function (index, coordinate) {
            [coordinate[0], coordinate[1]] = [coordinate[1], coordinate[0]]
            route.push(coordinate)
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
        "color": "#00ff95",
        "pulseColor": "#000000",
        "paused": false,
        "reverse": false,
        "hardwareAccelerated": true
    });
    mymap.addLayer(path);
    mymap.fitBounds(path.getBounds())
})


/*Legend specific*/
var legend = L.control({ position: "bottomleft" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += '<i style="background: #00aeff"></i><span>Schools</span><br>';
  div.innerHTML += '<i style="background: #ff0055"></i><span>Bus Stops</span><br>';
  div.innerHTML += '<i class="icon" style="background-image: url(https://d30y9cdsu7xlg0.cloudfront.net/png/194515-200.png);background-repeat: no-repeat;"></i><span>Bus Routes</span><br>';

  return div;
};

legend.addTo(mymap);
