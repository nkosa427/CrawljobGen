import * as React from "react";
const { ipcRenderer } = require('electron');

interface IMyComponentState {
  categoryPath: string
}

export default class Category extends React.Component <{},IMyComponentState> {

  constructor(props: {}){
    super(props);
    this.callOpenDialog = this.callOpenDialog.bind(this);
    this.state = {
      categoryPath: 'No path'
    }
  }

  callOpenDialog(){
    var fp = String(ipcRenderer.sendSync('open-dialog'));
    this.setState({
      categoryPath: fp
    });
  }

  render() {
    return (
      <div>
        <fieldset>
          <legend>
          <h3>{this.state.categoryPath}</h3>
          </legend>
        </fieldset>
        <button onClick={this.callOpenDialog}>Select Category Folder</button>
      </div>
    );
  }
}