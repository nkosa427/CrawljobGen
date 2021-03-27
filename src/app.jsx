import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Category from './components/category.jsx';

const { ipcRenderer } = require('electron');

class App extends React.Component{
  constructor(props){
    super(props);
    this.categorySelected = this.categorySelected.bind(this);
    this.addNewCategory = this.addNewCategory.bind(this);
    this.linkAdded = this.linkAdded.bind(this);
    this.state = {
      categories: [{
        folderpath: '',
        links: [],
        subcategories: [] 
      }]
    }  
  }

  linkAdded(link, index){
    console.log("link: " + link + " for object " + index);
  }

  addNewCategory(){
    var fp = String(ipcRenderer.sendSync('open-dialog'));
    const inArr = this.state.categories.some( (category) => {
      return category.folderpath === fp
    });

    if (fp != [] && !inArr) {
      this.setState({
        categories: [...this.state.categories, 
        {
          folderpath: fp,
          links: [],
          subcategories: []
        }]
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
        {this.state.categories.map((category, index) => {
          if (category.folderpath != '') {
            return <Category 
              key={category.folderpath}
              index={index}
              path={category.folderpath} 
              passLink={this.linkAdded}
            />
          }
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