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
    this.findPath = this.findPath.bind(this);
    this.printFile = this.printFile.bind(this);
    this.printDir = this.printDir.bind(this);
    this.printDirLinks = this.printDirLinks.bind(this);
    this.sendPyDlp = this.sendPyDlp.bind(this);
    this.startLoop = this.startLoop.bind(this);
    this.stopLoop = this.stopLoop.bind(this);
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
      },
      textAreaText: ''
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

  printDirLinks(dirs, allLinks) {
    if (dirs.links.length > 0) {
      dirs.links.forEach((link) => {
        allLinks.push(link)
      })
      // allLinks.push(dirs.links)
    }

    dirs.children.forEach((child) => {
      allLinks = this.printDirLinks(child, allLinks)
    })

    return allLinks
  }

  findPath(dirs, path, target) {
    // console.log("Searching", dirs.path)
    if (dirs.path == path) {
      return dirs
    }

    dirs.children.forEach((child) => {
      target = this.findPath(child, path, target)
    })

    return target
  }

  printDir(dir){
    let allTargetLinks = []
    let targetDir = ""
    console.log("PRINT PATH:", dir)
    let stateCpy = this.state.directories

    targetDir = this.findPath(stateCpy, dir, targetDir)
    console.log("Received dir:", targetDir)

    allTargetLinks = this.printDirLinks(targetDir, allTargetLinks)
    console.log("AllLinks:", allTargetLinks)
    this.setState({
      textAreaText: allTargetLinks.join('\n')
    })

    // ipcRenderer.send('generateCrawljob', allLinks, this.state.cjPath, this.state.slashType)
    // ipcRenderer.send('printFile', this.state.folders, this.state.convertSlashes, this.state.prefix);
  }
  
  sendPyDlp(dir) {
    let choice = ipcRenderer.sendSync('pydlpChoice')

    if (!choice) {
      console.log("Proceeding with pydlp")
      let allObjects = []
      let targetDir = ""
      console.log("SEND PATH:", dir)
      let stateCpy = this.state.directories

      targetDir = this.findPath(stateCpy, dir, targetDir)
      console.log("Received dir:", targetDir)

      allObjects = this.getTargetObjs(targetDir, allObjects)
      console.log("allObjects:", allObjects)
    
      ipcRenderer.send('pydlp', allObjects)
    } else {
      console.log("Declined pydlp")
    }
  }

  getTargetObjs(dirs, allObjects) {
    let prefix = this.state.topDir

    //Remove the topDirectory prefix
    let trimmedPath = dirs.path
    if (dirs.path.startsWith(prefix)) {
      trimmedPath = dirs.path.substring(prefix.length)
    }

    //Remove leading backslash
    if (trimmedPath.startsWith("\\")) {
      trimmedPath = trimmedPath.substring(1)
    }

    //Change backslashes to forward slashes
    trimmedPath = trimmedPath.replace(/\\/g, '/')

    if (dirs.links.length > 0) {
      dirs.links.forEach((link) => {
        allObjects.push({
          "link": link,
          "destination": trimmedPath
        })
      })
      // allLinks.push(dirs.links)
    }

    dirs.children.forEach((child) => {
      allObjects = this.getTargetObjs(child, allObjects)
    })

    return allObjects
  }

  startLoop() {
    console.log("Start Loop clicked")
    ipcRenderer.send('startLoop')
  }

  stopLoop() {
    console.log("Stop Loop clicked")
    ipcRenderer.send('stopLoop')
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
      var cats = []
      
      if (dirs !== null) {
        dirs.forEach((dir) => {
          let check = obj.children.some((child) => {
            return child.name == dir //If directory has been previously loaded
          })

          if (!check) {
            if (dir.endsWith(',')) {
              cats.push({
                name: dir,
                path: obj.path + this.state.slashType + dir,
                links: [],
                children: []
              })
            } else if (dir.endsWith('models_')){
              cats.push({
                name: dir,
                path: obj.path + this.state.slashType + dir,
                links: [],
                children: []
              })
            } else {
              newDirs.push({
                name: dir,
                path: obj.path + this.state.slashType + dir,
                links: [],
                children: []
              })
            }
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

      // console.log("newDirs:", newDirs)
      cats.forEach((cat) => {
        obj.children.push({
          name: cat.name,
          path: obj.path + this.state.slashType + cat.name,
          links: [],
          children: []
        })
      })

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
      let arr = link.split(/\r?\n| /)
      let count = 0

      arr.forEach(arrLink => {
        let check = obj.links.some((ln) => {
          return arrLink === ln
        })
  
        if (!check) {
          obj.links.push(arrLink)
          count += 1
        } else {
          console.log("Duplicate link")
        }
      })

      this.setState({
        numLinks: this.state.numLinks + count
      })

      // let check = obj.links.some((ln) => {
      //   return link === ln
      // })

      // if (!check) {
      //   obj.links.push(link)
      //   this.setState({
      //     numLinks: this.state.numLinks + 1
      //   })
      // } else {
      //   console.log("Duplicate link")
      // }
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
        numLinks: 0,
        textAreaText: ''
      })
      this.child.current.hideLinkEntries()
    }
  }

  handleAddDirectory(dir, path) {
    let addDir = (obj, details) => {
      obj.children.unshift({
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
        <textarea value={this.state.textAreaText} />
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
        
        <button onClick={this.printFile}>Print to File</button>
        <button onClick={this.startLoop}>Start Loop</button>
        <button onClick={this.stopLoop}>Stop Loop</button>

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
          printDir = {this.printDir}
          sendPyDlp = {this.sendPyDlp}
        />
    </div>
   );
  }
}

function render() {
  ReactDOM.render(<App/>, document.getElementById('root'));
}

render();