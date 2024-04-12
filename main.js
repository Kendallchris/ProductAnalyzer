const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // add this line
            nodeIntegration: false, // change this to false
            contextIsolation: true, // add this line
            enableRemoteModule: false, // add this line for security
        }
    })
    win.loadFile('index.html');
    win.webContents.openDevTools();
}

function showModule(moduleId) {
    // Hide all modules
    document.querySelectorAll('.module-content > div').forEach((div) => {
        div.classList.add('hidden');
    });

    // Show the requested module
    document.getElementById(moduleId).classList.remove('hidden');
}

function productResearch() {
    showModule('product-research-content');
}

ipcMain.on('open-file-dialog-for-csv', (event) => {
    dialog.showOpenDialog({
        //parent: win, // or just omit this if you don't need to set a parent window
        properties: ['openFile'],
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            // This line sends the file path back to the renderer process
            event.sender.send('selected-csv', result.filePaths[0]);
            console.log('Selected file path:', result.filePaths[0]);
            //event.reply('selected-csv', result.filePaths[0]);
        }
    }).catch(err => {
        console.error(err);
    });
});

// HERE IS WHERE I WILL IMPLEMENT MY CATALOGSEARCH FUNCTION *********************************************
ipcMain.on('start-analysis', (event, args) => {
    console.log('Start analysis for:', args);
    // args.filePath, args.ignoreCompanies, args.maxRank, args.ignoreNoRank are now available
    // Here you can handle the file analysis using the provided parameters
    // Perform your analysis with these parameters
});

app.whenReady().then(createWindow);