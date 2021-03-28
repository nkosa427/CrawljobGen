import * as React from "react";
import '../renderer';

const { ipcRenderer } = require('electron');

let Logo ="https://logrocket.com/img/logo.png";

ipcRenderer.on('dir', (event, arg) => {
  console.log(String(arg));
});

export default class FirstComponent extends React.Component <{}> {
        
  render() {
    return (
      <div>
        {/* React components must have a wrapper node/element */}
        <h1>A Simple React Component Example with Typescript</h1>
        <div>
          <img src={Logo} />
          <button onClick={()=>{
            ipcRenderer.send('asynchronous-message', 'ping')
            }}>Com</button>
        </div>
        <p>I am a compinent which shows the logrocket logo. For more info on Logrocket, please visit Https://logrocket.com</p>
      </div>
);
  }
}