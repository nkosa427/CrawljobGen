import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Category from './components/category.jsx';
import ReverseEntry from './components/reverseEntry.jsx'

const { ipcRenderer } = require('electron');

class App extends React.Component{
  constructor(props){
    super(props);
    
    this.addNewCategory = this.addNewCategory.bind(this);
    this.linkAdded = this.linkAdded.bind(this);
    this.printFolders = this.printFolders.bind(this);
    this.onSubCategoryAdded = this.onSubCategoryAdded.bind(this);
    this.printState = this.printState.bind(this);
    this.getFolderIndex = this.getFolderIndex.bind(this);
    this.convertSlashes = this.convertSlashes.bind(this);
    this.trimPath = this.trimPath.bind(this);

    this.state = {
      categories: [{
        folderpath: '',
        links: [],
        subcategories: [] 
      }],
      folders: [{
        path: '',
        links: []
      }],
      convertSlashes: true
    }  
  }

  printState(){
    // this.printStruct(this.state.categories);
    console.log(this.state);
  }

  convertSlashes(){
    this.setState({
      convertSlashes: !this.state.convertSlashes
    });
  }

  trimPath(prefix){
    console.log("trim " + prefix)
  }

  getFolderIndex(fp){
    for (let i = 0; i < this.state.folders.length; i++) {
      if (this.state.folders[i].path == fp){
        return i;
      }
    }
    return -1;
  }

  linkAdded(link, fp){
    console.log("Adding " + link + " to " + fp + " at index " + this.getFolderIndex(fp));
    let index = this.getFolderIndex(fp);
    let foldersCopy = this.state.folders;
    foldersCopy[index].links.push(link);
    this.setState({
      folders: foldersCopy
    });
  }

  addNewCategory(){
    var fp = String(ipcRenderer.sendSync('open-dialog'));
    //Checks if the selected folder is already part of another category
    const inArr = this.state.categories.some( (category) => {
      return category.folderpath === fp
    });

    if (fp != [] && !inArr) {
      //For the initial category since filepath was initialized in constructor as ''
      if (this.state.categories.length == 1 && this.state.categories[0].folderpath == ''){
        this.setState({
          categories: [
            {
              folderpath: fp,
              links: [],
              subcategories: []
            }
          ],
          folders: [{
            path: fp,
            links: []
          }]
        });
      } else {
        this.setState({
          categories: [
            ...this.state.categories, 
            {
              folderpath: fp,
              links: [],
              subcategories: []
            }
          ],
          folders: [
          ...this.state.folders,
            {
              path: fp,
              links: []
            }
          ]
        });
      }
    } else {
      console.log("Invalid folder");
    }
  }

  printFolders(){
    this.state.folders.forEach(folder => {
      console.log("Folder: " + folder.path);
      if (folder.links && folder.links.length > 0){
        folder.links.forEach(link => {
          console.log("\t" + link);
        });
      }
      
    })
  }

  onSubCategoryAdded(fp){
    console.log("onSubCategoryAdded for " + fp);
    if (this.state.folders.length == 1 && this.state.folders[0] == ''){
      this.setState({
        folders: [{
          path: fp,
          links: []
        }]
      });
    } else {
      this.setState({
        folders: [...this.state.folders, {
          path: fp,
          links: []
        }]
      });
    }
  }

  render() {
    return(
      <div>
        <button onClick={this.printFolders}>Print Folders</button>
        <button onClick={this.printState}>Print State</button>
        
        <label>
          Convert Forward to Backslash?
          <input 
            type="checkbox" 
            name="convertSlashes" 
            checked={this.state.convertSlashes} 
            onChange={this.convertSlashes}
          />
        </label>

        <label>Remove from beginning of path: </label>
        <ReverseEntry 
          trimPath={this.trimPath}
        />
        
        {this.state.categories.map((category, index) => {
          if (category.folderpath != '') {
            return <Category 
              key={category.folderpath}
              index={index}
              path={category.folderpath} 
              passLink={this.linkAdded}
              onAddSub={this.onSubCategoryAdded}
              level={0}
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