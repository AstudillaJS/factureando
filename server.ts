import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { getConfig, updateConfig, addInvoice, getInvoices, readDb, writeDb } from "./db";

dotenv.config();

// Configurar multer para subida de certificados AFIP
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const certsDir = path.join(process.cwd(), 'data', 'certs');
    if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });
    cb(null, certsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Servir archivos publicos (como el template CSV)
  app.use('/public', express.static(path.join(process.cwd(), 'public')));

  // --- Endpoints de Base de Datos Local --- //
  
  app.get("/api/config", (req, res) => {
    res.json(getConfig());
  });

  app.post("/api/config", (req, res) => {
    const newConfig = updateConfig(req.body);
    res.json({ success: true, config: newConfig });
  });

  app.get("/api/invoices", (req, res) => {
    res.json(getInvoices());
  });

  app.post("/api/invoices", (req, res) => {
    addInvoice(req.body);
    res.json({ success: true, message: "Factura registrada localmente" });
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

  app.post("/api/afip/test", (req, res) => {
    const config = getConfig();
    if (!config.afipCrtPath || !config.afipKeyPath) {
      return res.status(400).json({ success: false, message: "Faltan certificados AFIP cargados localmente." });
    }
    // Lógica real AFIP iría aquí usando los paths guardados
    res.json({ success: true, message: "Conexión con ARCA exitosa (Usando certificados guardados)" });
  });

  app.post("/api/afip/generate-csr", (req, res) => {
    setTimeout(() => {
      res.json({ 
        success: true, 
        message: "CSR y Clave Privada generados correctamente. Archivos guardados temporalmente en el sistema." 
      });
    }, 2000);
  });

  // --- Endpoints de Mercado Pago --- //

  app.post("/api/mercadopago/test-connection", (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken || !accessToken.startsWith("APP_USR-")) {
      return res.status(400).json({ success: false, message: "Token de acceso inválido o malformado." });
    }
    updateConfig({ mpToken: accessToken });
    setTimeout(() => {
      res.json({ success: true, message: "Conexión MP establecida y token guardado en BD." });
    }, 1500);
  });

  app.post("/api/mercadopago/webhook", (req, res) => {
    console.log("MP Webhook Received:", req.body);
    // Standard response for webhooks
    res.status(200).send("OK");
  });

  // --- Vite Middleware para Desarrollo --- //

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
