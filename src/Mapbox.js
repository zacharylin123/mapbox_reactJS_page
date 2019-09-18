import React from 'react';

import axios from 'axios';

var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiemFjbGluMTIzIiwiYSI6ImNrMG0zNWVsMTAwMnczY3J5dmNhMmVmZGEifQ.3vnqw5v8bFSlVjAt-wYS5w';

// Join local JSON data with vector tile geometry
// USA unemployment rate in 2009
// Source https://data.bls.gov/timeseries/LNS14000000
var maxValue = 13;
var tileData = [
    {"STATE_ID": "01", "unemployment": 13.17},
    {"STATE_ID": "02", "unemployment": 9.5},
    {"STATE_ID": "04", "unemployment": 12.15},
    {"STATE_ID": "05", "unemployment": 8.99},
    {"STATE_ID": "06", "unemployment": 11.83},
    {"STATE_ID": "08", "unemployment": 7.52},
    {"STATE_ID": "09", "unemployment": 6.44},
    {"STATE_ID": "10", "unemployment": 5.17},
    {"STATE_ID": "12", "unemployment": 9.67},
    {"STATE_ID": "13", "unemployment": 10.64},
    {"STATE_ID": "15", "unemployment": 12.38},
    {"STATE_ID": "16", "unemployment": 10.13},
    {"STATE_ID": "17", "unemployment": 9.58},
    {"STATE_ID": "18", "unemployment": 10.63},
    {"STATE_ID": "19", "unemployment": 8.09},
    {"STATE_ID": "20", "unemployment": 5.93},
    {"STATE_ID": "21", "unemployment": 9.86},
    {"STATE_ID": "22", "unemployment": 9.81},
    {"STATE_ID": "23", "unemployment": 7.82},
    {"STATE_ID": "24", "unemployment": 8.35},
    {"STATE_ID": "25", "unemployment": 9.1},
    {"STATE_ID": "26", "unemployment": 10.69},
    {"STATE_ID": "27", "unemployment": 11.53},
    {"STATE_ID": "28", "unemployment": 9.29},
    {"STATE_ID": "29", "unemployment": 9.94},
    {"STATE_ID": "30", "unemployment": 9.29},
    {"STATE_ID": "31", "unemployment": 5.45},
    {"STATE_ID": "32", "unemployment": 4.21},
    {"STATE_ID": "33", "unemployment": 4.27},
    {"STATE_ID": "34", "unemployment": 4.09},
    {"STATE_ID": "35", "unemployment": 7.83},
    {"STATE_ID": "36", "unemployment": 8.01},
    {"STATE_ID": "37", "unemployment": 9.34},
    {"STATE_ID": "38", "unemployment": 11.23},
    {"STATE_ID": "39", "unemployment": 7.08},
    {"STATE_ID": "40", "unemployment": 11.22},
    {"STATE_ID": "41", "unemployment": 6.2},
    {"STATE_ID": "42", "unemployment": 9.11},
    {"STATE_ID": "44", "unemployment": 10.42},
    {"STATE_ID": "45", "unemployment": 8.89},
    {"STATE_ID": "46", "unemployment": 11.03},
    {"STATE_ID": "47", "unemployment": 7.35},
    {"STATE_ID": "48", "unemployment": 8.92},
    {"STATE_ID": "49", "unemployment": 7.65},
    {"STATE_ID": "50", "unemployment": 8.01},
    {"STATE_ID": "51", "unemployment": 7.62},
    {"STATE_ID": "53", "unemployment": 7.77},
    {"STATE_ID": "54", "unemployment": 8.49},
    {"STATE_ID": "55", "unemployment": 9.42},
    {"STATE_ID": "56", "unemployment": 7.59}
    ];

export default class App extends React.Component {
    constructor(props) {
      super(props);
      // this.map = null;
      this.state = {
  
      };
    }

    getGeoData = (url) => {
        return axios.get(url)
            .then(res => {
                return res.data;
            })
    }

    async componentDidMount() {

        const geoData = await this.getGeoData("https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson")
        console.log(geoData)

        var map = new mapboxgl.Map({
        container: this.mapContainer ,
        style: 'mapbox://styles/mapbox/streets-v11'
        });
        
        map.addControl(new mapboxgl.NavigationControl());
        
        // filters for classifying earthquakes into five categories based on magnitude
        var mag1 = ["<", ["get", "mag"], 2];
        var mag2 = ["all", [">=", ["get", "mag"], 2], ["<", ["get", "mag"], 3]];
        var mag3 = ["all", [">=", ["get", "mag"], 3], ["<", ["get", "mag"], 4]];
        var mag4 = ["all", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]];
        var mag5 = [">=", ["get", "mag"], 5];
        
        // colors to use for the categories
        var colors = ['#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c'];
        


        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', 'earthquake_label', function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();

            // customize the popup html here
            // var description = e.features[0].properties.description;
            var description = "<h1>Hello World!</h1>"
            
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            
            new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
            });

        // cluster1
        map.on('load', function() {
            // Add a new source from our GeoJSON data and set the
            // 'cluster' option to true. GL-JS will add the point_count property to your source data.
            map.addSource("earthquakes1", {
            type: "geojson",
            // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
            // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
            data: geoData,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
            });
             
            map.addLayer({
            id: "clusters",
            type: "circle",
            source: "earthquakes1",
            filter: ["has", "point_count"],
            paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            100,
            "#f1f075",
            750,
            "#f28cb1"
            ],
            "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40
            ]
            }
            });
             
            map.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "earthquakes1",
            filter: ["has", "point_count"],
            layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
            }
            });
             
            map.addLayer({
            id: "unclustered-point",
            type: "circle",
            source: "earthquakes1",
            filter: ["!", ["has", "point_count"]],
            paint: {
            "circle-color": "#11b4da",
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
            }
            });
             
            // inspect a cluster on click
            map.on('click', 'clusters', function (e) {
            var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            var clusterId = features[0].properties.cluster_id;
            map.getSource('earthquakes1').getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err)
            return;
             
            map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
            });
            });
            });
             
            map.on('mouseenter', 'clusters', function () {
            map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'clusters', function () {
            map.getCanvas().style.cursor = '';
            });
            });


        // clusert2
        map.on('load', function () {
        // add a clustered GeoJSON source for a sample set of earthquakes
        map.addSource('earthquakes', {
        "type": "geojson",
        "data": geoData,
        "cluster": true,
        "clusterRadius": 80,
        "clusterProperties": { // keep separate counts for each magnitude category in a cluster
        "mag1": ["+", ["case", mag1, 1, 0]],
        "mag2": ["+", ["case", mag2, 1, 0]],
        "mag3": ["+", ["case", mag3, 1, 0]],
        "mag4": ["+", ["case", mag4, 1, 0]],
        "mag5": ["+", ["case", mag5, 1, 0]]
        }
        });
        // circle and symbol layers for rendering individual earthquakes (unclustered points)
        map.addLayer({
        "id": "earthquake_circle",
        "type": "circle",
        "source": "earthquakes",
        "filter": ["!=", "cluster", true],
        "paint": {
        "circle-color": ["case",
        mag1, colors[0],
        mag2, colors[1],
        mag3, colors[2],
        mag4, colors[3], colors[4]],
        "circle-opacity": 0.6,
        "circle-radius": 12
        }
        });
        map.addLayer({
        "id": "earthquake_label",
        "type": "symbol",
        "source": "earthquakes",
        "filter": ["!=", "cluster", true],
        "layout": {
        "text-field": ["number-format", ["get", "mag"], {"min-fraction-digits": 1, "max-fraction-digits": 1}],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": 10
        },
        "paint": {
        "text-color": ["case", ["<", ["get", "mag"], 3], "black", "white"]
        }
        });

        // add the polyline layer in the map
        map.addLayer({
            'id': 'lines',
            'type': 'line',
            'source': {
            'type': 'geojson',
            'data': {
            'type': 'FeatureCollection',
            'features': [{
            'type': 'Feature',
            'properties': {
            'color': '#F7455D' // red
            },
            'geometry': {
            'type': 'LineString',
            'coordinates': [
            [-122.4833858013153, 37.829607404976734],
            [-122.4830961227417, 37.82932776098012],
            [-122.4830746650696, 37.82932776098012],
            [-122.48218417167662, 37.82889558180985],
            [-122.48218417167662, 37.82890193740421],
            [-122.48221099376678, 37.82868372835086],
            [-122.4822163581848, 37.82868372835086],
            [-122.48205006122589, 37.82801003030873]
            ]
            }
            }, {
            'type': 'Feature',
            'properties': {
            'color': '#33C9EB' // blue
            },
            'geometry': {
            'type': 'LineString',
            'coordinates': [
            [-122.48393028974533, 37.829471820141016],
            [-122.48395174741744, 37.82940826466351],
            [-122.48395174741744, 37.829412501697064],
            [-122.48423874378203, 37.829357420242125],
            [-122.48422533273697, 37.829361657278575],
            [-122.48459815979002, 37.8293425906126],
            [-122.48458743095398, 37.8293447091313],
            [-122.4847564101219, 37.82932776098012],
            [-122.48474299907684, 37.829331998018276],
            [-122.4849334359169, 37.829298101706186],
            [-122.48492807149889, 37.82930022022615],
            [-122.48509705066681, 37.82920488676767],
            [-122.48509168624878, 37.82920912381288],
            [-122.48520433902739, 37.82905870855876],
            [-122.48519897460936, 37.82905870855876],
            [-122.4854403734207, 37.828594749716714],
            [-122.48543500900269, 37.82860534241688],
            [-122.48571664094925, 37.82808206121068],
            [-122.48570591211319, 37.82809689109353],
            [-122.4858346581459, 37.82797189627337],
            [-122.48582661151886, 37.82797825194729],
            [-122.4859634041786, 37.82788503534145],
            [-122.48595803976059, 37.82788927246246],
            [-122.48605459928514, 37.82786596829394]
            ]
            }
            }]
            }
            },
            'paint': {
            'line-width': 3,
            // Use a get expression (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-get)
            // to set the line-color to a feature property value.
            'line-color': ['get', 'color']
            }
            });
        
        // objects for caching and keeping track of HTML marker objects (for performance)
        var markers = {};
        var markersOnScreen = {};
        
        function updateMarkers() {
        var newMarkers = {};
        var features = map.querySourceFeatures('earthquakes');
        
        // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
        // and add it to the map if it's not there already
        for (var i = 0; i < features.length; i++) {
        var coords = features[i].geometry.coordinates;
        var props = features[i].properties;
        if (!props.cluster) continue;
        var id = props.cluster_id;
        
        var marker = markers[id];
        if (!marker) {
        var el = createDonutChart(props);
        marker = markers[id] = new mapboxgl.Marker({element: el}).setLngLat(coords);
        }
        newMarkers[id] = marker;
        
        if (!markersOnScreen[id])
        marker.addTo(map);
        }
        // for every marker we've added previously, remove those that are no longer visible
        for (id in markersOnScreen) {
        if (!newMarkers[id])
        markersOnScreen[id].remove();
        }
        markersOnScreen = newMarkers;
        }
        
        // after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
        map.on('data', function (e) {
        if (e.sourceId !== 'earthquakes' || !e.isSourceLoaded) return;
        
        map.on('move', updateMarkers);
        map.on('moveend', updateMarkers);
        updateMarkers();
        });
        });
        
        // code for creating an SVG donut chart from feature properties
        function createDonutChart(props) {
        var offsets = [];
        var counts = [props.mag1, props.mag2, props.mag3, props.mag4, props.mag5];
        var total = 0;
        for (var i = 0; i < counts.length; i++) {
        offsets.push(total);
        total += counts[i];
        }
        var fontSize = total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
        var r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
        var r0 = Math.round(r * 0.6);
        var w = r * 2;
        
        var html = '<svg width="' + w + '" height="' + w + '" viewbox="0 0 ' + w + ' ' + w +
        '" text-anchor="middle" style="font: ' + fontSize + 'px sans-serif">';
        
        for (i = 0; i < counts.length; i++) {
        html += donutSegment(offsets[i] / total, (offsets[i] + counts[i]) / total, r, r0, colors[i]);
        }
        html += '<circle cx="' + r + '" cy="' + r + '" r="' + r0 +
        '" fill="white" /><text dominant-baseline="central" transform="translate(' +
        r + ', ' + r + ')">' + total.toLocaleString() + '</text></svg>';
        
        var el = document.createElement('div');
        el.innerHTML = html;
        return el.firstChild;
        }
        
        function donutSegment(start, end, r, r0, color) {
        if (end - start === 1) end -= 0.00001;
        var a0 = 2 * Math.PI * (start - 0.25);
        var a1 = 2 * Math.PI * (end - 0.25);
        var x0 = Math.cos(a0), y0 = Math.sin(a0);
        var x1 = Math.cos(a1), y1 = Math.sin(a1);
        var largeArc = end - start > 0.5 ? 1 : 0;
        
        return ['<path d="M', r + r0 * x0, r + r0 * y0, 'L', r + r * x0, r + r * y0,
        'A', r, r, 0, largeArc, 1, r + r * x1, r + r * y1,
        'L', r + r0 * x1, r + r0 * y1, 'A',
        r0, r0, 0, largeArc, 0, r + r0 * x0, r + r0 * y0,
        '" fill="' + color + '" />'].join(' ');
        }

        // add the tile        
    map.on('load', function() { 
        // Add source for state polygons hosted on Mapbox, based on US Census Data:
        // https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html
        map.addSource("states", {
        type: "vector",
        url: "mapbox://mapbox.us_census_states_2015"
        });
        
        var expression = ["match", ["get", "STATE_ID"]];
        
        // Calculate color for each state based on the unemployment rate
        tileData.forEach(function(row) {
        var green = (row["unemployment"] / maxValue) * 255;
        var color = "rgba(" + 0 + ", " + green + ", " + 0 + ", 1)";
        expression.push(row["STATE_ID"], color);
        });
        
        // Last value is the default, used where there is no data
        expression.push("rgba(0,0,0,0)");
        
        // Add layer from the vector tile source with data-driven style
        map.addLayer({
        "id": "states-join",
        "type": "fill",
        "source": "states",
        "source-layer": "states",
        "paint": {
        "fill-color": expression
        }
        }, 'waterway-label');
        });

    }

    render(){
        // Important!
        // Must add a style for the mapbox div
        // or it will not show on the screen
        const style = {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '100%'
          };

          return <div style={style} ref={el => (this.mapContainer = el)} />;
        
    }

}


