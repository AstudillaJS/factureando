import express from "express";
import path from "path";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import forge from "node-forge";
import Afip from "@afipsdk/afip.js";
import { getConfig, updateConfig, addInvoice, getInvoices, readDb, writeDb, DATA_DIR } from "./db";

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
  const PORT = 3010;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // --- Endpoints de Base de Datos Local --- //
  
  app.get("/api/config", (req, res) => {
    res.json(getConfig());
  });

  app.post("/api/config", (req, res) => {
    try {
      const payloadString = JSON.stringify(req.body);
      console.log(`[SERVER] POST /api/config. Tamaño del payload recibido: ${(payloadString.length / 1024).toFixed(2)} KB`);
      const newConfig = updateConfig(req.body);
      res.json({ success: true, config: newConfig });
    } catch (error: any) {
      console.error("[SERVER ERROR] Error en POST /api/config:", error);
      res.status(500).send(`Error interno del servidor al actualizar config: ${error.message}`);
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

  // --- Endpoints de AFIP --- //

  // Subir certificados
  app.post("/api/afip/upload-cert", upload.fields([{ name: 'crt', maxCount: 1 }, { name: 'key', maxCount: 1 }]), (req, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updates: any = {};
    if (files.crt && files.crt[0]) updates.afipCrtPath = files.crt[0].path;
    if (files.key && files.key[0]) updates.afipKeyPath = files.key[0].path;
    
    updateConfig(updates);
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
    const config = getConfig();
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
        CUIT: cuitNum,
        cert: certContent,
        key: keyContent,
        production: config.afipProduction === true
      };

      if (config.afipToken) {
        afipOptions.access_token = config.afipToken;
      }

      const afip = new Afip(afipOptions);
      
      const status = await afip.ElectronicBilling.getServerStatus();
      
      if (status.AppServer === 'OK' && status.DbServer === 'OK' && status.AuthServer === 'OK') {
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
      const config = getConfig();
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
      updateConfig({ afipKeyPath: keyPath });

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
      const config = getConfig();
      
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
        CUIT: cuitNum,
        cert: certContent,
        key: keyContent,
        production: config.afipProduction === true
      };

      if (config.afipToken) {
        afipOptions.access_token = config.afipToken;
      }

      const afip = new Afip(afipOptions);

      const ptovta = parseInt(config.puntoVenta || config.afipPtoVta || "1");
      const lastVoucher = await afip.ElectronicBilling.getLastVoucher(ptovta, 11); // 11 = Factura C
      const cbteNro = lastVoucher + 1;

      const dateStr = parseInt(new Date().toISOString().split('T')[0].replace(/-/g, ''));

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

      const afipRes = await afip.ElectronicBilling.createVoucher(data);
      
      invoice.status = 'emitted';
      invoice.cae = afipRes.CAE;
      invoice.caeVto = afipRes.CAEFchVto;
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
    updateConfig({ mpToken: accessToken });
    
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
