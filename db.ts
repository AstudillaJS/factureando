import fs from 'fs';
import path from 'path';

const isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron;

export const DATA_DIR = isElectron
  ? path.join(process.env.APPDATA || process.env.USERPROFILE || '.', 'Factureando')
  : path.join(process.cwd(), 'data');

const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default structure
const defaultData = {
  config: {
    mpToken: '',
    afipCrtPath: '',
    afipKeyPath: '',
    afipCuit: '',
    afipProduction: false
  },
  invoices: [],
  clients: []
};

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
}

export function readDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB:', error);
    return defaultData;
  }
}

export function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing DB:', error);
    return false;
  }
}

export function updateConfig(newConfig: any) {
  const db = readDb();
  db.config = { ...db.config, ...newConfig };
  writeDb(db);
  return db.config;
}

export function getConfig() {
  return readDb().config;
}

export function addInvoice(invoice: any) {
  const db = readDb();
  db.invoices.push({ id: Date.now().toString(), createdAt: new Date().toISOString(), ...invoice });
  writeDb(db);
}

export function getInvoices() {
  return readDb().invoices;
}
