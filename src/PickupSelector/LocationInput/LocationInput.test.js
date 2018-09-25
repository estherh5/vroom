import React from 'react';
import ReactDOM from 'react-dom';
import LocationInput from './LocationInput';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<LocationInput />, div);
  ReactDOM.unmountComponentAtNode(div);
});
