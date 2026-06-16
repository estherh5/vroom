# Vroom
![Vroom](vroom.png)

[Vroom](https://vroom.crystalprism.io) is a [React](https://reactjs.org/) web app that makes renting a car quick and easy. Vroom displays an interactive portal where you can search for a location and dates/times to pick up and drop off your rental car, then select a rental car from different rental companies, and lastly confirm your booking and see a map of how to get to your intended pick-up location. Vroom uses [React Geosuggest](https://github.com/ubilabs/react-geosuggest) to suggest Google Maps locations as you search for your pick-up and drop-off cities, as well as [react-day-picker](https://daypicker.dev/) to provide a calendar-based date range selector. Rental search uses a provider abstraction: the default `demo` provider returns stable no-key sample inventory, and the optional `booking` provider can call [RapidAPI's Booking.com API](https://rapidapi.com/DataCrawler/api/booking-com15) if that endpoint is available for your account. When you confirm your booking, your information gets sent to a [RESTful API](https://github.com/estherh5/vroom_api) that stores your data in a PostgreSQL database and returns a unique confirmation code for your booking.

The app is built with [Vite](https://vite.dev/) and [TypeScript](https://www.typescriptlang.org/).

## Setup
1. Clone this repository locally or on your server (`git clone https://github.com/estherh5/vroom`).
2. Enter the `vroom` directory, and install the required dependencies by running `npm install`.
3. Request a [Google Maps API key](https://cloud.google.com/maps-platform/#get-started). A RapidAPI key is only needed if you switch the rental provider to `booking`.
4. Set the following environment variables in the `.env` file:
    * `VITE_GOOGLE_KEY` for the Google Maps API key you generated in step 3
    * `VITE_SERVER_PATH` for the URL of the back-end server that stores booking information (see the [Vroom API](https://github.com/estherh5/vroom_api) repository for setup instructions)
    * `VITE_RENTAL_API_PROVIDER` to choose the rental search provider. Leave unset or set to `demo` for no-key sample inventory. Set to `booking` to use RapidAPI.
    * `VITE_RAPIDAPI_KEY` for the RapidAPI key, required only when `VITE_RENTAL_API_PROVIDER=booking`
5. Start a development server with hot reloading by running `npm run dev`. To create an optimized production build, run `npm run build`; the compiled files will be located in the `dist` directory (preview it with `npm run preview`).

## Rental search providers
Free public APIs for real-time rental car availability are not consistently available. Most production-grade rental inventory APIs require a partner agreement, paid subscription, or private approval. To keep the portfolio app functional without a fragile dependency, Vroom defaults to generated demo inventory that is deterministic for the selected location and date range.

Provider options:
* `demo` — default, no rental API key required, returns stable sample cars for any searched location.
* `booking` — uses RapidAPI's Booking.com car rental endpoint. This path is kept for compatibility, but the upstream endpoint may return logical failures even when the HTTP response is `200 OK`.

## Scripts
* `npm run dev` — start the Vite development server
* `npm run build` — type-check and build for production
* `npm run preview` — preview the production build locally
* `npm run lint` — run ESLint
* `npm test` — run the Vitest test suite
