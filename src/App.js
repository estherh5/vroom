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

    this.setSelectedButton = this.setSelectedButton.bind(this);
    this.setLocation = this.setLocation.bind(this);
    this.setDates = this.setDates.bind(this);
    this.getCars = this.getCars.bind(this);
    this.setSort = this.setSort.bind(this);
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

  // Get rental cars from RapidAPI API
  getCars(updatedButtons) {
    // Set pickup submitted state to true to disable pickup section inputs
    this.setState({pickupSubmitted: true});

    // Get latitude and longitude of rental pickup location
    const latitude = this.state.location.location.lat;
    const longitude = this.state.location.location.lng;

    // Get pickup and drop-off dates in RapidAPI-required format
    const pickupDate = this.state.startDate.format('YYYY-MM-DD');
    const dropOffDate = this.state.endDate.format('YYYY-MM-DD');
    const pickupTime = '10:00';
    const dropOffTime = '10:00';

    // Set fetch options
    const fetchOptions = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
      }
    };

    return fetch(`https://booking-com15.p.rapidapi.com/api/v1/cars/` +
      `searchCarRentals?pick_up_latitude=${latitude}&pick_up_longitude=${longitude}` +
      `&drop_off_latitude=${latitude}&drop_off_longitude=${longitude}&pick_up_date=` +
      `${pickupDate}&drop_off_date=${dropOffDate}&pick_up_time=${pickupTime}` +
      `&drop_off_time=${dropOffTime}&currency_code=USD`, fetchOptions
    )

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
            if (rentals.data.search_results.length === 0) {
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
              rentals.data.search_results.forEach(rental => {
                if (cars.length < 20) {
                  const group = rental.vehicle_info.group;

                  /* Get difference between searched pickup location and
                  rental car company's longitudes and latitudes */
                  const distance = Math.abs(Number(rental.supplier_info.latitude) -
                    this.state.location.location.lat) +
                    Math.abs(Number(rental.supplier_info.longitude) -
                    this.state.location.location.lng);

                  cars.push({
                    id: rental.vehicle_id,
                    type: rental.vehicle_info.v_name,
                    selected: false,
                    image: rental.vehicle_info.image_url,
                    companyLogo: rental.supplier_info.logo_url,
                    group,
                    company: rental.supplier_info.name,
                    distance,
                    address: rental.route_info.pickup,
                    price: rental.pricing_info.price
                  });
                }
              });

              cars.sort((a, b) => a.price - b.price);

              document.body.style.cursor = 'default';

              this.setState({cars});

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

  setSort(sortOption) {
    let updatedCars = cloneDeep(this.state.cars);

    function cmp(x, y){
      return x > y ? 1 : x < y ? -1 : 0;
    };

    if (sortOption === 'price') {
      updatedCars.sort((a, b) => a.price - b.price);
    }

    else if (sortOption === 'distance') {
      updatedCars.sort((a, b) =>
        cmp(
          [cmp(a.distance, b.distance), cmp(a.price, b.price)],
          [cmp(b.distance, a.distance), cmp(b.price, a.price)]
        )
      );
    }

    else if (sortOption === 'type') {
      updatedCars.sort((a, b) => (a.type > b.type) ? 1 :
        ((b.type > a.type) ? -1 : 0));
    }

    return this.setState({cars: updatedCars});
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
      car: car.type,
      company_address: car.address.address,
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
                setSort={this.setSort}
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
