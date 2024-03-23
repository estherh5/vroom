import React, { Component } from 'react';
import './BookingConfirm.css';

import InfoHeader from '../InfoHeader/InfoHeader.js';
import CarRow from '../CarTable/CarRow/CarRow.js';
import PickupMap from './PickupMap/PickupMap.js';
import ConfirmButton from './ConfirmButton/ConfirmButton.js';


// Rental car booking confirmation component
class BookingConfirm extends Component {
  constructor(props) {
    super(props);

    this.selectCar = this.selectCar.bind(this);
  }

  // Do nothing when user clicks on rental car
  selectCar() {
    return;
  }

  render() {
    // Get length of rental car period in days
    const days = this.props.endDate.diff(this.props.startDate, 'days');

    // Get state abbreviation for rental pickup location
    const locationState = this.props.location.label
      .split(', ')[this.props.location.label.split(', ').length - 2];

    return (
      <div className={'row no-gutters w-100 align-items-center ' +
        'justify-content-center confirm-container'}>

          <div className={'d-flex flex-column align-items-center ' +
            'confirm-review-container'}>

              <InfoHeader
                location={this.props.location.label}
                startDate={this.props.startDate}
                endDate={this.props.endDate}
                />

              <table className="w-100">
                <tbody>

                  <CarRow
                    id={this.props.selectedCar.id}
                    selected={this.props.selectedCar.selected}
                    days={days}
                    group={this.props.selectedCar.group}
                    company={this.props.selectedCar.company}
                    companyLogo={this.props.selectedCar.companyLogo}
                    address={this.props.selectedCar.address}
                    image={this.props.selectedCar.image}
                    type={this.props.selectedCar.type}
                    price={this.props.selectedCar.price}
                    selectCar={this.selectCar}
                    />

                </tbody>
              </table>

              <PickupMap
                from={this.props.location.placeId}
                to={this.props.selectedCar.address}
                state={locationState}
                />

              <ConfirmButton
                disabled={this.props.disabled}
                confirmBooking={this.props.confirmBooking} />

          </div>

      </div>
    );
  }
}

export default BookingConfirm;
