import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FirstC from './components/firstcomp';
import Category from './components/category';

interface States{
  categories: Array<string>
}

class App extends React.Component <{}, States> {
  constructor(props: {}){
    super(props);
    this.categorySelected = this.categorySelected.bind(this);
    this.state = {
      categories: []
    }
  }

  categorySelected(fp: string){
    console.log("From categoryselected: " + fp);
    var tmpCategories = this.state.categories;
    tmpCategories.push(fp);
    this.setState({
      categories: tmpCategories
    })
  }

  render() {
    return(
      <div>
        <Category 
          onCategorySelected={this.categorySelected}
          path='No Path Selected'
        />
      </div>
   );
  }
}

function render() {
  ReactDOM.render(<App/>, document.getElementById('root'));
}

render();