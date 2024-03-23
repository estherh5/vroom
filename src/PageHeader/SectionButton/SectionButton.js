import React, { Component } from 'react';
import './SectionButton.css';


// Button representing section of app
class SectionButton extends Component {
  constructor(props) {
    super(props);

    this.selectButton = this.selectButton.bind(this);
  }

  // Set selected button when user clicks on it or the icon within it
  selectButton(e) {
    // Do nothing if button is disabled
    if (e.target.disabled || e.target.parentNode.disabled) {
      return;
    }

    const buttonName = e.target.dataset.name;

    return this.props.onSelectButton(buttonName);
  }

  render() {
    // Set disabled button style
    const disabledStyle = {
      color: '#cacaca',
      border: '5px solid #cacaca',
      backgroundColor: '#efefef',
      cursor: 'default'
    };

    // Set enabled button style
    const enabledStyle = {
      color: this.props.color,
      border: '5px solid ' + this.props.color,
      backgroundColor: this.props.selected ? this.props.bgColor : '#ffffff',
      cursor: 'pointer'
    };

    return (
      <li className={'col d-flex justify-content-center align-items-center ' +
        'section-button' + (this.props.selected ? ' active' : '')}>

        <button
          className="d-flex justify-content-center align-items-center round"
          style={this.props.disabled ? disabledStyle : enabledStyle}
          data-name={this.props.name}
          disabled={this.props.disabled}
          onClick={this.selectButton}>

            <i
              className={this.props.icon}
              data-name={this.props.name}
              onClick={this.selectButton}>
            </i>

        </button>

      </li>
    );
  }
}

export default SectionButton;
