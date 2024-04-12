const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Function to trigger the file dialog from the renderer process
    selectFile: () => {
        ipcRenderer.send('open-file-dialog-for-csv');
    },
    
    // Function to receive the selected file path from the main process
    onFileSelected: (callback) => {
        ipcRenderer.on('selected-csv', (event, path) => callback(path));
    },
    
    // Function to send the file path and additional parameters to the main process to start analysis
    startAnalysis: (filePath, ignoreCompanies, maxRank, ignoreNoRank) => {
        ipcRenderer.send('start-analysis', { filePath, ignoreCompanies, maxRank, ignoreNoRank });
    },
    
    // Function to listen for analysis results from the main process
    onAnalysisResults: (callback) => {
        ipcRenderer.on('analysis-results', (event, results) => callback(results));
    }
});
