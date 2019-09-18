import React from 'react';
import './App.css';

import Mapbox from './Mapbox';


class App extends React.Component {
  constructor(props) {
    super(props);
    // this.map = null;
    this.state = {

    };
  }

  render(){
    var divStyle = {
      position: 'relative',
      width: '1200px',
      height: '800px'
    };
    return (
      <div>

        <div>
            Mapbox test
        </div>

        {/* Important!
        To wrapper up the Mapbox component 
        or the mapbox will cover the whole page */}
        <div style={divStyle}>
          <Mapbox />
        </div>

      </div>
    );
  } 
}

export default App;
