import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Category from './components/category.jsx';

const { ipcRenderer } = require('electron');

class App extends React.Component{
  constructor(props){
    super(props);
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
    let copyCategories = this.state.categories;
    let categoryToChange = copyCategories[index];
    categoryToChange.links.push(link);
    copyCategories[index] = categoryToChange;
    this.setState({
      categories: copyCategories
    });
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
          }
        ]
      });
    } else {
      console.log("Invalid folder");
    }
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