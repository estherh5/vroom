import React from 'react';
import ReactDOM from 'react-dom';
import CarRow from './CarRow';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CarRow />, div);
  ReactDOM.unmountComponentAtNode(div);
});
