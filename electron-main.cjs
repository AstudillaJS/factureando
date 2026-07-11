const { app, BrowserWindow, ipcMain, dialog, nativeImage, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configurar logger para auto-updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.disableWebInstaller = true;

let mainWindow;
let expressServer;

function createWindow() {
  const iconPath = path.join(__dirname, 'public', 'lynx-icon.png');
  const icon = require('fs').existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "CHRONOS LABOR OS | LYNX Consulting",
    icon: icon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Ocultar el menú por defecto de Electron
  mainWindow.setMenuBarVisibility(false);

  // Cerrar DevTools en producción
  if (app.isPackaged) {
    mainWindow.webContents.closeDevTools();
  } else {
    mainWindow.webContents.openDevTools();
  }

  // Redirigir la consola del renderer a los logs de Electron
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    log.info(`[RENDERER CONSOLE] Level: ${level} | Message: ${message} | Source: ${sourceId}:${line}`);
  });

  // Escuchar fallos de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log.error(`Error al cargar la página: ${errorCode} - ${errorDescription}`);
    mainWindow.webContents.openDevTools();
  });

  // Iniciar servidor local
  try {
    if (app.isPackaged) {
      process.env.NODE_ENV = 'production';
      log.info("Iniciando servidor Express en producción...");
      const { startServer } = require('./dist/server.cjs');
      startServer().then(() => {
        log.info("Servidor Express iniciado en el puerto 3010. Cargando URL...");
        mainWindow.loadURL('http://localhost:3010');
      }).catch(err => {
        log.error("Error al iniciar el servidor Express:", err);
        mainWindow.webContents.openDevTools();
      });
    } else {
      mainWindow.loadURL('http://localhost:3010');
    }
  } catch (err) {
    log.error("Error en bloque try-catch iniciando Express:", err);
  }

  // Buscar actualizaciones si está empaquetado
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// Eventos del Auto-Updater
autoUpdater.on('update-available', (info) => {
  log.info('Actualizacion disponible:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  log.info('No hay actualizaciones disponibles.');
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available', info);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Actualizacion descargada');
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }

  const dialogOpts = {
    type: 'info',
    buttons: ['Reiniciar e Instalar', 'Mas Tarde'],
    title: 'Actualizacion Lista',
    message: 'Una nueva version ha sido descargada',
    detail: 'Deseas reiniciar la aplicacion para aplicar las actualizaciones ahora?'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
  log.error('Error en el auto-updater: ' + err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

// IPC: Disparado desde el renderer al hacer click en "Buscar Actualizacion"
ipcMain.on('check-for-updates', () => {
  log.info('Verificando actualizaciones por solicitud del usuario...');
  autoUpdater.checkForUpdatesAndNotify();
});

// IPC: Disparado desde el renderer al hacer click en "Reiniciar e Instalar"
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});

// IPC: Retornar la version actual al frontend
ipcMain.on('get-app-version', (event) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('set-opacity', (event, opacity) => {
  if (mainWindow) mainWindow.setOpacity(opacity);
});

ipcMain.handle('select-pdf-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

ipcMain.on('open-backup-folder', () => {
  const backupPath = path.join(app.getPath('userData'), 'session_data.json');
  shell.showItemInFolder(backupPath);
});

ipcMain.on('open-pdf', (event, pdfPath) => {
  if (require('fs').existsSync(pdfPath)) {
    shell.openPath(pdfPath);
  }
});
