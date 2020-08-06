document.addEventListener("DOMContentLoaded", function () {
    $('.preloader-background').delay(1700).fadeOut('slow');

    $('.preloader-wrapper')
        .delay(1700)
        .fadeOut();
}); 

$(document).ready(function () {
    $('.tooltipped').tooltip();

    // Load JSON data
    $.loadData = function (URL) {
        var data = $.ajax({
            url: URL,
            type: 'GET',
            async: false,
            dataType: 'json'
        }).responseJSON;
        return data
    }

    // Filtering schools data
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

    // Filtering routes data
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

    // Storing the data
    var boundsData = $.loadData('static/data/bangalore_boundaries.geojson');
    var busStopsData = $.loadData('static/data/bus_stops.geojson');
    var schoolsData = $.loadData('static/data/schools.json');
    preparedSchoolsData = $.prepareSchoolData(schoolsData);
    var routesData = $.loadData('static/data/routes.json');
    preparedRoutesData = $.prepareRoutesData(routesData);

    // Initializing base map
    $.initMap = function (id, latlng, zoom) {
        var map = L.map(id, { fullscreenControl: true }).setView(latlng, zoom);
        return map
    }

    // Adding tile layer
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

    // Adding boundaries from geojson data
    $.addBounds = function (map) {
        var boundStyle = {
            "color": "#00eaff",
            "weight": 4,
            "opacity": 0.1
        };
        L.geoJson(boundsData, { style: boundStyle }).addTo(map);
    }

    // Adding bus stops from geojson data
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

    // Adding schools from geojson data
    $.addSchools = function (map) {
        var schoolStyle = {
            radius: 1,
            fillColor: "#00aeff",
            color: "#00aeff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        $.each(preparedSchoolsData, function (index, point) {
            var tooltip = point.name + ", " + point.address
            tooltip += " (" + point.type + ")"
            L.circleMarker([point['lat'], point['lng']], schoolStyle).addTo(map).bindPopup(tooltip);
        })
    }

    // Adding routes from geojson data
    $.addRoutes = function (map) {
        var path = L.polyline.antPath(preparedRoutesData, {
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

        var legend = L.control({ position: "bottomleft" });

        // Adding legends on overview map
        legend.onAdd = function (map) {
            var div = L.DomUtil.create("div", "legend left-align z-depth-5");
            div.innerHTML += '<i style="background: #00aeff"></i><span>Schools</span><br>';
            div.innerHTML += '<i style="background: #ff0055"></i><span>Bus Stops</span><br>';
            div.innerHTML += '<i class="icon" style="background-image: url(https://d30y9cdsu7xlg0.cloudfront.net/png/194515-200.png);background-repeat: no-repeat;"></i><span>Bus Routes</span><br>';

            return div;
        };

        map.addLayer(path);
        map.fitBounds(path.getBounds())

        legend.addTo(map);
    }

    // Adding clustered bus stops
    $.clusteredBusStops = function (map) {
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

    // Adding clustered schools
    $.clusteredSchools = function (map) {
        var schoolIcon = L.icon({
            iconUrl: 'static/images/school.png',
            iconSize: [25, 25]
        });

        var schoolClusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true
        });

        $.each(preparedSchoolsData, function (index, point) {
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

    var bus_stops_map = $.initMap('bus-stop-map', [12.9999, 77.60465], 10)
    $.addTileLayer(bus_stops_map)
    $.clusteredBusStops(bus_stops_map)

    var schools_map = $.initMap('school-map', [12.9716, 77.59465], 10)
    $.addTileLayer(schools_map)
    $.clusteredSchools(schools_map)

    var routes_map = $.initMap('route-map', [12.9716, 77.59465], 10)
    $.addTileLayer(routes_map)
    var legend = L.control({ position: "bottomleft" });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend left-align z-depth-5");
        div.innerHTML += '<i style="background: #00BD20"></i><span>Schools</span><br>';
        div.innerHTML += '<i style="background: #FF8700"></i><span>Unreachable Schools</span><br>';
        div.innerHTML += '<i style="background: #ff0055"></i><span>Bus Stops</span><br>';
        div.innerHTML += '<i class="icon" style="background-image: url(https://d30y9cdsu7xlg0.cloudfront.net/png/194515-200.png);background-repeat: no-repeat;"></i><span>Bus Route</span><br>';

        return div;
    };
    legend.addTo(routes_map);

    // Filtering routes data for dropdown
    $.prepareShowRoutesData = function (data) {
        var routesValues = {}
        $.each(data.features, function (index, feature) {
            routesValues[feature.properties.route] = null
        })
        return routesValues
    }

    // Filtering routes data for route-map
    $.prepareRouteDetailsData = function (data) {
        var routeDetails = {}
        $.each(data.features, function (index, feature) {
            reversedCoordinates = new Array()
            $.each(feature.geometry.coordinates, function (index, coordinate) {
                reversedCoordinates.push(coordinate)
            })

            feature.properties.coordinates = reversedCoordinates
            routeDetails[feature.properties.route] = feature.properties
        })
        return routeDetails
    }

    // Getting distance between two geo coordinates using Haversine formula
    $.getDistance = function (origin, destination) {
        // converting to radian
        var lon1 = origin[1] * Math.PI / 180,
            lat1 = origin[0] * Math.PI / 180,
            lon2 = destination[1] * Math.PI / 180,
            lat2 = destination[0] * Math.PI / 180;
        EARTH_RADIUS = 6371;

        var deltaLat = lat2 - lat1;
        var deltaLon = lon2 - lon1;

        var a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
        var c = 2 * Math.asin(Math.sqrt(a));

        return c * EARTH_RADIUS * 1000;
    }

    // Preparing HTML for route-details card
    $.addRouteDetails = function (route) {
        var routeDetailsHTML = "<div class='card grey darken-4 z-depth-3'>"
        routeDetailsHTML += "<div class='card-content white-text'>"
        routeDetailsHTML += "<span class='card-title'>Route Details</span>"
        routeDetailsHTML += "<p><b>Origin: </b>" + route.origin + "</p>"
        routeDetailsHTML += "<p><b>Destination: </b>" + route.destination + "</p>"
        routeDetailsHTML += "<p><b>Distance: </b>" + route.distance + " miles</p>"
        routeDetailsHTML += "<p><b>First Arrival: </b>" + route.first_arrival + "</p>"
        routeDetailsHTML += "<p><b>Last Arrival: </b>" + route.last_arrival + "</p>"
        routeDetailsHTML += "<p><b>First Departure: </b>" + route.first_departure + "</p>"
        routeDetailsHTML += "<p><b>Last Departure: </b>" + route.last_departure + "</p>"
        routeDetailsHTML += "<p><b>Duration of trip: </b>" + route.duration * 60 + " minutes</p>"
        routeDetailsHTML += "<p><b>Speed: </b>" + route.speed.toFixed(2) + " mph</p>"
        routeDetailsHTML += "<p><b>No. of trips: </b>" + route.trips + "</p>"
        routeDetailsHTML += "</span></div></div>"
        return routeDetailsHTML
    }

    // Function to add nearby data points
    $.addNearby = function (data, style, map) {
        $.each(data, function (index, point) {
            L.circleMarker([point[0], point[1]], style).addTo(map).bindPopup(point[2]);
        })
    }

    // Function to update the route details on route-map
    $.updateSchoolReachability = function (route, routes_map, BUS_STOP_RADIUS, ROUTE_RADIUS) {

        // Updating the HTML
        var routeDetailsHTML = $.addRouteDetails(route)
        $('#route-details').html(routeDetailsHTML)

        // Finding bus stops nearby a route
        var nearbyBusStops = []
        $.each(route.coordinates, function (index, routeCoordinates) {
            $.each(busStopsData.features, function (index, busStop) {
                var distanceBusStopRoute = $.getDistance([routeCoordinates[0], routeCoordinates[1]], [busStop.geometry.coordinates[1], busStop.geometry.coordinates[0]])

                // Assuming the distance between a route and a bus stop to be 100 metres.
                if (distanceBusStopRoute < 100) {
                    nearbyBusStops.push([busStop.geometry.coordinates[1], busStop.geometry.coordinates[0], busStop.properties.name])
                }
            })
        })

        // Finding schools nearby a bus stop
        var schoolsNearbyBusStop = []
        $.each(nearbyBusStops, function (index, busStop) {
            $.each(preparedSchoolsData, function (index, school) {
                var distanceSchoolBusStop = $.getDistance([busStop[0], busStop[1]], [school.lat, school.lng])
                if (distanceSchoolBusStop < BUS_STOP_RADIUS) {
                    var tooltip = "<b>Name: </b>" + school.name + "</br>"
                    tooltip += "<b>Address: </b>" + school.address + "</br>"
                    tooltip += "<b>Type: </b>" + school.type
                    schoolsNearbyBusStop.push([school.lat, school.lng, tooltip])
                }
            })
        })

        // Finding schools nearby a route
        var schoolsNearbyRoute = []
        $.each(route.coordinates, function (index, routeCoordinates) {
            $.each(preparedSchoolsData, function (index, school) {
                var distanceSchoolRoute = $.getDistance([routeCoordinates[0], routeCoordinates[1]], [school.lat, school.lng])
                if (distanceSchoolRoute < ROUTE_RADIUS) {
                    var tooltip = "<b>Name: </b>" + school.name + "</br>"
                    tooltip += "<b>Address: </b>" + school.address + "</br>"
                    tooltip += "<b>Type: </b>" + school.type
                    schoolsNearbyRoute.push([school.lat, school.lng, tooltip])
                }
            })
        })

        // Finding the unreachable schools (difference of schools nearby route and schools nearby a bus stops)
        var unreachableSchools = _.differenceWith(schoolsNearbyRoute, schoolsNearbyBusStop, _.isEqual)

        // Drawing the route
        var path = L.polyline.antPath(route.coordinates, {
            "delay": 300,
            "dashArray": [
                20,
                20
            ],
            "weight": 4,
            "color": "#00ff95",
            "pulseColor": "#000000",
            "paused": false,
            "reverse": false,
            "hardwareAccelerated": true
        });

        // Removing all layers from the map
        routes_map.eachLayer(function (layer) {
            routes_map.removeLayer(layer);
        });

        var schoolsNearbyBusStopStyle = {
            radius: 3,
            fillColor: "#00BD20",
            color: "#00BD20",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        var nearbyBuStopsStyle = {
            radius: 2,
            fillColor: "#ff0055",
            color: "#ff0055",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        var unreachableSchoolsStyle = {
            radius: 3,
            fillColor: "#FF8700",
            color: "#FF8700",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        $.addTileLayer(routes_map)
        routes_map.addLayer(path);
        routes_map.fitBounds(path.getBounds())

        // Drawing each data points on route-map
        $.addNearby(schoolsNearbyBusStop, schoolsNearbyBusStopStyle, routes_map)
        $.addNearby(nearbyBusStops, nearbyBuStopsStyle, routes_map)
        $.addNearby(unreachableSchools, unreachableSchoolsStyle, routes_map)
    }


    var routeDetailsData = $.prepareRouteDetailsData(routesData)
    var route;

    // Initializing the autocomplete on routes id
    var instances = M.Autocomplete.init($('.autocomplete'), {
        data: $.prepareShowRoutesData(routesData),
        minLength: 0,
        onAutocomplete: function (id) {
            route = routeDetailsData[id]

            // Getting tghe bus stop radius and route radius from view
            var BUS_STOP_RADIUS = $('#bus-stop-radius').val()
            var ROUTE_RADIUS = $('#route-radius').val()

            // Updating the map on each valid autocomplete
            $.updateSchoolReachability(route, routes_map, BUS_STOP_RADIUS, ROUTE_RADIUS)
        }
    });

    // Clearing the input in autocomplete if it doesn't match any
    $('#autocomplete-input').on('keyup', function () {
        if (instances[0].count === 0) {
            $('#autocomplete-input').val('');
        }
    });

    // Updating the map on changing the route radius from view
    $('#route-radius').on('change', function () {
        var BUS_STOP_RADIUS = $('#bus-stop-radius').val()
        var ROUTE_RADIUS = this.value
        $.updateSchoolReachability(route, routes_map, BUS_STOP_RADIUS, ROUTE_RADIUS)
    });

    // Updating the map on changing the bus stop radius from view
    $('#bus-stop-radius').on('change', function () {
        var BUS_STOP_RADIUS = this.value
        var ROUTE_RADIUS = $('#route-radius').val()
        $.updateSchoolReachability(route, routes_map, BUS_STOP_RADIUS, ROUTE_RADIUS)
    });

})