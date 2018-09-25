import React, { Component } from 'react';
import './ConfirmButton.css';


// Confirm booking button component
class ConfirmButton extends Component {
  constructor(props) {
    super(props);

    this.confirmBooking = this.confirmBooking.bind(this);
  }

  /* Send request to back-end server to post booking when user clicks Confirm
  button */
  confirmBooking() {
    // Set cursor style to loading
    document.body.style.cursor = 'wait';

    return this.props.confirmBooking();
  }

  render() {
    return (
      <div className={'button-container my-5 d-flex align-items-center ' +
        'justify-content-center'}>

          <button
            className="d-flex confirm"
            disabled={this.props.disabled}
            onClick={this.confirmBooking}>
              Confirm
          </button>

      </div>
    );
  }
}

export default ConfirmButton;
