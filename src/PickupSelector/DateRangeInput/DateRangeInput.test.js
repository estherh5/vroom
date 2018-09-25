import React from 'react';
import ReactDOM from 'react-dom';
import DateRangeInput from './DateRangeInput';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DateRangeInput />, div);
  ReactDOM.unmountComponentAtNode(div);
});
