// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const ipc = require('electron').ipcRenderer;
const axios = require('axios');

document.getElementById('dirs').addEventListener('click', () => {
  window.postMessage({
    type: 'select-dirs'
  })
})

ipc.on('dir', (event, arg) => {
  wtolxdir(String(arg));
  addToTextArea();
})

var prevQueries = document.getElementById('prevQueries');
var queue = [];

function addToTextArea() {
  prevQueries.value = "";
  // console.log("item0: " + queue[0]);
  for (let i = queue.length-1; i >= 0; i--) {
    prevQueries.value += queue[i] + '\r\n';
    // console.log("PRINTING: " + queue[i]);
    
  }
}

// function clearTextArea() {

// }

function wtolxdir(dir) {
  txtarea = document.getElementById('lxdir');
  windir = dir.replace('F:\\Downloads\\misc\\', '');
  windir = windir.replace(/\\/g, "/");
  windir += "/";

  queue.push(windir);
  document.getElementById('lxdir').value = windir;

  // prevQueries.value += windir + '\r\n';

  // windir += "\n";
  // var addToDiv = document.createTextNode(windir);
  // prevQueries.appendChild(addToDiv);

}