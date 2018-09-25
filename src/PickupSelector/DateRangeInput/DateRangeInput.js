import React, { Component } from 'react';
import './DateRangeInput.css';

import 'react-dates/lib/css/_datepicker.css';  // React Dates CSS file

import { DateRangePicker } from 'react-dates';


// Rental pickup date range input component
class DateRangeInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focusedInput: null,  // Whether or not user is focused on input fields
      mobile: null
    }

    this.setMobile = this.setMobile.bind(this);
  }

  // Determine screen size when component mounts (for calendar display setting)
  componentDidMount() {
    /* Add resize window event listener to set mobile status when screen size
    changes */
    window.addEventListener('resize', this.setMobile);

    return this.setMobile();
  }

  // Set mobile status based on window width
  setMobile() {
    return this.setState({mobile: window.innerWidth <= 620});
  }

  // Remove resize event listener when component unmounts
  componentWillUnmount() {
    return window.removeEventListener('resize', this.setMobile, false);
  }

  render() {
    return (
      <div className={'d-flex align-items-center justify-content-center ' +
        'input-container'}>

          <i className="far fa-calendar-minus p-2"></i>

          <DateRangePicker
            startDate={this.props.startDate}
            startDateId="startDate"
            endDate={this.props.endDate}
            endDateId="endDate"
            onDatesChange={({ startDate, endDate }) =>
              this.props.setDates(startDate, endDate)}
            focusedInput={this.state.focusedInput}
            onFocusChange={focusedInput => this.setState({ focusedInput })}
            numberOfMonths={this.state.mobile ? 1 : 2}
            withPortal={this.state.mobile}  // Pop-out calendar setting
            displayFormat="M/D/YYYY"
            disabled={this.props.disabled}
            />

      </div>
    );
  }
}

export default DateRangeInput;
