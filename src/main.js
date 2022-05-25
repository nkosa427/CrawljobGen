const { app, BrowserWindow, ipcMain, dialog, globalShortcut, Menu, MenuItem } = require('electron');
const fs = require('fs');
const yaml = require('js-yaml')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.setMenu(null);

  mainWindow.on('focus', (event) => {
    console.log("focus");
    globalShortcut.register("CommandOrControl+R", () => {
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
  });

  mainWindow.on('blur', () =>{
    globalShortcut.unregister('CommandOrControl+R');
  });

  mainWindow.on('close', (e) => {
    const choice = dialog.showMessageBoxSync(
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit?'
      });
    if (choice === 1) {
      e.preventDefault();
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

ipcMain.on('getPlatform', (event) => {
  event.returnValue = process.platform;
})

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

function convertPathsToUnix(folders, convert, prefix) {
  folders.forEach(folder => {
    folder.path = folder.path.replace(prefix, '');
    if (convert) {
      folder.path = folder.path.replace(/\\/g, "/")
    }
  });
  return folders;
}

function convertPathsToWindows(obj) {
  Object.keys(obj).forEach(key => {
    obj[key] = obj[key].replace(/\//g, "\\")
  })
  return obj
  // return str.replace(/\\/g, "/");
}

function removeTrailingSlash(obj) {
  Object.keys(obj).forEach(key => {
    obj[key] = obj[key].replace(/(?:\/|\\)$/, '')
  })
  return obj
}

ipcMain.on('printFile', (event, folders, convert, prefix) => {
  if (convert || prefix != ''){
    folders = convertPathsToUnix(folders, convert, prefix);
  }

  var outText = "";

  for (let i = 0; i < folders.length; i++){
    for (let j = 0; j < folders[i].links.length; j++){
      outText += "text=" + folders[i].links[j] + "\n";
      outText += "downloadFolder=" + folders[i].path + "\n\n";
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

ipcMain.on('generateCrawljob', (event, allLinks, cjPath, slashType) => {
  console.log('gen', allLinks)
  let dt = new Date();
  let month = dt.getMonth()+1
  let path = month + "-" + dt.getDate() + "-" + dt.getFullYear() + "_" + dt.getHours() + "-" + dt.getMinutes() + "-" + dt.getSeconds()
  // console.log("dt:", dt.getMonth()+1, "-", dt.getDate(), "-", dt.getFullYear())
  // console.log("tm:", dt.getHours(), ":", dt.getMinutes(), ":", dt.getSeconds(), "timezone", dt.getTimezoneOffset())
  console.log("path:", path)

  dialog.showSaveDialog({
    title: 'Select File Location',
    defaultPath: (cjPath + slashType + path),
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
})

async function getDirectories(dir) {
  fs.access(dir, (err) => {
    if (err) {
      console.log("Error accessing directory:", dir)
    } else {
      fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) {
          console.log("Error reading directory ", dir, err)
          return "Error reading directory " + err
        }
        files = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
        console.log('f:', files, typeof(files))
        return files
      })
    }
  })
}

function directoryValid(dir) {
  try {
    fs.accessSync(dir)
    return true
  } catch (e) {
    console.log("Error accessing directory:", dir)
    return false
  }
  // fs.access(dir, (err) => {
  //   if (err) {
  //     console.log("Error accessing directory:", dir)
  //     return false
  //   } else {
  //     return true
  //   }
  // })
}

ipcMain.on('getSubDirs', (event, dir) => {
  if (!directoryValid(dir)) {
    event.returnValue = null;
  } else {
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.log("Error reading directory ", dir, err)
        return "Error reading directory " + err
      }
      files = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
      event.returnValue = files
    })
  }
})

ipcMain.on('getTopDir', (event) => {
  try {
    let fc = fs.readFileSync('./config.yaml', 'utf8')
    let data = yaml.load(fc)
    if (process.platform == "win32" ) {
      data = convertPathsToWindows(data)
    }
    data = removeTrailingSlash(data)
    // console.log("data:", data)
    event.returnValue = data
  } catch (e) {
    console.log(e)
    event.returnValue = null
  }
})
