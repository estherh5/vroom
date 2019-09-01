import 'react-dates/initialize';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(
    <span>
      © Copyright 2017-{new Date().getFullYear()} <a
        href="https://crystalprism.io" title="Crystal Prism">Crystal Prism</a>
    </span>,
    document.getElementById('footer'));

registerServiceWorker();
