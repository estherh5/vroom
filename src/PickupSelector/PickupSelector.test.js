import React from 'react';
import ReactDOM from 'react-dom';
import PickupSelector from './PickupSelector';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<PickupSelector />, div);
  ReactDOM.unmountComponentAtNode(div);
});
