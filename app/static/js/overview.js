

$(function () {

    $.loadData = function (URL) {
        var data = $.ajax({
            url: URL,
            type: 'GET',
            async: false,
            dataType: 'json'
        }).responseJSON;
        return data
    }

    $.prepareSchoolData = function (data) {
        var schools = new Array()
        $.each(data.features, function (index, element) {
            if (element.geometry.coordinates) {
                schools.push({
                    'lat': element.geometry.coordinates[1],
                    'lng': element.geometry.coordinates[0],
                    'name': element.properties.name,
                    'address': element.properties.address_full,
                    'type': element.properties.type.name
                })
            }
        })
        return schools
    }

    $.prepareRoutesData = function (data) {
        var routes = new Array()
        $.each(data.features, function (index, element) {
            var route = Array()
            $.each(element.geometry.coordinates, function (index, coordinate) {
                route.push(coordinate.reverse())
            })
            routes.push(route)
        });

        return routes
    }

    var boundsData = $.loadData('static/data/bangalore_boundaries.geojson');
    var busStopsData = $.loadData('static/data/bus_stops.geojson');
    var schoolsData = $.loadData('static/data/schools.json');
    schoolsData = $.prepareSchoolData(schoolsData);
    var routesData = $.loadData('static/data/routes.json');
    routesData = $.prepareRoutesData(routesData);



    $.initMap = function (id, latlng, zoom) {
        var map = L.map(id, { fullscreenControl: true }).setView(latlng, zoom);
        return map
    }

    $.addTileLayer = function (map) {
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'rowhitswami/ckdbliwct2a0x1inyze4sfgth',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1Ijoicm93aGl0c3dhbWkiLCJhIjoiY2tkN3A1dnRuMGJycjJ5czhqNmdscmZ1MyJ9.abR9R7t9yTNUfM3RON28AA'
        }).addTo(map);
    }

    $.addBounds = function (map) {
        var boundStyle = {
            "color": "#00eaff",
            "weight": 4,
            "opacity": 0.1
        };
        L.geoJson(boundsData, { style: boundStyle }).addTo(map);
    }

    $.addBusStops = function (map) {
        var busStopsStyle = {
            radius: 1,
            fillColor: "#ff0055",
            color: "#ff0055",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        L.geoJson(busStopsData.features, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, busStopsStyle).bindPopup(feature.properties.name);
            }
        }).addTo(map);
    }

    $.addSchools = function (map) {
        var schoolStyle = {
            radius: 1,
            fillColor: "#00aeff",
            color: "#00aeff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        $.each(schoolsData, function (index, point) {
            var tooltip = point.name + ", " + point.address
            tooltip += " (" + point.type + ")"
            L.circleMarker([point['lat'], point['lng']], schoolStyle).addTo(map).bindPopup(tooltip);
        })
    }

    $.addRoutes = function (map) {
        var path = L.polyline.antPath(routesData, {
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

        map.addLayer(path);
        map.fitBounds(path.getBounds())

        var legend = L.control({ position: "bottomleft" });

        legend.onAdd = function (map) {
            var div = L.DomUtil.create("div", "legend");
            div.innerHTML += '<i style="background: #00aeff"></i><span>Schools</span><br>';
            div.innerHTML += '<i style="background: #ff0055"></i><span>Bus Stops</span><br>';
            div.innerHTML += '<i class="icon" style="background-image: url(https://d30y9cdsu7xlg0.cloudfront.net/png/194515-200.png);background-repeat: no-repeat;"></i><span>Bus Routes</span><br>';

            return div;
        };
        legend.addTo(map);
    }

    $.clusteredBusStops = function(map) {
        var busStopIcon = L.icon({
            iconUrl: 'static/images/bus_stop.png',
            iconSize: [25, 25]
        });

        var busStopClusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true
        });
    
        $.each(busStopsData.features, function (index, point) {
            var tooltip = "<b>Name: </b>" + point.properties.name
            var marker = L.marker(new L.LatLng(point.properties.lat, point.properties.lon), { icon: busStopIcon });
            marker.bindPopup(tooltip);
            busStopClusterGroup.addLayer(marker);
        })
    
        map.addLayer(busStopClusterGroup);
    }

    $.clusteredSchools = function (map) {
        var schoolIcon = L.icon({
            iconUrl: 'static/images/school.png',
            iconSize: [25, 25]
        });

        var schoolClusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true
        });
    
        $.each(schoolsData, function (index, point) {
            var tooltip = "<b>Name: </b>" + point.name + "</br>"
            tooltip += "<b>Address: </b>" + point.address + "</br>"
            tooltip += "<b>Type: </b>" + point.type
            var marker = L.marker(new L.LatLng(point['lat'], point['lng']), { icon: schoolIcon });
            marker.bindPopup(tooltip);
            schoolClusterGroup.addLayer(marker);
        })
        map.addLayer(schoolClusterGroup);
    }

    var overview_map = $.initMap('overview-map', [12.9716, 77.59465], 10)
    $.addTileLayer(overview_map)
    $.addBounds(overview_map)
    $.addBusStops(overview_map)
    $.addSchools(overview_map)
    $.addRoutes(overview_map)

    var bus_stops_map = $.initMap('bus-stop-map', [12.9716, 77.59465], 10)
    $.addTileLayer(bus_stops_map)
    $.clusteredBusStops(bus_stops_map)

    var schools_map = $.initMap('school-map', [12.9716, 77.59465], 10)
    $.addTileLayer(schools_map)
    $.clusteredSchools(schools_map)

})