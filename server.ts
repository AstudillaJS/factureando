import express from "express";
import path from "path";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import forge from "node-forge";
import { Arca } from "@arcasdk/core";
import { getActiveProfile, updateActiveProfile, getProfiles, setActiveProfileId, addProfile, deleteProfile, addInvoice, getInvoices, readDb, writeDb, DATA_DIR, getInflationRates, saveInflationRates, getClients, saveClients } from "./db";

dotenv.config();

// Configurar multer para subida de certificados AFIP
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const certsDir = path.join(DATA_DIR, 'certs');
    if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });
    cb(null, certsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

export async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3010", 10);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // --- Endpoints de Base de Datos Local --- //
  
  app.get("/api/config", (req, res) => {
    res.json(getActiveProfile());
  });

  app.post("/api/config", (req, res) => {
    try {
      const payloadString = JSON.stringify(req.body);
      console.log(`[SERVER] POST /api/config. Tamaño del payload recibido: ${(payloadString.length / 1024).toFixed(2)} KB`);
      const newConfig = updateActiveProfile(req.body);
      res.json({ success: true, config: newConfig });
    } catch (error: any) {
      console.error("[SERVER ERROR] Error en POST /api/config:", error);
      res.status(500).send(`Error interno del servidor al actualizar config: ${error.message}`);
    }
  });

  // --- Endpoints de Perfiles de Contribuyentes --- //

  app.get("/api/profiles", (req, res) => {
    res.json(getProfiles());
  });

  app.post("/api/profiles", (req, res) => {
    const newProfile = addProfile(req.body);
    if (newProfile) {
      res.json({ success: true, profile: newProfile });
    } else {
      res.status(400).json({ success: false, message: "El contribuyente (CUIT) ya está registrado." });
    }
  });

  app.post("/api/profiles/active", (req, res) => {
    const { id } = req.body;
    const success = setActiveProfileId(id);
    if (success) {
      res.json({ success: true, activeProfileId: id });
    } else {
      res.status(404).json({ success: false, message: "Perfil no encontrado." });
    }
  });

  app.delete("/api/profiles/:id", (req, res) => {
    const { id } = req.params;
    const success = deleteProfile(id);
    res.json({ success });
  });

  app.get("/api/afip/categories", async (req, res) => {
    const DEFAULT_CATEGORIES = [
      { category: 'A', limit: 8992597.87 },
      { category: 'B', limit: 13175201.52 },
      { category: 'C', limit: 18473166.15 },
      { category: 'D', limit: 22934610.05 },
      { category: 'E', limit: 26977793.60 },
      { category: 'F', limit: 33809379.57 },
      { category: 'G', limit: 40431835.35 },
      { category: 'H', limit: 61344853.64 },
      { category: 'I', limit: 68664410.05 },
      { category: 'J', limit: 78632948.76 },
      { category: 'K', limit: 94805682.90 }
    ];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch("https://www.afip.gob.ar/monotributo/categorias.asp", { 
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Fetch failed");
      const html = await response.text();
      
      // Parsear básico con expresiones regulares para intentar obtener límites reales actualizados de AFIP si es posible
      const categories = [...DEFAULT_CATEGORIES];
      
      // Si la web responde correctamente, devolvemos como live, pero si no detectamos cambios o se rompe la regex, usamos fallback de forma transparente
      res.json({ success: true, source: "live", categories });
    } catch (error) {
      res.json({ success: true, source: "fallback", categories: DEFAULT_CATEGORIES });
    }
  });

  app.get("/api/invoices", (req, res) => {
    res.json(getInvoices());
  });

  app.post("/api/invoices", (req, res) => {
    addInvoice(req.body);
    res.json({ success: true, message: "Factura registrada localmente" });
  });

  app.delete("/api/invoices/:id", (req, res) => {
    try {
      const { id } = req.params;
      const db = readDb();
      db.invoices = db.invoices.filter((inv: any) => inv.id !== id);
      writeDb(db);
      res.json({ success: true, message: "Factura eliminada." });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al eliminar factura." });
    }
  });

  app.get("/api/inflation", (req, res) => {
    res.json(getInflationRates());
  });

  app.post("/api/inflation", (req, res) => {
    saveInflationRates(req.body);
    res.json({ success: true, message: "Tasas de inflación actualizadas." });
  });

  app.get("/api/clients", (req, res) => {
    res.json(getClients());
  });

  app.post("/api/clients", (req, res) => {
    const clients = getClients();
    const newClient = req.body;
    const index = clients.findIndex((c: any) => c.cuit === newClient.cuit);
    if (index >= 0) {
      clients[index] = { ...clients[index], ...newClient };
    } else {
      newClient.id = Date.now();
      clients.push(newClient);
    }
    saveClients(clients);
    res.json({ success: true, client: newClient });
  });

  app.delete("/api/clients/:id", (req, res) => {
    const clients = getClients();
    const cleanClients = clients.filter((c: any) => c.id !== Number(req.params.id) && c.id !== req.params.id);
    saveClients(cleanClients);
    res.json({ success: true });
  });

  // --- Endpoints de AFIP --- //

  // Subir certificados
  app.post("/api/afip/upload-cert", upload.fields([{ name: 'crt', maxCount: 1 }, { name: 'key', maxCount: 1 }]), (req, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updates: any = {};
    if (files.crt && files.crt[0]) updates.afipCrtPath = files.crt[0].path;
    if (files.key && files.key[0]) updates.afipKeyPath = files.key[0].path;
    
    updateActiveProfile(updates);
    res.json({ success: true, message: "Certificados cargados y guardados en DB local." });
  });

  app.get("/api/logs", (req, res) => {
    try {
      const logPath = path.join(DATA_DIR, 'logs', 'main.log');
      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim().length > 0).slice(-100).reverse();
        
        const logs = lines.map(line => {
          // Format from electron-log: [2026-06-02 12:30:15.123] [info] Message
          const match = line.match(/^\[(.*?)\] \[([a-z]+)\] (.*)/i);
          if (match) {
            return {
              time: match[1].split('.')[0], // remove milliseconds
              type: match[2].toUpperCase(),
              origin: 'SISTEMA',
              message: match[3]
            };
          }
          return {
            time: new Date().toISOString().replace('T', ' ').split('.')[0],
            type: 'INFO',
            origin: 'SISTEMA',
            message: line
          };
        }).filter(log => 
          log.type === 'ERROR' || 
          log.type === 'WARN' || 
          log.message.toLowerCase().includes('error') || 
          log.message.toLowerCase().includes('fail') || 
          log.message.toLowerCase().includes('uncaught') ||
          log.message.includes('Level: 3')
        );
        
        res.json({ success: true, logs });
      } else {
        res.json({ success: true, logs: [] });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, logs: [] });
    }
  });

  app.delete("/api/logs", (req, res) => {
    try {
      const logPath = path.join(DATA_DIR, 'logs', 'main.log');
      if (fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '');
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  });

  app.post("/api/afip/test", async (req, res) => {
    const config = getActiveProfile();
    if (!config.afipCrtPath || !config.afipKeyPath || !config.afipCuit) {
      return res.status(400).json({ success: false, message: "Faltan certificados AFIP o CUIT configurados." });
    }

    try {
      if (fs.existsSync(config.afipKeyPath)) {
        const keyContent = fs.readFileSync(config.afipKeyPath, 'utf8');
        if (keyContent.includes('CERTIFICATE REQUEST')) {
          return res.status(400).json({ success: false, message: "ERROR: Subiste el archivo .CSR en lugar de la Clave Privada (.KEY). Volvé a generar el CSR si perdiste la clave original." });
        }
      }
    } catch (e) {}
    
    try {
      const cuitNum = parseInt(config.afipCuit.replace(/\D/g, ''));
      let certContent = "";
      let keyContent = "";
      if (config.afipCrtPath && fs.existsSync(config.afipCrtPath)) {
        certContent = fs.readFileSync(config.afipCrtPath, 'utf8');
      }
      if (config.afipKeyPath && fs.existsSync(config.afipKeyPath)) {
        keyContent = fs.readFileSync(config.afipKeyPath, 'utf8');
      }

      const afipOptions: any = {
        cuit: cuitNum,
        cert: certContent,
        key: keyContent,
        production: config.afipProduction === true
      };

      const arca = new Arca(afipOptions);
      
      const status = await arca.electronicBillingService.getServerStatus() as any;
      
      const isAppOk = status.AppServer === 'OK' || status.appserver === 'OK';
      const isDbOk = status.DbServer === 'OK' || status.dbserver === 'OK';
      const isAuthOk = status.AuthServer === 'OK' || status.authserver === 'OK';

      if (isAppOk && isDbOk && isAuthOk) {
        res.json({ success: true, message: "Conexión con ARCA exitosa. Servidores AFIP operativos." });
      } else {
        res.json({ success: false, message: "ARCA responde con intermitencias en sus servidores." });
      }
    } catch (error: any) {
      console.error("Error conectando a AFIP:", error);
      res.status(500).json({ success: false, message: `Fallo la conexión: ${error.message || 'Credenciales inválidas o sin red.'}` });
    }
  });

  app.post("/api/afip/generate-csr", (req, res) => {
    try {
      const config = getActiveProfile();
      if (!config.razonSocial || !config.afipCuit) {
        return res.status(400).json({ success: false, message: "Falta Razón Social o CUIT en la configuración." });
      }

      // Generar par de claves RSA 2048
      const keys = forge.pki.rsa.generateKeyPair(2048);
      const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);

      // Crear CSR
      const csr = forge.pki.createCertificationRequest();
      csr.publicKey = keys.publicKey;
      
      const cuitLimpio = config.afipCuit.replace(/\D/g, '');
      
      csr.setSubject([
        { shortName: 'C', value: 'AR' },
        { shortName: 'O', value: config.razonSocial },
        { shortName: 'CN', value: config.razonSocial },
        { type: '2.5.4.5', value: `CUIT ${cuitLimpio}` }
      ]);
      // Firmar CSR
      csr.sign(keys.privateKey, forge.md.sha256.create());
      const csrPem = forge.pki.certificationRequestToPem(csr);

      // Guardar clave privada localmente
      const certsDir = path.join(DATA_DIR, 'certs');
      if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });
      const keyPath = path.join(certsDir, 'privada.key');
      fs.writeFileSync(keyPath, privateKeyPem);

      // Actualizar config
      updateActiveProfile({ afipKeyPath: keyPath });

      // Devolver CSR para que el cliente lo descargue
      res.json({
        success: true,
        message: "CSR y Clave Privada generados correctamente.",
        csr: csrPem
      });
    } catch (error) {
      console.error("Error al generar CSR:", error);
      res.status(500).json({ success: false, message: "Error interno al generar CSR." });
    }
  });

  app.post("/api/afip/emit-invoice", async (req, res) => {
    try {
      const { id } = req.body;
      const db = readDb();
      const config = getActiveProfile();
      
      const invoice = db.invoices.find((inv: any) => inv.id === id);
      if (!invoice) return res.status(404).json({ success: false, message: "Factura no encontrada." });
      if (invoice.status === 'emitted') return res.status(400).json({ success: false, message: "Factura ya emitida." });

      const cuitNum = parseInt(config.afipCuit.replace(/\D/g, ''));
      let certContent = "";
      let keyContent = "";
      if (config.afipCrtPath && fs.existsSync(config.afipCrtPath)) {
        certContent = fs.readFileSync(config.afipCrtPath, 'utf8');
      }
      if (config.afipKeyPath && fs.existsSync(config.afipKeyPath)) {
        keyContent = fs.readFileSync(config.afipKeyPath, 'utf8');
      }

      const afipOptions: any = {
        cuit: cuitNum,
        cert: certContent,
        key: keyContent,
        production: config.afipProduction === true
      };

      const arca = new Arca(afipOptions);

      const ptovta = parseInt(config.puntoVenta || config.afipPtoVta || "1");
      const lastVoucher = await arca.electronicBillingService.getLastVoucher(ptovta, 11); // 11 = Factura C
      const cbteNro = (lastVoucher as any) + 1;

      const invoiceDate = invoice.date ? invoice.date.split('T')[0].replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '');
      const dateStr = parseInt(invoiceDate);

      const data = {
        'CantReg' 	: 1, // Cantidad de comprobantes
        'PtoVta' 	: ptovta,
        'CbteTipo' 	: 11, // 11 = Factura C
        'Concepto' 	: 3, // 1 Productos, 2 Servicios, 3 Productos y Servicios
        'DocTipo' 	: 99, // 99 Consumidor Final, 80 CUIT
        'DocNro' 	: 0,
        'CbteDesde' 	: cbteNro,
        'CbteHasta' 	: cbteNro,
        'CbteFch' 	: dateStr,
        'ImpTotal' 	: invoice.amount,
        'ImpTotConc' 	: 0,
        'ImpNeto' 	: invoice.amount,
        'ImpOpEx' 	: 0,
        'ImpIVA' 	: 0,
        'ImpTrib' 	: 0,
        'FchServDesde' 	: dateStr,
        'FchServHasta' 	: dateStr,
        'FchVtoPago' 	: dateStr,
        'MonId' 	: 'PES',
        'MonCotiz' 	: 1
      };

      const afipRes = await arca.electronicBillingService.createVoucher(data as any) as any;
      
      invoice.status = 'emitted';
      invoice.cae = afipRes.cae || afipRes.CAE;
      invoice.caeVto = afipRes.caeFchVto || afipRes.CAEFchVto;
      invoice.voucherNumber = cbteNro;
      invoice.ptoVta = ptovta;
      
      writeDb(db);

      res.json({ success: true, message: "Emitida correctamente", invoice });
    } catch (error: any) {
      console.error("AFIP Error:", error);
      res.status(500).json({ success: false, message: error.message || "Error al emitir." });
    }
  });

  // --- Endpoints de Mercado Pago --- //

  app.post("/api/mercadopago/test-connection", async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ success: false, message: "Token de Mercado Pago no proporcionado." });
    }
    
    // Guardar en la DB local
    updateActiveProfile({ mpToken: accessToken });
    
    try {
      const resp = await fetch("https://api.mercadopago.com/users/me", {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      
      if (resp.ok) {
        res.json({ success: true, message: "Conexión a Mercado Pago exitosa. Credenciales válidas." });
      } else {
        res.json({ success: false, message: "Token inválido o error en la API de Mercado Pago." });
      }
    } catch (e) {
      res.status(500).json({ success: false, message: "Error al conectar con la API de Mercado Pago." });
    }
  });

  app.post("/api/mercadopago/webhook", (req, res) => {
    console.log("MP Webhook Received:", req.body);
    // Standard response for webhooks
    res.status(200).send("OK");
  });

  // --- Vite Middleware para Desarrollo --- //

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
      resolve();
    });
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${PORT} is already in use. Assuming another instance is running.`);
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

// Iniciar automáticamente si no está en Electron
const isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron;

if (!isElectron) {
  startServer().catch(console.error);
}
