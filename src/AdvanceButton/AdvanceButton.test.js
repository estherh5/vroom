import React from 'react';
import ReactDOM from 'react-dom';
import AdvanceButton from './AdvanceButton';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AdvanceButton />, div);
  ReactDOM.unmountComponentAtNode(div);
});
