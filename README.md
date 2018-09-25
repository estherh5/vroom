# Vroom
![Vroom](vroom.png)

[Vroom](https://vroom.crystalprism.io) is a [React](https://reactjs.org/) web app that makes renting a car quick and easy. Vroom displays an interactive portal where you can search for a location and dates/times to pick up and drop off your rental car, then select a rental car from different rental companies, and lastly confirm your booking and see a map of how to get to your intended pick-up location. Vroom uses [React Geosuggest](https://github.com/ubilabs/react-geosuggest) to suggest Google Maps locations as you search for your pick-up and drop-off cities, as well as [Airbnb's react-dates](https://github.com/airbnb/react-dates) to provide a calendar-based date range selector. Car rental data is acquired via [Amadeus' Car Rental Geosearch API](https://sandbox.amadeus.com/travel-innovation-sandbox/apis/get/cars/search-circle). When you confirm your booking, your information gets sent to a [RESTful API](https://github.com/estherh5/vroom_api) that stores your data in a PostgreSQL database and returns a unique confirmation code for your booking.

## Setup
1. Clone this repository locally or on your server (`git clone https://github.com/estherh5/vroom`).
2. Enter the `vroom` directory, and install the required dependencies by running `npm install`.
3. Request API keys from [Amadeus](https://sandbox.amadeus.com/getting-started) and [Google Maps](https://cloud.google.com/maps-platform/#get-started).
4. Set the following environment variables in the `.env` file:
    * `REACT_APP_GOOGLE_KEY` for the Google Maps API key you generated in step 3
    * `REACT_APP_AMADEUS_KEY` for the Amadeus API key you generated in step 3
    * `REACT_APP_SERVER_PATH` for the URL of the back-end server that stores booking information (see the [Vroom API](https://github.com/estherh5/vroom_api) repository for setup instructions)
5. Compile the required stylesheets and scripts by running `npm run build`. The compiled files will be located in the `build` directory.
