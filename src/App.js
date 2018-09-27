import React, { Component } from 'react';
import './App.css';

import * as moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';

import Modal from './Modal/Modal.js';
import PageHeader from './PageHeader/PageHeader.js';
import SiteMenu from './SiteMenu/SiteMenu.js';
import PickupSelector from './PickupSelector/PickupSelector.js';
import CarTable from './CarTable/CarTable.js';
import BookingConfirm from './BookingConfirm/BookingConfirm.js';


// Main application component
class App extends Component {
  constructor() {
    super();

    this.state = {
      buttons: [  // Page header buttons to navigate sections
        {
          name: 'pickup',
          icon: 'far fa-calendar-alt',
          bgColor: '#f9c0c0',
          color: '#ff4f4f',
          selected: true,
          disabled: false
        },
        {
          name: 'rentals',
          icon: 'fas fa-car',
          bgColor: '#fdf59b',
          color: '#ffeb00',
          selected: false,
          disabled: true
        },
        {
          name: 'confirm',
          icon: 'fas fa-check',
          bgColor: '#afffb3',
          color: '#66ff6d',
          selected: false,
          disabled: true
        }
      ],
      startDate: moment(),  // Start date for car rental period
      endDate: moment(),  // End date for car rental period
      location: null,  // Pickup location for car rental
      cars: null,  // List of rental car results
      displayModal: false,  // Whether or not modal should display
      modalMessage: null,  // Message that should display in modal
      serverStatus: null,  // API request status ('success' or 'fail')
      pickupSubmitted: false,  // Whether or not pickup search was submitted
      bookingSubmitted: false  // Whether or not booking was submitted
    };

    // List of car categories based on ACRISS code
    this.categories = {
      M: 'Mini',
      N: 'Mini Elite',
      E: 'Economy',
      H: 'Economy Elite',
      C: 'Compact',
      D: 'Compact Elite',
      I: 'Intermediate',
      J: 'Intermediate Elite',
      S: 'Standard',
      R: 'Standard Elite',
      F: 'Fullsize',
      G: 'Fullsize Elite',
      P: 'Premium',
      U: 'Premium Elite',
      L: 'Luxury',
      W: 'Luxury Elite',
      O: 'Oversize',
      X: 'Special'
    }

    // List of car types based on ACRISS code
    this.types = {
      B: '2-3 Door',
      C: '2/4 Door',
      D: '4-5 Door',
      W: 'Wagon/Estate',
      V: 'Passenger Van',
      L: 'Limousine',
      S: 'Sport',
      T: 'Convertible',
      F: 'SUV',
      J: 'Open Air All Terrain',
      X: 'Special',
      P: 'Pickup Regular Car',
      Q: 'Pickup Extended Car',
      Z: 'Special Offer Car',
      E: 'Coupe',
      M: 'Monospace',
      R: 'Recreational Vehicle',
      H: 'Motor Home',
      Y: '2 Wheel Vehicle',
      N: 'Roadster',
      G: 'Crossover',
      K: 'Commercial Van/Truck'
    }

    this.setSelectedButton = this.setSelectedButton.bind(this);
    this.setLocation = this.setLocation.bind(this);
    this.setDates = this.setDates.bind(this);
    this.getCars = this.getCars.bind(this);
    this.selectCar = this.selectCar.bind(this);
    this.advanceSection = this.advanceSection.bind(this);
    this.confirmBooking = this.confirmBooking.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  // Set clicked page header button as selected
  setSelectedButton(buttonName) {
    let updatedButtons = cloneDeep(this.state.buttons);

    // Set clicked button as selected and all others as unselected
    updatedButtons.map(button => button.name === buttonName ?
      button.selected = true : button.selected = false);

    // Get index of selected button in buttons array
    const selectedIndex = updatedButtons
      .findIndex(button => button.selected === true);

    /* Set buttons that are displayed after the selected button as disabled so
    user can't toggle to those sections without completing the information in
    the section(s) before it */
    updatedButtons.map((button, ind) => ind > selectedIndex ?
      button.disabled = true : button.disabled = false);

    /* Reset pickup and booking states to allow user to fill out those sections
    again when toggling to previous section */
    if (selectedIndex < 2) {
      this.setState({pickupSubmitted: false, bookingSubmitted: false});
    }

    // Reset cursor to default style
    document.body.style.cursor = 'default';

    return this.setState({buttons: updatedButtons});
  }

  // Set rental pickup location when user fills out input
  setLocation(location) {
    return this.setState({location: location});
  }

  // Set start and end dates for rental period when user fills out inputs
  setDates(startDate, endDate) {
    return this.setState({startDate: startDate, endDate: endDate});
  }

  // Get rental cars from Amadeus API
  getCars(updatedButtons) {
    // Set pickup submitted state to true to disable pickup section inputs
    this.setState({pickupSubmitted: true});

    // Get latitude and longitude of rental pickup location
    const latitude = this.state.location.location.lat;
    const longitude = this.state.location.location.lng;

    // Get pickup and drop-off dates in Amadeus-required format
    const pickupDate = this.state.startDate.format('YYYY-MM-DD');
    const dropOffDate = this.state.endDate.format('YYYY-MM-DD');

    return fetch('https://api.sandbox.amadeus.com/v1.2/cars/search-circle' +
      '?apikey=' + process.env.REACT_APP_AMADEUS_KEY + '&latitude=' +
      latitude + '&longitude=' + longitude + '&radius=42&pick_up=' +
      pickupDate + '&drop_off=' + dropOffDate)

      // Reset cursor style and display error modal if API returns error
      .catch(error => {
        document.body.style.cursor = 'default';

        this.setState({
          displayModal: true,
          modalMessage: 'Your rental car request could not be processed. ' +
            'Please try again soon.',
          serverStatus: 'fail',
          pickupSubmitted: false
        });
      })

      .then(response => {
        /* If API responds successfully, reset cursor style and store rental car
        data */
        if (response && response.ok) {
          response.json().then(rentals => {
            // If there are no rental cars returned, display error modal
            if (rentals.results.length === 0) {
              document.body.style.cursor = 'default';

              this.setState({
                displayModal: true,
                modalMessage: 'No cars could be found for your location and ' +
                  'date range. Please update your search criteria.',
                serverStatus: 'fail',
                pickupSubmitted: false
              });
            }

            else {
              let cars = [];

              /* Store rental car information for returned results up to 20
              cars */
              rentals.results.forEach(rental => {
                if (cars.length < 20) {
                  rental.cars.forEach(car => {
                    if (cars.length < 20) {
                      const acriss = car.vehicle_info.acriss_code;

                      /* Format rental company address to title case, excluding
                      directional acronyms */
                      rental.address.line1 = rental.address.line1
                        .replace(/\w\S*/g, word =>
                          ['NE', 'NW', 'SE', 'SW'].includes(word) ? word :
                          word.charAt(0).toUpperCase() + word.substr(1)
                          .toLowerCase());

                      // Format rental company city to title case
                      rental.address.city = rental.address.city
                        .replace(/\w\S*/g, word =>
                          word.charAt(0).toUpperCase() + word.substr(1)
                          .toLowerCase());

                      // Format rental company name to title case
                      rental.provider.company_name = rental.provider
                        .company_name.replace(/\w\S*/g, word =>
                          word.charAt(0).toUpperCase() + word.substr(1)
                          .toLowerCase());

                      /* Get difference between searched pickup location and
                      rental car company's longitudes and latitudes */
                      const distance = Math.abs(rental.location.latitude -
                        this.state.location.location.lat) +
                        Math.abs(rental.location.longitude -
                        this.state.location.location.lng);

                      cars.push({
                        id: rental.provider.company_code + acriss,
                        type: this.types[acriss.charAt(1)],
                        category: this.categories[acriss.charAt(0)],
                        selected: false,
                        acriss: acriss,
                        company: rental.provider.company_name,
                        distance: distance,
                        coords: rental.location,
                        address: rental.address,
                        airport: rental.airport ? rental.airport : null,
                        price: car.estimated_total.amount
                      });
                    }
                  });
                }
              });

              document.body.style.cursor = 'default';

              this.setState({cars: cars});

              this.setState({buttons: updatedButtons, pickupSubmitted: false});
            }
          })
        }

        /* If API doesn't respond successfully, reset cursor style and display
        error modal */
        else {
          document.body.style.cursor = 'default';

          this.setState({
            displayModal: true,
            modalMessage: 'Your rental car request could not be processed. ' +
              'Please try again soon.',
            serverStatus: 'fail',
            pickupSubmitted: false
          });
        }
      })
  }

  // Set clicked car rental as selected
  selectCar(carId) {
    let updatedCars = cloneDeep(this.state.cars);

    // Set clicked button as selected and all others as unselected
    updatedCars.map(car => car.id === carId ?
      car.selected = true : car.selected = false);

    return this.setState({cars: updatedCars});
  }

  // Advance to next section when user clicks Advance button
  advanceSection() {
    let updatedButtons = cloneDeep(this.state.buttons);

    // Get index of previous section's page header button
    const selectedIndex = updatedButtons.findIndex(
      button => button.selected === true);

    // Set previous section's page header button as unselected
    updatedButtons[selectedIndex].selected = false;

    // Set next section's page header button as selected and enabled
    updatedButtons[selectedIndex + 1].selected = true;
    updatedButtons[selectedIndex + 1].disabled = false;

    // Get rental cars if user advances to rentals section
    if (selectedIndex === 0) {
      return this.getCars(updatedButtons);
    }

    // Reset cursor style to default
    document.body.style.cursor = 'default';

    return this.setState({buttons: updatedButtons});
  }

  // Post booking to back-end server
  confirmBooking() {
    // Set booking submitted state to true to disable multiple requests
    this.setState({bookingSubmitted: true});

    // Get selected rental car
    const car = this.state.cars.find(car => car.selected === true);

    // Get booking information
    const booking = JSON.stringify({
      car: car.acriss,
      company_address: car.address.line1 + ', ' + car.address.city +
        ', ' + car.address.region,
      company_name: car.company,
      end_date: this.state.endDate.format('MM-DD-YYYY'),
      location: this.state.location.label,
      price: car.price,
      start_date: this.state.startDate.format('MM-DD-YYYY')
    });

    return fetch(process.env.REACT_APP_SERVER_PATH + 'api/vroom/booking', {
      headers: {'Content-Type': 'application/json'},
      method: 'POST',
      body: booking
    })

      /* Reset cursor style and display error modal if server responds with
      error */
      .catch(error => {
        document.body.style.cursor = 'default';

        this.setState({
          displayModal: true,
          modalMessage: 'Your booking could not be confirmed. Please try ' +
            'again soon.',
          serverStatus: 'fail',
          bookingSubmitted: false
        });
      })

      .then(response => {
        /* If server responds successfully, reset cursor style and display
        success modal with booking confirmation code */
        if (response && response.ok) {
          response.text().then(confCode => {
            document.body.style.cursor = 'default';

            this.setState({
              displayModal: true,
              modalMessage: 'Your booking is confirmed! Your confirmation ' +
                'code is ' + confCode + '.',
              serverStatus: 'success',
              bookingSubmitted: true
            });
          });
        }

        /* If server doesn't respond successfully, reset cursor style and
        display error modal */
        else {
          document.body.style.cursor = 'default';

          this.setState({
            displayModal: true,
            modalMessage: 'Your booking could not be confirmed. Please try ' +
              'again soon.',
            serverStatus: 'fail',
            bookingSubmitted: false
          });
        }
      });
  }

  // Hide modal when user closes it
  hideModal() {
    return this.setState({displayModal: false});
  }

  render() {
    // Get selected page header button
    const selectedButton = this.state.buttons.find(
      button => button.selected === true);

    return (
      <div className="container-fluid p-0">

        <Modal
          display={this.state.displayModal}
          message={this.state.modalMessage}
          status={this.state.serverStatus}
          onCloseModal={this.hideModal} />

        <PageHeader
          buttons={this.state.buttons}
          onSelectButton={this.setSelectedButton} />

        <SiteMenu />

        <div className={'row align-items-start justify-content-center ' +
          'content-container'}>

          {selectedButton.name === 'pickup' ? (
            <PickupSelector
              location={this.state.location}
              setLocation={this.setLocation}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              setDates={this.setDates}
              disabled={this.state.pickupSubmitted}
              advanceSection={this.advanceSection}
              />
            ) : selectedButton.name === 'rentals' ? (
              <CarTable
                location={this.state.location}
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                cars={this.state.cars}
                selectCar={this.selectCar}
                advanceSection={this.advanceSection}
                />
            ) : selectedButton.name === 'confirm' ? (
              <BookingConfirm
                location={this.state.location}
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                selectedCar={this.state.cars
                  .find(car => car.selected === true)}
                disabled={this.state.bookingSubmitted}
                confirmBooking={this.confirmBooking}
                />
            ) : (null)
          }

        </div>
      </div>
    );
  }
}

export default App;
