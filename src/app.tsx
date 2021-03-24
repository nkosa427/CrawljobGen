import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FirstC from './firstcomp';

function render() {
  ReactDOM.render(
  <div>
    <h2>Hello from React!</h2>
    <FirstC></FirstC>
  </div>
  , document.getElementById('root'));
}

render();