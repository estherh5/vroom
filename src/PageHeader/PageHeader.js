import React, { Component } from 'react';
import './PageHeader.css';

import SectionButton from './SectionButton/SectionButton.js';


// Page header with buttons representing each section of the app
class PageHeader extends Component {
  render() {
    // Get selected button
    const selectedButton = this.props.buttons
      .find(button => button.selected === true);

    // Set background color of selected button based on section
    const style = {
      backgroundColor: selectedButton.name === 'pickup' ? '#ffe4e4' :
        selectedButton.name === 'rentals' ? '#fffde0' :
        selectedButton.name === 'confirm' ? '#e9f7ea' :
        null
    }

    return (
      <div
        className="row align-items-center w-100 fixed-top no-gutters header"
        style={style}>

          <ul className="nav w-100">

            <div className="liner"></div>

            {this.props.buttons.map(button =>
              <SectionButton
                key={button.name}
                name={button.name}
                selected={button.selected}
                disabled={button.disabled}
                icon={button.icon}
                bgColor={button.bgColor}
                color={button.color}
                onSelectButton={this.props.onSelectButton} />
            )}

          </ul>

      </div>
    );
  }
}

export default PageHeader;
