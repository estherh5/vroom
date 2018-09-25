import React from 'react';
import ReactDOM from 'react-dom';
import BookingConfirm from './BookingConfirm';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<BookingConfirm />, div);
  ReactDOM.unmountComponentAtNode(div);
});
