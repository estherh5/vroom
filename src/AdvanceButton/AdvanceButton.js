import React, { Component } from 'react';
import './AdvanceButton.css';


// Button that allows user to advance to next section of app component
class AdvanceButton extends Component {
  constructor(props) {
    super(props);

    this.advanceSection = this.advanceSection.bind(this);
  }

  // Advance to next section of app when user clicks Advance button
  advanceSection() {
    // Set cursor style to loading
    document.body.style.cursor = 'wait';

    return this.props.advanceSection();
  }

  render() {
    return (
      <div className={'d-flex align-items-center justify-content-center ' +
        'button-container'}>

          <button
            className="d-flex advance"
            disabled={this.props.disabled}
            onClick={this.advanceSection}>

              <i className="fas fa-arrow-right"></i>

          </button>

      </div>
    );
  }
}

export default AdvanceButton;
