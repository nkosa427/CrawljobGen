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

    this.state = {
      folderpath: this.props.path,
      links: [],
      subcategories: []
    }  
  }

  addBlankInput(){
    this.setState({
      links: [...this.state.links, '']
    });
  }

  _handleKeyDown(str){
    if (!this.state.links.includes(str)) {
      this.setState({
        links: [...this.state.links, str]
      });
      this.props.passLink(str, this.props.index, this.props.level);
    } else {
      console.log('Duplicate link');
    }
  }

  addSubCategory(){
    var fp = String(ipcRenderer.sendSync('open-dialog', this.props.path));
    if (fp != this.state.folderpath && fp != []){
      this.setState({
        subcategories: [
          ...this.state.subcategories,
          {
            folderpath: fp,
            links: [],
            subcategories: []
          }]
      }, () => {this.props.onAddSub({
        category: fp,
        indexes: [this.state.subcategories.length - 1, this.props.index]
      })});
      
    } else {
      console.log("Same folder!");
    }
  }

  onSubCategoryAdded(indicies){
    console.log("from " + this.state.folderpath + ": " + this.props.index);
    indicies.indexes.push(this.props.index);
    this.props.onAddSub(indicies);
  }

  render() {
    return (
      <div>
        <fieldset>
          <legend>
          <h3>{this.state.folderpath}</h3>
          </legend>
          <button onClick={this.onSubCategoryAdded}>debug</button>
          <button onClick={this.addSubCategory}>New Sub-Category</button>
          {this.state.links.map( (link, index) => {
            return <LinkEntry
              key={link}
              link={link}
              onKey={this._handleKeyDown} 
              isDisabled={true} 
            />
          })}
          <LinkEntry onKey={this._handleKeyDown} isDisabled={false} />
          {this.state.subcategories.map((subcategory, index) => {
            return <Category 
              key={subcategory.folderpath}
              index={index}
              path={subcategory.folderpath}
              passLink={this.props.passLink}
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