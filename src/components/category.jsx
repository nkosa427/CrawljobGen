import * as React from "react";
import LinkEntry from './linkEntry.jsx';

const { ipcRenderer } = require('electron');

export default class Category extends React.Component {

  constructor(props){
    super(props);

    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.addBlankInput = this.addBlankInput.bind(this);
    this.addSubCategory = this.addSubCategory.bind(this);
    this.onSubCategoryAdded = this.onSubCategoryAdded.bind(this);
    this.editLink = this.editLink.bind(this);

    this.state = {
      folderpath: this.props.path,
      displayPath: this.props.displayPath,
      links: [],
      subcategories: []
    }
    
  }

  editLink(link){
    let linkCopy = this.state.links;
    let index = linkCopy.indexOf(link)
    // console.log("Removing link " + link + " at index " + index);
    
    linkCopy.splice(index, 1);
    this.props.removeLink(link);
    this.setState({
      links: linkCopy
    });
  }

  addBlankInput(){
    this.setState({
      links: [...this.state.links, '']
    });
  }

  _handleKeyDown(str){
    console.log("displaypath: " + this.props.displayPath);
    if (!this.state.links.includes(str)) {
      this.setState({
        links: [...this.state.links, str]
      });
      this.props.passLink(str, this.state.folderpath);
    } else {
      console.log('Duplicate link');
    }
  }

  addSubCategory(){
    /*Sends message to electron main process to open folder select dialog.
      uses sendSync, so a response is needed to proceed.  */
    var fp = String(ipcRenderer.sendSync('open-dialog', this.props.path));
    if (fp != this.state.folderpath && fp != []){ //If folder was selected and if that folder already isn't in the array
      this.setState({
        subcategories: [
          ...this.state.subcategories,
          {
            folderpath: fp,
            displayPath: fp,
            links: [],
            subcategories: []
          }]
      }, () => {
        this.onSubCategoryAdded(fp)
      });
      
    } else {
      console.log("Same folder!");
    }
  }

  onSubCategoryAdded(fp){
    this.props.onAddSub(fp);
  }

  render() {
    let color = (this.props.level % 2 == 0) ? 'A' : 'B';
    return (
      <div className={`category color${color}`}>
        <fieldset>
          <legend>
          <h3>{this.props.displayPath}</h3>
          </legend>
          <button onClick={this.addSubCategory}>New Sub-Category</button>
          {this.state.links.map( (link, index) => {
            return <LinkEntry
              key={link}
              link={link}
              onKey={this._handleKeyDown} 
              isDisabled={true} 
              index={index}
              editLink={this.editLink}
            />
          })}
          <LinkEntry onKey={this._handleKeyDown} isDisabled={false} />
          {this.state.subcategories.map((subcategory, index) => {
            return <Category 
              key={subcategory.folderpath}
              index={index}
              path={subcategory.folderpath}
              displayPath={subcategory.displayPath}
              passLink={this.props.passLink}
              removeLink={this.props.removeLink}
              level={this.props.level + 1}
              onAddSub={this.onSubCategoryAdded}
            />
            }
          )}
        </fieldset>
      </div>
    );
  }
}