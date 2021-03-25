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
    // ipcRenderer.send('open-dialog');
    // ipcRenderer.on('folderPath', (event, arg) => {
    //   console.log(String(arg));
    // });
  }

  render() {
    return (
      <div>
        <fieldset>
          <legend>
            <button onClick={this.callOpenDialog}>Select Category Folder</button>
          </legend>
        </fieldset>
        <h2>{this.state.categoryPath}</h2>
      </div>
    );
  }
}