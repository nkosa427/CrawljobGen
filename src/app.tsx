import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FirstC from './components/firstcomp';
import Category from './components/category';

class App extends React.Component <{}> {
  constructor(props: {}){
    super(props);
    this.state = {
      categories: []
    }
  }

  render() {
    return(
      <div>
        <Category></Category>
      </div>
   );
  }
}

function render() {
  ReactDOM.render(<App/>, document.getElementById('root'));
}

render();