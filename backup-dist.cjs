const fs = require('fs-extra');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const backupBaseDir = path.join(__dirname, 'Versiones anteriores');

async function backup() {
  if (fs.existsSync(distDir)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(backupBaseDir, `dist-backup-${timestamp}`);
    
    console.log(`Guardando copia de seguridad de dist en: ${backupDir}`);
    await fs.ensureDir(backupBaseDir);
    await fs.copy(distDir, backupDir);
    console.log('Copia de seguridad completada.');
  } else {
    console.log('No existe carpeta dist para respaldar.');
  }
}

backup().catch(console.error);
