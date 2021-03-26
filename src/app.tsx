import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FirstC from './components/firstcomp';
import Category from './components/category';

class App extends React.Component <{}> {
  constructor(props: {}){
    super(props);
    this.categorySelected = this.categorySelected.bind(this);
    this.state = {
      categories: []
    }
  }

  categorySelected(fp: string){
    console.log("From categoryselected: " + fp);
  }

  render() {
    return(
      <div>
        <Category onCategorySelected={this.categorySelected}></Category>
      </div>
   );
  }
}

function render() {
  ReactDOM.render(<App/>, document.getElementById('root'));
}

render();