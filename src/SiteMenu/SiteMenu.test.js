import React from 'react';
import ReactDOM from 'react-dom';
import PageMenu from './PageMenu';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<PageMenu />, div);
  ReactDOM.unmountComponentAtNode(div);
});
