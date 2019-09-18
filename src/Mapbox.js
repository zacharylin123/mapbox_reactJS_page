import React from 'react';

import axios from 'axios';

var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiemFjbGluMTIzIiwiYSI6ImNrMG0zNWVsMTAwMnczY3J5dmNhMmVmZGEifQ.3vnqw5v8bFSlVjAt-wYS5w';


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


