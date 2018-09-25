import React, { Component } from 'react';
import './InfoHeader.css';


// Header that displays rental specifications component
class InfoHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mobile: null
    }

    this.setMobile = this.setMobile.bind(this);
  }

  // Determine screen size when component mounts (for calendar display setting)
  componentDidMount() {
    /* Add resize window event listener to set mobile status when screen size
    changes */
    window.addEventListener('resize', this.setMobile, false);

    return this.setMobile();
  }

  // Set mobile status based on window width
  setMobile() {
    return this.setState({mobile: window.innerWidth <= 568});
  }

  // Remove resize event listener when component unmounts
  componentWillUnmount() {
    return window.removeEventListener('resize', this.setMobile, false);
  }

  render() {
    return (
      <div className="p-4 mt-5 mb-4 mx-4 info-header">

        <span className="mr-3">
          {this.props.location}
        </span>

        {this.state.mobile ? <br /> : '|'}

        <span className={'mr-2' + (this.state.mobile ? '' : ' ml-3')}>
          {this.props.startDate.format('M/D/YYYY')}
        </span>

        <span>to</span>

        <span className="ml-2">
          {this.props.endDate.format('M/D/YYYY')}
        </span>

      </div>
    );
  }
}

export default InfoHeader;
