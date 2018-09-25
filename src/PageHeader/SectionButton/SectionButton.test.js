import React from 'react';
import ReactDOM from 'react-dom';
import SectionButton from './SectionButton';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<SectionButton />, div);
  ReactDOM.unmountComponentAtNode(div);
});
