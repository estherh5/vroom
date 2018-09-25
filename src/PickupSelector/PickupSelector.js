import React, { Component } from 'react';
import './PickupSelector.css';

import LocationInput from './LocationInput/LocationInput.js';
import DateRangeInput from './DateRangeInput/DateRangeInput.js';
import AdvanceButton from '../AdvanceButton/AdvanceButton.js';


// Rental pickup specifications component
class PickupSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allowAdvance: false
    }

    this.setLocation = this.setLocation.bind(this);
    this.setDates = this.setDates.bind(this);
    this.advanceSection = this.advanceSection.bind(this);
  }

  /* After component mounts, determine if the Advance button should be enabled
  (i.e., if any of the inputs do not have values) */
  componentDidMount() {
    if (!this.props.startDate || !this.props.endDate || !this.props.location) {
      return this.setState({allowAdvance: false});
    } else {
      return this.setState({allowAdvance: true});
    }
  }

  // Set rental pickup location when user selects location from input
  setLocation(location) {
    /* Determine if the Advance button should be enabled (i.e., if any of the
    inputs do not have values) */
    if (!this.props.startDate || !this.props.endDate || !location) {
      this.setState({allowAdvance: false});
    } else {
      this.setState({allowAdvance: true});
    }

    return this.props.setLocation(location);
  }

  /* Set start date and end date for rental period when user selects dates from
  inputs */
  setDates(startDate, endDate) {
    /* Determine if the Advance button should be enabled (i.e., if any of the
    inputs do not have values) */
    if (!startDate || !endDate || !this.props.location) {
      this.setState({allowAdvance: false});
    } else {
      this.setState({allowAdvance: true});
    }

    return this.props.setDates(startDate, endDate);
  }

  // Advance to next section of app
  advanceSection() {
    // Reset Advance button state
    this.setState({allowAdvance: false});

    return this.props.advanceSection();
  }

  render() {
    return (
      <div className={'row no-gutters w-100 justify-content-center ' +
        'pickup-container'}>

          <div className={'d-flex flex-wrap justify-content-center mx-5 ' +
            'pickup-input-container'}>

              <LocationInput
                location={this.props.location}
                setLocation={this.setLocation}
                disabled={this.props.disabled}
                />

              <DateRangeInput
                startDate={this.props.startDate}
                endDate={this.props.endDate}
                setDates={this.setDates}
                disabled={this.props.disabled}
                />

              <AdvanceButton
                disabled={!this.state.allowAdvance}
                advanceSection={this.advanceSection} />
        </div>

      </div>
    );
  }
}

export default PickupSelector;
