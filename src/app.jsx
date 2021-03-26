import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Category from './components/category.jsx';

const { ipcRenderer } = require('electron');

class App extends React.Component{
  constructor(props){
    super(props);
    this.categorySelected = this.categorySelected.bind(this);
    this.addNewCategory = this.addNewCategory.bind(this);
    this.state = {
      categories: []
    }  
  }

  callOpenDialog(){
    
  }

  addNewCategory(){
    var fp = String(ipcRenderer.sendSync('open-dialog'));
    if (!this.state.categories.includes(fp) && fp != []) {
      this.setState({
        categories: [...this.state.categories, fp]
      });
    } else {
      console.log("Invalid folder");
    }
    
  }
  
  categorySelected(fp) {
    console.log("Selected: " + fp);
  }

  render() {
    return(
      <div>
        {this.state.categories.map( (category) => {
          return <Category 
            key={category} 
            onCategorySelected={this.onCategorySelected} 
            path={category}/>
        })}
        <button onClick={this.addNewCategory}>Add Category</button>
      </div>
   );
  }
}

function render() {
  ReactDOM.render(<App/>, document.getElementById('root'));
}

render();