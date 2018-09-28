import React, { Component } from 'react';
import './CarTable.css';

import InfoHeader from '../InfoHeader/InfoHeader.js';
import CarRow from './CarRow/CarRow.js';
import AdvanceButton from '../AdvanceButton/AdvanceButton.js';


// Table of rental car options component
class CarTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allowAdvance: false
    }

    this.setSort = this.setSort.bind(this);
    this.selectCar = this.selectCar.bind(this);
    this.advanceSection = this.advanceSection.bind(this);
  }

  /* After component mounts, determine if the Advance button should be enabled
  (i.e., if there is a selected car) */
  componentDidMount() {
    if (this.props.cars.find(car => car.selected === true)) {
      return this.setState({allowAdvance: true});
    } else {
      return this.setState({allowAdvance: false});
    }
  }

  setSort(e) {
    const sortOption = e.target.options[e.target.selectedIndex].text;

    return this.props.setSort(sortOption);
  }

  // Set selected car when user clicks on it
  selectCar(carId) {
    /* Determine if the Advance button should be enabled (i.e., if user clicked
    on a car */
    if (!carId) {
      this.setState({allowAdvance: false});
    } else {
      this.setState({allowAdvance: true});
    }

    return this.props.selectCar(carId);
  }

  // Advance to next section of app
  advanceSection() {
    // Reset Advance button state
    this.setState({allowAdvance: false});

    return this.props.advanceSection();
  }

  render() {
    // Get length of rental period in days
    const days = this.props.endDate.diff(this.props.startDate, 'days');

    // Get state abbreviation for rental pickup location
    const locationState = this.props.location.label
      .split(', ')[this.props.location.label.split(', ').length - 2];

    return (
      <div
        className={'row no-gutters w-100 flex-column justify-content-center ' +
          'align-items-center cars-container'}>

          <InfoHeader
            location={this.props.location.label}
            startDate={this.props.startDate}
            endDate={this.props.endDate}
            />

          <div className={'row no-gutters w-100 justify-content-end ' +
            'cars-table-container'}>

              <div className="sort-menu mt-4">
                <span className="sort-title">
                  Sort by...
                </span>

                <select
                  title="Sort car rental results"
                  onChange={this.setSort}>
                    <option>price</option>
                    <option>distance</option>
                    <option>type</option>
                </select>

              </div>

              <table className="cars-table">
                <tbody>

                  {this.props.cars.map((car, ind) =>
                    <CarRow
                      key={car.id + ind}
                      id={car.id}
                      selected={car.selected}
                      days={days}
                      state={locationState}
                      acriss={car.acriss}
                      company={car.company.toLowerCase()}
                      coords={car.coords}
                      address={car.address}
                      airport={car.airport ? car.airport : null}
                      category={car.category}
                      type={car.type}
                      price={car.price}
                      selectCar={this.selectCar}
                      />
                  )}

                </tbody>
              </table>

          </div>

          <AdvanceButton
            disabled={this.state.allowAdvance ? false : true}
            advanceSection={this.advanceSection} />

      </div>
    );
  }
}

export default CarTable;
