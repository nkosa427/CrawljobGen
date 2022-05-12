import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Category from './components/category.jsx';
import FolderTree from './components/folderTree.jsx';
import ReverseEntry from './components/reverseEntry.jsx'
import mock from './mock.js';

const { ipcRenderer } = require('electron');

class App extends React.Component{
  constructor(props){
    super(props);
    
    this.handleTopDirChange = this.handleTopDirChange.bind(this);
    this.addNewCategory = this.addNewCategory.bind(this);
    this.linkAdded = this.linkAdded.bind(this);
    this.printFolders = this.printFolders.bind(this);
    this.onSubCategoryAdded = this.onSubCategoryAdded.bind(this);
    this.printState = this.printState.bind(this);
    this.getFolderIndex = this.getFolderIndex.bind(this);
    this.convertSlashes = this.convertSlashes.bind(this);
    this.convertSlashesChecked = this.convertSlashesChecked.bind(this);
    this.trimPath = this.trimPath.bind(this);
    this.printFile = this.printFile.bind(this);
    this.removeLink = this.removeLink.bind(this);
    this.addBasePath = this.addBasePath.bind(this);
    this.removeBasePath = this.removeBasePath.bind(this);
    this.getSubDirs = this.getSubDirs.bind(this);

    this.state = {
      categories: [{
        folderpath: '',
        displayPath: '',
        links: [],
        subcategories: [] 
      }],
      folders: [{
        path: '',
        links: []
      }],
      convertSlashes: true,
      prefix: '',
      numLinks: 0,
      basePath: '',
      topDir: '',
      directories: {
        dir: "",
        path: "",
        links: [],
        children: []
      }
    }  
  }

  componentDidMount() {
    let dir = ipcRenderer.sendSync('getTopDir')
    this.setState({
      topDir: dir.topDir,
      directories: {
        dir: dir,
      }
    })
  }

  printState(){
    // this.printStruct(this.state.categories);
    console.log(this.state);
  }

  handleTopDirChange(event) {
    this.setState({
      topDir: event.target.value
    });
  }

  convertSlashes(){
    let categoryCopy = this.state.categories;

    if (this.state.convertSlashes) {
      categoryCopy.forEach((category, index) => {
        let dir = category.folderpath.replace(/\\/g, "/");
        categoryCopy[index].displayPath = dir;
      });
    } else {
      categoryCopy.forEach((category, index) => {
        let dir = category.folderpath.replace(/\//g, "\\");
        categoryCopy[index].displayPath = dir;
      });
    }

    this.setState({
      categories: categoryCopy
    }, () => this.trimPath(this.state.prefix));
  }

  convertSlashesChecked(){
    this.setState({
      convertSlashes: !this.state.convertSlashes
    }, () => {this.convertSlashes()});
  }

  trimPath(prefix){
    let categoryCopy = this.state.categories;
    categoryCopy.forEach((category, index) => {
      let dir = category.folderpath.replace(prefix, '');
      if (this.state.convertSlashes){
        dir = dir.replace(/\\/g, "/");
      }
      categoryCopy[index].displayPath = dir;
    });
    this.setState({
      categories: categoryCopy,
      prefix: prefix
    });
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
      folders: foldersCopy,
      numLinks: this.state.numLinks + 1
    });
  }

  removeLink(link){
    console.log("Remove " + link);
    let foldersCopy = this.state.folders;
    
    for (let i = 0; i < foldersCopy.length; i++){
      for (let j = 0; j < foldersCopy[i].links.length; j++){
        if (link == foldersCopy[i].links[j]) {
          console.log("Found " + foldersCopy[i].links[j] + " at " + i + "," + j);
          foldersCopy[i].links.splice(j, 1);
          this.setState({numLinks: this.state.numLinks - 1})
        }
      }
    }
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
              displayPath: fp,
              links: [],
              subcategories: []
            }
          ],
          folders: [{
            path: fp,
            links: []
          }]
        }, () => {this.convertSlashes()});
      } else {
        this.setState({
          categories: [
            ...this.state.categories, 
            {
              folderpath: fp,
              displayPath: fp,
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
        }, () => {this.convertSlashes()});
      }
    } else {
      console.log("Invalid folder");
    }
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

  addBasePath(){
    var fp = String(ipcRenderer.sendSync('open-dialog') + "\\");
    if (fp != ["\\"]){
      this.setState({
        basePath: fp,
        prefix: fp
      });
      this.trimPath(fp)
    }
  }

  removeBasePath(){
    this.setState({
      basePath: '',
      prefix: ''
    })
  }

  printFile(){
    ipcRenderer.send('printFile', this.state.folders, this.state.convertSlashes, this.state.prefix);
  }

  getSubDirs(dir) {
    console.log('calling dir', dir)
    var dirs = ipcRenderer.sendSync('getSubDirs', dir)
    console.log('dirs:', dirs)
  }

  render() {
    return(
      <div>
        <div>
          <label>Top level directory: {this.state.topDir}</label>
        </div>

        <h3>Number of links: {this.state.numLinks}</h3>
        <div className='debugButtons'>
          <button onClick={this.printFolders}>Print Folders</button>
          <button onClick={this.printState}>Print State</button>
        </div>
        
        <label>
          Convert Backslash to Forward slash?
          <input 
            type="checkbox" 
            name="convertSlashes" 
            checked={this.state.convertSlashes} 
            onChange={this.convertSlashesChecked}
          />
        </label>

      <div className='debugButtons'>
        <label>Remove from beginning of path: </label>
          <ReverseEntry 
            trimPath={this.trimPath}
            convertSlashes={this.state.convertSlashes}
          />
      </div>

      <div>
        <button onClick={this.addBasePath}>Add base path:</button>
        <label>{this.state.basePath}</label>
        {this.state.basePath != '' && <button onClick={this.removeBasePath}>Remove Base Path</button>}
      </div>
        
        {this.state.categories.map((category, index) => {
          if (category.folderpath != '') {
            return <Category 
              key={category.folderpath}
              index={index}
              path={category.folderpath} 
              displayPath={category.displayPath}
              passLink={this.linkAdded}
              onAddSub={this.onSubCategoryAdded}
              level={0}
              removeLink={this.removeLink}
            />
          }
        })}

        <button onClick={this.addNewCategory}>Add Category</button>
        <button onClick={this.printFile}>Print to File</button>
      
        <FolderTree 
          name = {mock.dir}
          path = {mock.path}
          links = {mock.links}
          children = {mock.children}
          getSubDirs = {this.getSubDirs}

        />
    </div>
   );
  }
}

function render() {
  ReactDOM.render(<App/>, document.getElementById('root'));
}

render();