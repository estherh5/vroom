import React from 'react';
import ReactDOM from 'react-dom';
import CarTable from './CarTable';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CarTable />, div);
  ReactDOM.unmountComponentAtNode(div);
});
