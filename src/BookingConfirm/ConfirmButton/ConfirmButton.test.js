import React from 'react';
import ReactDOM from 'react-dom';
import ConfirmButton from './ConfirmButton';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ConfirmButton />, div);
  ReactDOM.unmountComponentAtNode(div);
});
