const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    selectFile: () => ipcRenderer.send('open-file-dialog-for-csv'),
    onFileSelected: (callback) => ipcRenderer.on('selected-csv', (event, path) => callback(path)),
    startAnalysis: (path) => ipcRenderer.send('start-analysis', path)
});