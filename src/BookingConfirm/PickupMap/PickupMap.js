import React, { Component } from 'react';
import './PickupMap.css';


/* Map that displays directions from user's specified location to rental
company component */
class PickupMap extends Component {
  render() {
    // Set rental company location in <Address City State> format
    let destination = this.props.to.line1 + ' ' + this.props.to.city + ' ' +
      (this.props.to.region ? this.props.to.region : this.props.state);

    // Replace spaces with '+' symbol for Google Maps URL
    destination = destination.split(' ').join('+');

    return (
      <iframe frameBorder="0" title="Rental car company map"
        src={'https://www.google.com/maps/embed/v1/directions?origin=' +
        'place_id:' + this.props.from + "&destination=" + destination +
        "&key=" + process.env.REACT_APP_GOOGLE_KEY}>
      </iframe>
    );
  }
}

export default PickupMap;
