import * as React from "react";
const { ipcRenderer } = require('electron');

export default class Category extends React.Component {

  constructor(props){
    super(props);
    // this.callOpenDialog = this.callOpenDialog.bind(this);
    this.state = {
      categoryPath: this.props.path
    }
  }

  render() {
    return (
      <div>
        <fieldset>
          <legend>
          <h3>{this.state.categoryPath}</h3>
          </legend>
        </fieldset>
        {/* <button onClick={this.props.callOpenDialog}>Select Category Folder</button> */}
      </div>
    );
  }
}