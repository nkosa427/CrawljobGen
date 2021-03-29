const { app, BrowserWindow, ipcMain, dialog, globalShortcut, Menu, MenuItem } = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  electronLocalshortcut.register(mainWindow, ['Ctrl+R', 'F5'], () => {
    let choice = dialog.showMessageBoxSync(
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Refresh?',
        message: 'Are you sure you want to reload?'
      }
    );

    if (!choice) {
      console.log("reloading");
      mainWindow.reload();
    }
  });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  globalShortcut.unregisterAll();
  electronLocalshortcut.unregisterAll(mainWindow);
  console.log("Shortcuts unregistered");
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


ipcMain.on('open-dialog', (event, defPath) => {
  dialog.showOpenDialog( {
    properties: ['openDirectory', 'openFile'],
    defaultPath: defPath
  }).then(result => {
    // event.sender.send('folderPath', result.filePaths);
    event.returnValue = result.filePaths;
  }).catch(err => {
    console.log(err)
  })
});

function convertPaths(folders, convert, prefix) {
  folders.forEach(folder => {
    folder.path = folder.path.replace(prefix, '');
    if (convert) {
      folder.path = folder.path.replace(/\\/g, "/")
    }
  });

  return folders;
}

ipcMain.on('printFile', (event, folders, convert, prefix) => {
  if (convert || prefix != ''){
    folders = convertPaths(folders, convert, prefix);
  }

  var outText = "";

  for (let i = 0; i < folders.length; i++){
    for (let j = 0; j < folders[i].links.length; j++){
      outText += folders[i].path + "\n";
      outText += folders[i].links[j] + "\n\n";
      console.log("printing " + folders[i].path+" - "+folders[i].links[j]);
    }
  }

  console.log("final text: " + outText);
  
  let dt = new Date();
  let path = dt.getMonth() + "-" + dt.getDay() + "-" + dt.getFullYear() + "." + dt.getHours() + "-" + dt.getMinutes() + "-" + dt.getSeconds();
  dialog.showSaveDialog({
    title: 'Select File Location',
    defaultPath: (path),
    buttonLabel: 'Save',
    filters: [{
      name: 'crawljob file',
      extensions: ['crawljob']
    }]
  }).then(file => {
    if (!file.canceled && folders.length > 0 && folders[0].path != '') {
      console.log(file.filePath.toString());

      fs.writeFile(
        file.filePath.toString(), 
        outText, 
        (err) => {if (err) throw err;}
      );

      console.log("Finished writing");
    } else {
      console.log("Not writing");
    }
    
  }).catch(err =>{
    console.log(err)
  });
});