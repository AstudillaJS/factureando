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

// Estructura por defecto para perfiles múltiples
const defaultData = {
  profiles: [], // Array de perfiles de contribuyentes
  activeProfileId: '', // ID (CUIT) del perfil de contribuyente activo
  invoices: [],
  clients: [],
  inflationRates: [
    { year: 2026, month: 1, rate: 6.0 },
    { year: 2026, month: 2, rate: 5.5 },
    { year: 2026, month: 3, rate: 4.8 },
    { year: 2026, month: 4, rate: 4.2 },
    { year: 2026, month: 5, rate: 3.8 },
    { year: 2026, month: 6, rate: 3.5 },
  ]
};

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
}

export function readDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    // MIGRACIÓN AUTOMÁTICA: Si existe el antiguo config único, migrarlo a la estructura multiperfil
    if (parsed.config) {
      const oldConfig = parsed.config;
      const primaryCuit = oldConfig.afipCuit || 'default';
      
      const migratedProfile = {
        id: primaryCuit,
        businessName: oldConfig.businessName || 'Mi Barbería',
        afipCuit: oldConfig.afipCuit || '',
        monotributoCategory: oldConfig.monotributoCategory || 'A',
        puntoVenta: parseInt(oldConfig.puntoVenta || oldConfig.afipPtoVta || '1'),
        afipCrtPath: oldConfig.afipCrtPath || '',
        afipKeyPath: oldConfig.afipKeyPath || '',
        afipProduction: oldConfig.afipProduction !== undefined ? oldConfig.afipProduction : true,
        afipToken: oldConfig.afipToken || '',
        mpToken: oldConfig.mpToken || '',
        invoiceLogo: oldConfig.invoiceLogo || '',
        themeColor: oldConfig.themeColor || '',
        theme: oldConfig.theme || 'cyberpunk',
        posProducts: oldConfig.posProducts || []
      };

      parsed.profiles = [migratedProfile];
      parsed.activeProfileId = migratedProfile.id;
      delete parsed.config;

      // Migrar facturas históricas asociándolas al cuit antiguo
      if (Array.isArray(parsed.invoices)) {
        parsed.invoices = parsed.invoices.map((inv: any) => ({
          ...inv,
          profileId: inv.profileId || primaryCuit
        }));
      }

      writeDb(parsed);
      console.log(`[MIGRACIÓN LOCAL COMPLETA] Se migró la configuración antigua al perfil CUIT: ${primaryCuit}`);
    }

    if (!parsed.profiles) parsed.profiles = [];
    if (parsed.activeProfileId === undefined) parsed.activeProfileId = '';

    // AUTO-RECUPERACIÓN DE BARBERÍA: Si la barbería no existe en perfiles, la creamos y re-asignamos sus facturas
    if (parsed.profiles && !parsed.profiles.some((p: any) => p.id === "20369106539" || p.afipCuit === "20369106539")) {
      console.log("[RESTAURACIÓN] Recuperando perfil de Barbería (Mauro Joaquin Recalde)...");
      const barberProfile = {
        id: "20369106539",
        businessName: "Mauro Joaquin Recalde",
        afipCuit: "20369106539",
        monotributoCategory: "A",
        puntoVenta: 2,
        afipCrtPath: "C:\\Users\\astud\\AppData\\Roaming\\Factureando\\certs\\Factureando_2efead313992519e.crt",
        afipKeyPath: "C:\\Users\\astud\\AppData\\Roaming\\Factureando\\certs\\privada.key",
        afipProduction: true,
        afipToken: "5fOgfQn4qAMJQAEYMyGodDpz3QieOwJG2I8JANqtqfZdHJOaAfvTvSxF2940Uxyn",
        mpToken: "APP_USR-5415027657528639-052018-a58e9ea24dec09713cfed34890b83546-1270276327",
        invoiceLogo: "",
        themeColor: "#ff007f",
        theme: "cyberpunk",
        domicilioComercial: "URQUIZA 1589",
        fechaInscripcion: "01/09/2020",
        pdfColorPalette: "slate",
        posProducts: [
          { id: 'corteCabello', name: 'Corte de Cabello', price: 22000 },
          { id: 'perfiladoCejas', name: 'Perfilado de Cejas', price: 15000 },
          { id: 'recorteBarba', name: 'Recorte de Barba', price: 22000 },
          { id: 'afeitadoTradicional', name: 'Afeitado Tradicional', price: 22000 },
          { id: 'completoDeluxe', name: 'Completo Deluxe', price: 44000 },
          { id: 'cortePerfilado', name: 'Corte + Perfilado', price: 33000 }
        ]
      };
      
      parsed.profiles.push(barberProfile);
      
      // Re-asignar facturas históricas que tengan descripción de barbería
      if (Array.isArray(parsed.invoices)) {
        parsed.invoices = parsed.invoices.map((inv: any) => {
          if (inv.description && inv.description.toLowerCase().includes("barber")) {
            return { ...inv, profileId: "20369106539" };
          }
          return inv;
        });
      }
      
      // Escribir cambios en la DB de inmediato
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    if (!parsed.inflationRates) {
      parsed.inflationRates = [
        { year: 2026, month: 1, rate: 6.0 },
        { year: 2026, month: 2, rate: 5.5 },
        { year: 2026, month: 3, rate: 4.8 },
        { year: 2026, month: 4, rate: 4.2 },
        { year: 2026, month: 5, rate: 3.8 },
        { year: 2026, month: 6, rate: 3.5 },
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
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

// --- MÉTODOS DE PERFILES DE CONTRIBUYENTES --- //

export function getProfiles() {
  return readDb().profiles || [];
}

export function getActiveProfile() {
  const db = readDb();
  const profiles = db.profiles || [];
  const activeId = db.activeProfileId;

  const active = profiles.find((p: any) => p.id === activeId);
  if (active) return active;
  if (profiles.length > 0) return profiles[0];

  // Si no hay perfiles, retornar una plantilla vacía
  return {
    id: '',
    businessName: '',
    afipCuit: '',
    monotributoCategory: 'A',
    puntoVenta: 1,
    afipCrtPath: '',
    afipKeyPath: '',
    afipProduction: true,
    afipToken: '',
    mpToken: '',
    invoiceLogo: '',
    themeColor: '',
    theme: 'cyberpunk',
    posProducts: []
  };
}

export function updateActiveProfile(updates: any) {
  const db = readDb();
  const profiles = db.profiles || [];
  const activeId = db.activeProfileId || (profiles[0] ? profiles[0].id : '');

  let profileIndex = profiles.findIndex((p: any) => p.id === activeId);

  // Si no existe perfiles, crearlo
  if (profileIndex === -1) {
    const newProfile = {
      id: updates.afipCuit || 'default',
      businessName: '',
      afipCuit: '',
      monotributoCategory: 'A',
      puntoVenta: 1,
      afipCrtPath: '',
      afipKeyPath: '',
      afipProduction: true,
      afipToken: '',
      mpToken: '',
      invoiceLogo: '',
      themeColor: '',
      theme: 'cyberpunk',
      posProducts: [],
      ...updates
    };
    profiles.push(newProfile);
    db.activeProfileId = newProfile.id;
  } else {
    // Si cambia el CUIT (id), actualizar la referencia del ID del perfil
    const oldId = profiles[profileIndex].id;
    const nextId = updates.afipCuit !== undefined ? updates.afipCuit : oldId;

    profiles[profileIndex] = {
      ...profiles[profileIndex],
      ...updates,
      id: nextId
    };

    if (db.activeProfileId === oldId) {
      db.activeProfileId = nextId;
    }

    // Migrar facturas del ID viejo al ID nuevo si el CUIT cambió
    if (oldId !== nextId && oldId !== '') {
      db.invoices = db.invoices.map((inv: any) => 
        inv.profileId === oldId ? { ...inv, profileId: nextId } : inv
      );
    }
  }

  db.profiles = profiles;
  writeDb(db);
  return getActiveProfile();
}

export function setActiveProfileId(id: string) {
  const db = readDb();
  const exists = db.profiles.some((p: any) => p.id === id);
  if (exists) {
    db.activeProfileId = id;
    writeDb(db);
    return true;
  }
  return false;
}

export function addProfile(profile: any) {
  const db = readDb();
  const profiles = db.profiles || [];
  const cuit = profile.afipCuit || 'new_profile_' + Date.now();
  
  // Evitar duplicados por CUIT
  if (profiles.some((p: any) => p.id === cuit)) {
    return false;
  }

  const newProfile = {
    id: cuit,
    businessName: profile.businessName || 'Nuevo Negocio',
    afipCuit: profile.afipCuit || '',
    monotributoCategory: profile.monotributoCategory || 'A',
    puntoVenta: parseInt(profile.puntoVenta) || 1,
    afipCrtPath: profile.afipCrtPath || '',
    afipKeyPath: profile.afipKeyPath || '',
    afipProduction: profile.afipProduction !== undefined ? profile.afipProduction : true,
    afipToken: '',
    mpToken: '',
    invoiceLogo: profile.invoiceLogo || '',
    themeColor: profile.themeColor || '',
    theme: profile.theme || 'cyberpunk',
    posProducts: profile.posProducts || []
  };

  profiles.push(newProfile);
  db.profiles = profiles;
  db.activeProfileId = newProfile.id;
  writeDb(db);
  return newProfile;
}

export function deleteProfile(id: string) {
  const db = readDb();
  db.profiles = (db.profiles || []).filter((p: any) => p.id !== id);
  
  // Si eliminamos el activo, alternar al primero disponible
  if (db.activeProfileId === id) {
    db.activeProfileId = db.profiles[0] ? db.profiles[0].id : '';
  }
  writeDb(db);
  return true;
}

// --- MÉTODOS DE FACTURAS SEGREGADOS POR PERFIL --- //

export function addInvoice(invoice: any) {
  const db = readDb();
  const activeProfile = getActiveProfile();
  const profileId = activeProfile.id || 'default';
  
  db.invoices.push({ 
    id: Date.now().toString(), 
    createdAt: new Date().toISOString(), 
    profileId, // Asociar al perfil emisor activo
    ...invoice 
  });
  writeDb(db);
}

export function getInvoices() {
  const db = readDb();
  const activeProfile = getActiveProfile();
  const profileId = activeProfile.id || 'default';
  
  // Retornar solo las facturas del contribuyente activo
  return (db.invoices || []).filter((inv: any) => inv.profileId === profileId);
}

export function getInflationRates() {
  const db = readDb();
  return db.inflationRates || [];
}

export function saveInflationRates(rates: any[]) {
  const db = readDb();
  db.inflationRates = rates;
  writeDb(db);
  return true;
}

export function getClients() {
  const db = readDb();
  return db.clients || [];
}

export function saveClients(clients: any[]) {
  const db = readDb();
  db.clients = clients;
  writeDb(db);
  return true;
}
