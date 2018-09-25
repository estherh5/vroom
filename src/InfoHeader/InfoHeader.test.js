import React from 'react';
import ReactDOM from 'react-dom';
import InfoHeader from './InfoHeader';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<InfoHeader />, div);
  ReactDOM.unmountComponentAtNode(div);
});
