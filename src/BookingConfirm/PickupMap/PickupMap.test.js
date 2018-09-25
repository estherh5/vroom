import React from 'react';
import ReactDOM from 'react-dom';
import PickupMap from './PickupMap';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<PickupMap />, div);
  ReactDOM.unmountComponentAtNode(div);
});
