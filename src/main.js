const { app, BrowserWindow, ipcMain, dialog, globalShortcut, net, Menu, MenuItem } = require('electron');
const fs = require('fs');
const yaml = require('js-yaml')
const http = require('http')

const configFilePath = './config.yaml'

try {
  const config = yaml.load(fs.readFileSync(configFilePath, 'utf8'))

  global.pydlpPort = config.pydlpPort
  global.pydlpAddress = config.pydlpAddress
  global.cjPath = config.cjPath
} catch (e) {
  console.error(`Error loading config file: ${e}`)
  app.exit(1)
}

console.log("yamls:", pydlpAddress, pydlpPort)

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
          defaultId: 1,
          noLink: true,
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

ipcMain.on('generateCrawljob', (event, allLinks, cjPath, slashType) => {
  console.log('gen', allLinks)
  let dt = new Date();
  let month = dt.getMonth()+1
  let fileName = month + "-" + dt.getDate() + "-" + dt.getFullYear() + "_" + dt.getHours() + "-" + dt.getMinutes() + "-" + dt.getSeconds()
  // console.log("dt:", dt.getMonth()+1, "-", dt.getDate(), "-", dt.getFullYear())
  // console.log("tm:", dt.getHours(), ":", dt.getMinutes(), ":", dt.getSeconds(), "timezone", dt.getTimezoneOffset())
  console.log("path:", fileName)

  let outText = ""
  allLinks.forEach((link) => {
    link.links.forEach((txt) => {
      outText += "text=" + txt + "\n";
      outText += "packageName=" + fileName + "\n";
      outText += "downloadFolder=" + link.path + "\n\n";
    })
  })

  console.log("outtext:", outText)

  if (outText === "") {
    dialog.showMessageBox({
      type: 'info',
      buttons: ['Ok'],
      title: 'No Links',
      message: 'No links found'
    })
  } else {
    dialog.showSaveDialog({
      title: 'Select File Location',
      defaultPath: (cjPath + slashType + fileName),
      buttonLabel: 'Save',
      filters: [{
        name: 'crawljob file',
        extensions: ['crawljob']
      }]
    }).then(file => {
      if (!file.canceled && allLinks.length > 0 && allLinks[0].path != '') {
        console.log(file.filePath.toString());

        fs.writeFile(
          file.filePath.toString(), 
          outText, 
          (err) => {
            if (err) {
              throw err;
            } else {
              dialog.showMessageBox({
                type: 'info',
                buttons: ['Ok'],
                title: 'Write success',
                message: 'Finished writing file'
              })
            }
          }
        );

        console.log("Finished writing");
      } else {
        console.log("Not writing");
      }
      
    }).catch(err =>{
      console.log(err)
    });
  }
})

ipcMain.on('pydlp', (event, allObjects) => {
  const exdata = JSON.stringify(allObjects)
  console.log('pydlp called for:', exdata)

  const request = net.request({
    method: 'POST',
    protocol: 'http:',
    hostname: pydlpAddress,
    port: pydlpPort,
    path: '/add',
    headers: {
    'Content-Type': 'application/json'
  }
  });

  request.on('response', (response) => {
    console.log(`STATUS: ${response.statusCode}`)
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
    response.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`)
    })
    response.on('end', () => {
      console.log('No more data in response.')
    })
  })
  
  request.on('error', (error) => {
    console.error(`ERROR: ${JSON.stringify(error)}`)
  })
  
  request.write(exdata)
  request.end()
})

ipcMain.on('startLoop', (event) => {
  const url = 'http://' + pydlpAddress + ':' + pydlpPort + '/start_search_files';

  const request = net.request(url);

  request.on('response', (response) => {
    console.log(`STATUS: ${response.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
    response.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    response.on('end', () => {
      console.log('No more data in response.');
    });
  });

  request.end();
})

ipcMain.on('stopLoop', (event) => {
  const url = 'http://' + pydlpAddress + ':' + pydlpPort + '/stop_search_files';

  const request = net.request(url);

  request.on('response', (response) => {
    console.log(`STATUS: ${response.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
    response.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    response.on('end', () => {
      console.log('No more data in response.');
    });
  });

  request.end();
})

function directoryValid(dir) {
  try {
    fs.accessSync(dir)
    return true
  } catch (e) {
    console.log("Error accessing directory:", dir)
    return false
  }
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

ipcMain.on('clearLinks', (event) => {
  let choice = dialog.showMessageBoxSync(
    {
      type: 'question',
      defaultId: 1,
      noLink: true,
      buttons: ['Yes', 'No'],
      title: 'Clear links?',
      message: 'Are you sure you want to clear all links?'
    }
  );

  event.returnValue = choice
})

ipcMain.on('pydlpChoice', (event) => {
  let choice = dialog.showMessageBoxSync(
    {
      type: 'question',
      defaultId: 1,
      noLink: true,
      buttons: ['Yes', 'No'],
      title: 'Clear links?',
      message: 'Are you sure you want to call pyDlp?'
    }
  );

  event.returnValue = choice
})
