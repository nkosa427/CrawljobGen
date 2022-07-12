import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Category from './components/category.jsx';
import FolderTree from './components/folderTree.jsx';
import ReverseEntry from './components/reverseEntry.jsx'


const { ipcRenderer } = require('electron');
class App extends React.Component{
  constructor(props){
    super(props);
    this.child = React.createRef();
    
    // this.handleTopDirChange = this.handleTopDirChange.bind(this);
    // this.addNewCategory = this.addNewCategory.bind(this);
    // this.linkAdded = this.linkAdded.bind(this);
    // this.printFolders = this.printFolders.bind(this);
    // this.onSubCategoryAdded = this.onSubCategoryAdded.bind(this);
    this.printState = this.printState.bind(this);
    // this.getFolderIndex = this.getFolderIndex.bind(this);
    // this.convertSlashes = this.convertSlashes.bind(this);
    // this.convertSlashesChecked = this.convertSlashesChecked.bind(this);
    // this.trimPath = this.trimPath.bind(this);
    this.searchLinks = this.searchLinks.bind(this);
    this.printFile = this.printFile.bind(this);
    // this.removeLink = this.removeLink.bind(this);
    // this.addBasePath = this.addBasePath.bind(this);
    // this.removeBasePath = this.removeBasePath.bind(this);
    this.getSubDirs = this.getSubDirs.bind(this);
    this.sortDirectories = this.sortDirectories(this);
    this.setCollapsed = this.setCollapsed.bind(this);
    this.addLink = this.addLink.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.clearLinks = this.clearLinks.bind(this);
    this.handleAddDirectory =this.handleAddDirectory.bind(this);

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
      useBackslash: false,
      prefix: '',
      numLinks: 0,
      basePath: '',
      topDir: '',
      cjPath: '',
      directories: {
        name: "",
        path: "",
        expanded: false,
        links: [],
        children: []
      }
    }  
  }

  componentDidMount() {
    let dir = ipcRenderer.sendSync('getTopDir')
    let slashType = (ipcRenderer.sendSync('getPlatform') == 'win32' ? "\\" : "/")
    console.log(slashType, dir)
    if (dir !== null) {
      this.setState({
        topDir: dir.topDir,
        cjPath: dir.cjPath,
        slashType: slashType,
        directories: {
          name: dir.topDir,
          path: dir.topDir,
          expanded: false,
          links: [],
          children: []
        }
      })
    }

  }

  printState(){
    // this.printStruct(this.state.categories);
    console.log(this.state);
  }

  // handleTopDirChange(event) {
  //   this.setState({
  //     topDir: event.target.value
  //   });
  // }

  // convertSlashes(){
  //   let categoryCopy = this.state.categories;

  //   if (this.state.convertSlashes) {
  //     categoryCopy.forEach((category, index) => {
  //       let dir = category.folderpath.replace(/\\/g, "/");
  //       categoryCopy[index].displayPath = dir;
  //     });
  //   } else {
  //     categoryCopy.forEach((category, index) => {
  //       let dir = category.folderpath.replace(/\//g, "\\");
  //       categoryCopy[index].displayPath = dir;
  //     });
  //   }

  //   this.setState({
  //     categories: categoryCopy
  //   }, () => this.trimPath(this.state.prefix));
  // }

  // convertSlashesChecked(){
  //   this.setState({
  //     convertSlashes: !this.state.convertSlashes
  //   }, () => {this.convertSlashes()});
  // }

  // trimPath(prefix){
  //   let categoryCopy = this.state.categories;
  //   categoryCopy.forEach((category, index) => {
  //     let dir = category.folderpath.replace(prefix, '');
  //     if (this.state.convertSlashes){
  //       dir = dir.replace(/\\/g, "/");
  //     }
  //     categoryCopy[index].displayPath = dir;
  //   });
  //   this.setState({
  //     categories: categoryCopy,
  //     prefix: prefix
  //   });
  // }

  // getFolderIndex(fp){
  //   for (let i = 0; i < this.state.folders.length; i++) {
  //     if (this.state.folders[i].path == fp){
  //       return i;
  //     }
  //   }
  //   return -1;
  // }

  // linkAdded(link, fp){
  //   console.log("Adding " + link + " to " + fp + " at index " + this.getFolderIndex(fp));
  //   let index = this.getFolderIndex(fp);
  //   let foldersCopy = this.state.folders;
  //   foldersCopy[index].links.push(link);
  //   this.setState({
  //     folders: foldersCopy,
  //     numLinks: this.state.numLinks + 1
  //   });
  // }

  // removeLink(link){
  //   console.log("Remove " + link);
  //   let foldersCopy = this.state.folders;
    
  //   for (let i = 0; i < foldersCopy.length; i++){
  //     for (let j = 0; j < foldersCopy[i].links.length; j++){
  //       if (link == foldersCopy[i].links[j]) {
  //         console.log("Found " + foldersCopy[i].links[j] + " at " + i + "," + j);
  //         foldersCopy[i].links.splice(j, 1);
  //         this.setState({numLinks: this.state.numLinks - 1})
  //       }
  //     }
  //   }
  // }

  // addNewCategory(){
  //   var fp = String(ipcRenderer.sendSync('open-dialog'));
  //   //Checks if the selected folder is already part of another category
  //   const inArr = this.state.categories.some( (category) => {
  //     return category.folderpath === fp
  //   });

  //   if (fp != [] && !inArr) {
  //     //For the initial category since filepath was initialized in constructor as ''
  //     if (this.state.categories.length == 1 && this.state.categories[0].folderpath == ''){
  //       this.setState({
  //         categories: [
  //           {
  //             folderpath: fp,
  //             displayPath: fp,
  //             links: [],
  //             subcategories: []
  //           }
  //         ],
  //         folders: [{
  //           path: fp,
  //           links: []
  //         }]
  //       }, () => {this.convertSlashes()});
  //     } else {
  //       this.setState({
  //         categories: [
  //           ...this.state.categories, 
  //           {
  //             folderpath: fp,
  //             displayPath: fp,
  //             links: [],
  //             subcategories: []
  //           }
  //         ],
  //         folders: [
  //         ...this.state.folders,
  //           {
  //             path: fp,
  //             links: []
  //           }
  //         ]
  //       }, () => {this.convertSlashes()});
  //     }
  //   } else {
  //     console.log("Invalid folder");
  //   }
  // }

  // onSubCategoryAdded(fp){
  //   console.log("onSubCategoryAdded for " + fp);
  //   if (this.state.folders.length == 1 && this.state.folders[0] == ''){
  //     this.setState({
  //       folders: [{
  //         path: fp,
  //         links: []
  //       }]
  //     });
  //   } else {
  //     this.setState({
  //       folders: [...this.state.folders, {
  //         path: fp,
  //         links: []
  //       }]
  //     });
  //   }
  // }

  // printFolders(){
  //   this.state.folders.forEach(folder => {
  //     console.log("Folder: " + folder.path);
  //     if (folder.links && folder.links.length > 0){
  //       folder.links.forEach(link => {
  //         console.log("\t" + link);
  //       });
  //     }
      
  //   })
  // }

  // addBasePath(){
  //   var fp = String(ipcRenderer.sendSync('open-dialog') + "\\");
  //   if (fp != ["\\"]){
  //     this.setState({
  //       basePath: fp,
  //       prefix: fp
  //     });
  //     this.trimPath(fp)
  //   }
  // }

  // removeBasePath(){
  //   this.setState({
  //     basePath: '',
  //     prefix: ''
  //   })
  // }

  searchLinks(dirs, allLinks) {
    if (dirs.links.length > 0) {
      allLinks.push({
        path: dirs.path,
        links: dirs.links
      })
    }

    dirs.children.forEach((child) => {
      allLinks = this.searchLinks(child, allLinks)
    })

    return allLinks
  }

  printFile(){
    let allLinks = []
    let stateCpy = this.state.directories
    allLinks = this.searchLinks(stateCpy, allLinks)

    console.log("links:", allLinks)

    ipcRenderer.send('generateCrawljob', allLinks, this.state.cjPath, this.state.slashType)
    // ipcRenderer.send('printFile', this.state.folders, this.state.convertSlashes, this.state.prefix);
  }

  sortDirectories(a, b) {
    // Use toUpperCase() to ignore character casing
    // const nameA = a.name.toLowerCase();
    // const nameB = b.name.toLowerCase();

    // let comparison = 0;
    // if (nameA > nameB) {
    //   comparison = 1;
    // } else if (nameA < nameB) {
    //   comparison = -1;
    // }
    // return comparison;
    console.log("A:", a, "B:", b)
    return 1
  }

  getSubDirs(path) {
    let dirSearch = (obj) => {
      console.log("searching for dirs in", obj.path)
      var dirs = ipcRenderer.sendSync('getSubDirs', obj.path)
      var newDirs = []
      
      if (dirs !== null) {
        dirs.forEach((dir) => {
          let check = obj.children.some((child) => {
            return child.name == dir //If directory has been previously loaded
          })

          if (!check) {
            newDirs.push({
              name: dir,
              path: obj.path + this.state.slashType + dir,
              links: [],
              children: []
            })
          }
        })
      }
      newDirs.sort((a, b) => {
        let nameA = a.name.toLowerCase();
        let nameB = b.name.toLowerCase();

        let comparison = 0;
        if (nameA > nameB) {
          comparison = 1;
        } else if (nameA < nameB) {
          comparison = -1;
        }
        return comparison;
      })
      
      console.log("newDirs:", newDirs)
      newDirs.forEach((newDir) => {
        obj.children.push({
          name: newDir.name,
          path: obj.path + this.state.slashType + newDir.name,
          links: [],
          children: []
        })
      })

      obj.expanded = true
      // console.log("obj:", obj)
    }

    let update = (path) => obj => {
      if (obj.path === path) {
        dirSearch(obj)
      } else if (obj.children) {
        return obj.children.some(update(path))
      }
    }

    let stateCpy = this.state.directories
    stateCpy.children.forEach(update(path))

    if (stateCpy.children.length == 0 || stateCpy.path === path) {  // For first folders requested
      dirSearch(stateCpy)
      this.setState({
        directories: stateCpy
      })
    }

    console.log("new state:", stateCpy)

    this.setState({
      directories: stateCpy
    })
  }

  setCollapsed(path) {
    let update = (path) => obj => {
      if (obj.path === path) {
        obj.expanded = false
      } else if (obj.children) {
        return obj.children.some(update(path))
      }
    }

    let stateCpy = this.state.directories
    
    if (path == this.state.directories.path) {
      stateCpy.expanded = false
    } else {
      stateCpy.children.forEach(update(path))
    }

    this.setState({
      directories: stateCpy
    })
    // console.log("collapsed state:", this.state.directories)
  }

  addLink(link, path) {
    console.log("Add", link, "to", path)

    let pushLink = (link, obj) => {
      let check = obj.links.some((ln) => {
        return link === ln
      })

      if (!check) {
        obj.links.push(link)
        this.setState({
          numLinks: this.state.numLinks + 1
        })
      } else {
        console.log("Duplicate link")
      }
    }

    let update = (link, path) => obj => {
      if (obj.path === path) {
        pushLink(link, obj)
      } else if (obj.children) {
        return obj.children.some(update(link, path))
      }
    }

    let stateCpy = this.state.directories
    
    if (stateCpy.path === path) {
      pushLink(link, stateCpy)
    } else {
      stateCpy.children.forEach(update(link, path))
    }

    this.setState({
      directories: stateCpy
    })
  }

  handleDelete(link, path) {
    console.log("Delete", link, "from", path)

    let decrement = () => {
      this.setState({
        numLinks: this.state.numLinks - 1
      })
    }

    let delLink = (obj, link) => {
      let idx = obj.links.indexOf(link)
      if (idx !== -1) {
        obj.links.splice(idx, 1)
        decrement()
      }
    }

    let update = (link, path) => obj => {
      if (obj.path === path) {
       delLink(obj, link)
      } else if (obj.children) {
        return obj.children.some(update(link, path))
      }
    }

    let stateCpy = this.state.directories
    
    if (stateCpy.path === path) {
      delLink(stateCpy, link)
    } else {
      stateCpy.children.forEach(update(link, path))
    }

    this.setState({
      directories: stateCpy
    })
  }

  clearLinks() {
    let choice = ipcRenderer.sendSync('clearLinks')
    console.log("choice:", choice ? 'dont' : 'clear')

    let delLinks = (obj) => {
      obj.links = []
    }

    let update = (path) => obj => {
      if (obj.links.length > 0) {
        delLinks(obj)
      } 
      
      if (obj.children) {
        return obj.children.some(update())
      }
    }

    if (!choice) {
      console.log("Clearing links")
      let stateCpy = this.state.directories
      delLinks(stateCpy)
      stateCpy.children.forEach(update(stateCpy.path))
      this.setState({
        directories: stateCpy,
        numLinks: 0
      })
      this.child.current.hideLinkEntries()
    }
  }

  handleAddDirectory(dir, path) {
    let addDir = (obj, details) => {
      obj.children.push({
        name: details.dir,
        path: obj.path + this.state.slashType + details.dir,
        expanded: false,
        links: [],
        children: []
      })
    }

    let update = (details) => obj => {
      if (obj.path === details.path) {
        addDir(obj, details)
      } else if (obj.children) {
        return obj.children.some(update(details))
      }
    }

    let stateCpy = this.state.directories
    
    if (stateCpy.path === path) {
      addDir(stateCpy, {path: path, dir: dir})
    } else {
      stateCpy.children.forEach(update({path: path, dir: dir}))
    }

    this.setState({
      directories: stateCpy
    })

  }

  render() {
    return(
      <div>
        <div>
          <label>Top level directory: {this.state.topDir}</label>
          <br />
          <label>Crawljob default path: {this.state.cjPath}</label>
        </div>

        <button onClick={this.clearLinks}>Clear links</button>
        <h3>Number of links: {this.state.numLinks}</h3>
        <div className='debugButtons'>
          {/* <button onClick={this.printFolders}>Print Folders</button> */}
          <button onClick={this.printState}>Print State</button>
        </div>
        
        {/* <label>
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
        })} */}

        {/* <button onClick={this.addNewCategory}>Add Category</button> */}
        <button onClick={this.printFile}>Print to File</button>
      
        <FolderTree 
          name = {this.state.directories.name}
          path = {this.state.directories.path}
          links = {this.state.directories.links}
          parent = {""}
          children = {this.state.directories.children}
          getSubDirs = {this.getSubDirs}
          expanded = {this.state.directories.expanded}
          setCollapsed = {this.setCollapsed}
          addLink = {this.addLink}
          handleDelete = {this.handleDelete}
          ref = {this.child}
          handleAddDirectory = {this.handleAddDirectory}
        />
    </div>
   );
  }
}

function render() {
  ReactDOM.render(<App/>, document.getElementById('root'));
}

render();