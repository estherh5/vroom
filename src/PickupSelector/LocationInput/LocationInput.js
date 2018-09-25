import React, { Component } from 'react';
import './LocationInput.css';

import ReactDependentScript from 'react-dependent-script';

import Geosuggest from 'react-geosuggest';


// Rental pickup location input component
class LocationInput extends Component {
  constructor(props) {
    super(props);

    this.setLocation = this.setLocation.bind(this);
  }

  // Set rental pickup location when user selects location in input
  setLocation(location) {
    // If location is the correct format or is null, set location
    if (typeof location === 'object' || !location) {
      return this.props.setLocation(location);
    }

    return;
  }

  render() {
    return (
      <div className="d-flex align-items-center input-container">
        <i className="fas fa-map-marker-alt p-2"></i>

        <ReactDependentScript
          scripts={[
            'https://maps.googleapis.com/maps/api/js?key=' +
              process.env.REACT_APP_GOOGLE_KEY + '&libraries=places'
          ]}>

            <Geosuggest
              id="location-input"
              initialValue={this.props.location ? this.props.location.label :
                ''}
              placeholder="Pick up at..."
              autoComplete="off"
              country="us"
              types={['(cities)']}
              disabled={this.props.disabled}
              onSuggestSelect={this.setLocation}
              onBlur={this.setLocation} />

          </ReactDependentScript>
      </div>
    );
  }
}

export default LocationInput;
