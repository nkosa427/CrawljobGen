import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FirstC from './components/firstcomp';
import Category from './components/category';

function render() {
  ReactDOM.render(
  <div>
    <Category></Category>
  </div>
  , document.getElementById('root'));
}

render();