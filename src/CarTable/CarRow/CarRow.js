import React, { Component } from 'react';
import './CarRow.css';

import logo from '../../logo.png';


// Row that displays rental car information component
class CarRow extends Component {
  constructor(props) {
    super(props);

    // Backup car images in case car image is not found
    this.carImages = {
      M: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/ECAR.png',
      N: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/ECAR.png',
      E: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/ECAR.png',
      H: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/ECAR.png',
      C: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/CCAR.png',
      D: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/CCAR.png',
      I: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/ICAR.png',
      J: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/ICAR.png',
      S: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/SCAR.png',
      R: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/SCAR.png',
      F: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/FCAR.png',
      G: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/FCAR.png',
      P: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/PCAR.png',
      U: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/PCAR.png',
      L: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/LCAR.png',
      W: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/LCAR.png',
      O: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/MVAR.png',
      X: 'https://www.priceline.com/rc-static/vehicles/domestic_196x116' +
        '/MVAR.png'
    }

    this.selectCar = this.selectCar.bind(this);
    this.updateCarImage = this.updateCarImage.bind(this);
    this.updateLogoImage = this.updateLogoImage.bind(this);
  }

  // Set car as selected when user clicks on it
  selectCar() {
    return this.props.selectCar(this.props.id);
  }

  // Add backup image based on ACRISS code if car image is not found
  updateCarImage(e) {
    return e.target.src = this.carImages[this.props.acriss.charAt(0)];
  }

  // Add backup logo if company logo is not found
  updateLogoImage(e) {
    return e.target.src = logo;
  }

  render() {
    // Set company logo image source based on company name
    const logoSrc = 'https://logo.clearbit.com/' +
      (['payless', 'national'].includes(this.props.company) ?
      this.props.company + 'car.com' :
      this.props.company === 'thrifty' ? this.props.company + '.com.au' :
      this.props.company === 'firefly' ? this.props.company + 'carrental.com' :
      this.props.company.replace(/\s/g, '') + '.com');

    return (
      <tr
        className={'row car-row m-5 justify-content-center ' +
          'justify-content-md-between' +
          (this.props.selected ? ' selected' : '')}
          onClick={this.selectCar}>

          <td className={'d-flex flex-column justify-content-between ' +
            'align-items-center align-items-md-start mt-3 mx-3 m-sm-3 ' +
            'info-cell'}>

              <div className="car-name">
                {this.props.category + ' ' + this.props.type ===
                  'Special Special' ? 'Special' :
                  this.props.category + ' ' + this.props.type}
              </div>

              <div className={'price-total-row ' +
                (this.props.days > 0 ? 'mt-4' : '')}>
                  {'$' + this.props.price}
              </div>

              {this.props.days > 0 ? (
                <div className="price-day-row mb-4">
                  {'$' + (this.props.price/this.props.days).toFixed(2) +
                    '/day'}
                </div>
              ) : null}

              <div className="address-row d-flex align-items-center">

                {this.props.airport ? (
                  <i
                    className="fas fa-plane-departure mr-3 location-icon"
                    title={this.props.airport + ' Airport'}>
                  </i>
                ) :
                  <i className="fas fa-location-arrow mr-3 location-icon"></i>
                }

                <div className="address">
                  {this.props.address.line1}

                  <br />

                  {this.props.address.city + ', ' +
                    (this.props.address.region ? this.props.address.region :
                    this.props.state)}
                </div>

              </div>

          </td>

          <td className={'d-flex flex-column align-items-center ' +
            'justify-content-center m-3 m-lg-2 image-cell'}>

              <img
                className="mb-3 car-image"
                onError={this.updateCarImage}
                src={'https://www.priceline.com/rc-static/vehicles/' +
                  'domestic_196x116/' + this.props.acriss + '.png'}
                alt={this.props.category + ' ' + this.props.type} />

              <img
                className="company-logo"
                onError={this.updateLogoImage}
                src={logoSrc}
                alt={this.props.company.charAt(0) +
                  this.props.company.slice(1).toLowerCase()} />

          </td>

      </tr>
    );
  }
}

export default CarRow;
