import * as React from "react";
import LinkEntry from './linkEntry.jsx'

const { ipcRenderer } = require('electron');

export default class Category extends React.Component {

  constructor(props){
    super(props);
    this.linkAdded = this.linkAdded.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.addBlankInput = this.addBlankInput.bind(this);
    this.state = {
      categoryPath: this.props.path,
      links: []
    }
  }

  linkAdded(event){
    this.props.passLink(event.target.value, this.props.index);
  }

  addBlankInput(){
    this.setState({
      links: [...this.state.links, '']
    });
  }

  _handleKeyDown(str){
    if (!this.state.links.includes(str)) {
      console.log('do validate ' + str);
      this.setState({
        links: [...this.state.links, str]
      });
    } else {
      console.log('Duplicate link');
    }
  }

  render() {
    return (
      <div>
        <fieldset>
          <legend>
          <h3>{this.state.categoryPath}</h3>
          </legend>
          {this.state.links.map( (link, index) => {
            return <LinkEntry
              key={link}
              link={link}
              onKey={this._handleKeyDown} 
              isDisabled={true} 
            />
          })}
          <LinkEntry onKey={this._handleKeyDown} isDisabled={false} />
        </fieldset>
        {/* <button onClick={this.props.callOpenDialog}>Select Category Folder</button> */}
      </div>
    );
  }
}