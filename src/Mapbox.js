import React from 'react';

var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = 'pk.eyJ1IjoiemFjbGluMTIzIiwiYSI6ImNrMG0zNWVsMTAwMnczY3J5dmNhMmVmZGEifQ.3vnqw5v8bFSlVjAt-wYS5w';


export default class App extends React.Component {
    // map;
    constructor(props) {
      super(props);
      // this.map = null;
      this.state = {
  
      };
    }
    componentDidMount() {
        var map = new mapboxgl.Map({
        container: this.mapContainer ,
        style: 'mapbox://styles/mapbox/streets-v11'
        });
        
        // var map = new mapboxgl.Map({

        //   container: 'map',
        //   style: 'mapbox://styles/mapbox/dark-v10',
        //   center: [-103.59179687498357, 40.66995747013945],
        //   zoom: 3
        //   });
    

        // map.on('load', function () {
        //   map.addSource("earthquakes", {
        //     type: "geojson",
        //     // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        //     // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        //     data: "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
        //     cluster: true,
        //     clusterMaxZoom: 14, // Max zoom to cluster points on
        //     clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        //     });
            
    
        //   map.addLayer({
        //   "id": "route",
        //   "type": "line",
        //   "source": {
        //   "type": "geojson",
        //   "data": {
        //   "type": "Feature",
        //   "properties": {},
        //   "geometry": {
        //   "type": "LineString",
        //   "coordinates": [
        //   [-122.48369693756104, 37.83381888486939],
        //   [-122.48348236083984, 37.83317489144141],
        //   [-122.48339653015138, 37.83270036637107],
        //   [-122.48356819152832, 37.832056363179625],
        //   [-122.48404026031496, 37.83114119107971],
        //   [-122.48404026031496, 37.83049717427869],
        //   [-122.48348236083984, 37.829920943955045],
        //   [-122.48356819152832, 37.82954808664175],
        //   [-122.48507022857666, 37.82944639795659],
        //   [-122.48610019683838, 37.82880236636284],
        //   [-122.48695850372314, 37.82931081282506],
        //   [-122.48700141906738, 37.83080223556934],
        //   [-122.48751640319824, 37.83168351665737],
        //   [-122.48803138732912, 37.832158048267786],
        //   [-122.48888969421387, 37.83297152392784],
        //   [-122.48987674713133, 37.83263257682617],
        //   [-122.49043464660643, 37.832937629287755],
        //   [-122.49125003814696, 37.832429207817725],
        //   [-122.49163627624512, 37.832564787218985],
        //   [-122.49223709106445, 37.83337825839438],
        //   [-122.49378204345702, 37.83368330777276]
        //   ]
        //   }
        //   }
        //   },
        //   "layout": {
        //   "line-join": "round",
        //   "line-cap": "round"
        //   },
        //   "paint": {
        //   "line-color": "#888",
        //   "line-width": 8
        //   }
        //   });
        //   });

        // this.setFill();
        }

    render(){
        const style = {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '50%'
          };
      
          return <div style={style} ref={el => this.mapContainer = el} />;
        
    }

}


