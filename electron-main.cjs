const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = !app.isPackaged;

let mainWindow;
let serverProcess;

function startServer() {
  // En producción usamos el archivo compilado, en desarrollo usamos tsx
  const serverPath = isDev 
    ? path.join(__dirname, 'server.ts') 
    : path.join(process.resourcesPath, 'dist', 'server.cjs');

  const cmd = isDev ? 'npx' : 'node';
  const args = isDev ? ['tsx', serverPath] : [serverPath];

  serverProcess = spawn(cmd, args, {
    env: { ...process.env, NODE_ENV: isDev ? 'development' : 'production' },
    shell: true
  });

  serverProcess.stdout.on('data', (data) => console.log(`Server: ${data}`));
  serverProcess.stderr.on('data', (data) => console.error(`Server Error: ${data}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    icon: path.join(__dirname, 'public', 'favicon.ico'), // Asegúrate de tener un icono
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "CHRONOS LABOR OS - Factureando",
    autoHideMenuBar: true
  });

  // Esperamos a que el servidor de Express esté listo
  const url = 'http://localhost:3000';
  
  if (isDev) {
    mainWindow.loadURL(url);
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, reintentamos hasta que el servidor responda
    const loadWithRetry = () => {
      mainWindow.loadURL(url).catch(() => {
        setTimeout(loadWithRetry, 500);
      });
    };
    loadWithRetry();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) serverProcess.kill();
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
