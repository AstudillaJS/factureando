import React, { useState, useEffect } from "react";
import { HelpCircle, Edit3, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FiscalCluster() {
  const [testing, setTesting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [status, setStatus] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [config, setConfig] = useState<any>({});

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleFileUpload = async (type: 'crt' | 'key', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Si estamos en Electron, sacamos la ruta absoluta real directamente y la usamos
    const fileAny = file as any;
    if (fileAny.path) {
      const fieldName = type === 'crt' ? 'afipCrtPath' : 'afipKeyPath';
      setConfig((prev: any) => ({ ...prev, [fieldName]: fileAny.path }));
      setStatus({ msg: `RUTA DEL ARCHIVO ${type.toUpperCase()} CARGADA. RECUERDE GUARDAR LA CONFIGURACIÓN FISCAL.`, type: 'success' });
      return;
    }
    
    const formData = new FormData();
    formData.append(type, file);
    
    setStatus({ msg: 'SUBIENDO...', type: 'success' });
    
    try {
      const res = await fetch("/api/afip/upload-cert", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setStatus({ msg: data.message, type: data.success ? 'success' : 'error' });
      fetchConfig();
    } catch (err) {
      setStatus({ msg: "Error al subir archivo", type: 'error' });
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/afip/test", { method: "POST" });
      const data = await res.json();
      setStatus({ msg: data.message, type: data.success ? 'success' : 'error' });
    } catch (err) {
      setStatus({ msg: "Error de conexión con el servidor local", type: 'error' });
    } finally {
      setTesting(false);
    }
  };

  const generateCSR = async () => {
    setGenerating(true);
    setStatus(null);
    try {
      const res = await fetch("/api/afip/generate-csr", { method: "POST" });
      const data = await res.json();
      
      if (data.success && data.csr) {
        // Forzar la descarga del archivo CSR
        const blob = new Blob([data.csr], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pedido_afip.csr';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Recargar configuración para mostrar que la clave privada se guardó
        fetchConfig();
        setStatus({ msg: data.message, type: 'success' });
      } else {
        setStatus({ msg: data.message || "Error al generar CSR", type: 'error' });
      }
    } catch (err) {
      setStatus({ msg: "Error al comunicar con el servidor local", type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const updateField = (key: string, val: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: val }));
  };

  const saveConfig = async () => {
    if (!config.razonSocial?.trim() || !config.domicilioComercial?.trim() || !config.afipCuit?.trim() || !config.puntoVenta?.trim() || !config.fechaInscripcion?.trim()) {
      setStatus({ msg: "TODOS LOS CAMPOS MARCADOS CON * SON OBLIGATORIOS", type: 'error' });
      return;
    }

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ msg: "CONFIGURACIÓN GUARDADA CORRECTAMENTE", type: 'success' });
        fetchConfig();
      } else {
        setStatus({ msg: "ERROR AL GUARDAR CONFIGURACIÓN", type: 'error' });
      }
    } catch (e) {
      setStatus({ msg: "ERROR AL CONECTAR CON EL SERVIDOR", type: 'error' });
    }
  };

  return (
    <div className="os-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="os-section-title !mb-0 text-primary uppercase italic">4. CLUSTER FISCAL ARCA (EX AFIP)</h2>
        <button 
          onClick={() => setShowGuide(true)}
          className="text-[10px] text-primary/50 border border-primary/20 px-3 py-1 uppercase tracking-widest hover:bg-primary/10 transition-colors flex items-center gap-2"
        >
          ¿CÓMO CONFIGURAR? <HelpCircle size={14} />
        </button>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0a] border border-primary/30 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl shadow-primary/20"
            >
              <button 
                onClick={() => setShowGuide(false)}
                className="absolute top-4 right-4 text-primary/50 hover:text-primary transition-colors border border-primary/20 p-2 hover:bg-primary/10"
              >
                <X size={16} />
              </button>

              <h2 className="text-xl font-bold text-primary mb-6 uppercase tracking-widest">GUÍA DE CONFIGURACIÓN ARCA (AFIP)</h2>
              
              <div className="space-y-6 text-sm text-gray-300 font-mono">
                <div>
                  <h3 className="text-white font-bold mb-2 uppercase tracking-wider">PASO 1: GENERAR ARCHIVOS TÉCNICOS</h3>
                  <p className="mb-2">Haz clic en el botón "GENERAR KEY Y PEDIDO (CSR)" en la configuración. El sistema te pedirá una carpeta y creará dos archivos:</p>
                  <ul className="list-disc pl-5 space-y-1 text-primary/80">
                    <li><strong className="text-primary">privada.key</strong>: Tu llave ultra-secreta. No la compartas con nadie.</li>
                    <li><strong className="text-primary">pedido.csr</strong>: Este archivo es el que debes subir a AFIP.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2 uppercase tracking-wider">PASO 2: OBTENER EL CERTIFICADO EN AFIP</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Ingresa a la web de AFIP con tu clave fiscal.</li>
                    <li>Busca el servicio <strong className="text-white">"Administración de Certificados Digitales"</strong>.</li>
                    <li>Sube el archivo pedido.csr que generó la aplicación.</li>
                    <li>AFIP te permitirá descargar un archivo <strong className="text-white">.crt</strong>.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2 uppercase tracking-wider">PASO 3: DAR DE ALTA EL PUNTO DE VENTA</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Entra a <strong className="text-white">"Regcom"</strong> {'>'} <strong className="text-white">"Puntos de venta"</strong>.</li>
                    <li>Crea un nuevo punto de venta.</li>
                    <li><strong className="text-primary">IMPORTANTE:</strong> Selecciona el tipo <strong className="text-white">"Factura Electrónica - Web Services"</strong>.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2 uppercase tracking-wider">PASO 4: VINCULAR SERVICIO (DELEGACIÓN)</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Entra a <strong className="text-white">"Administrador de Relaciones de Clave Fiscal"</strong>.</li>
                    <li>Haz clic en <strong className="text-white">"Nueva Relación"</strong> {'>'} <strong className="text-white">"Buscar"</strong> {'>'} <strong className="text-white">"AFIP"</strong> {'>'} <strong className="text-white">"WebServices"</strong>.</li>
                    <li>Busca y selecciona <strong className="text-white">"Facturación Electrónica"</strong>.</li>
                    <li>En el campo <strong className="text-white">"Representante"</strong>, haz clic en Buscar y selecciona el <strong className="text-white">Alias</strong> que creaste anteriormente (ej: LYNX_PROD). No pongas tu CUIT manualmente, selecciona el alias de la lista.</li>
                    <li>Haz clic en <strong className="text-white">"Confirmar"</strong>.</li>
                  </ol>
                </div>

                <div className="border border-orange-500/50 bg-orange-500/10 p-4 mt-8">
                  <h3 className="text-orange-500 font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={16} /> PARA MODO HOMOLOGACIÓN (PRUEBAS)
                  </h3>
                  <p className="mb-4 text-orange-200">Si estás usando el botón "Modo Producción" apagado, AFIP requiere que también habilites el certificado en su servidor de pruebas:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-orange-200">
                    <li>Busca el servicio <strong className="text-white">"WSASS"</strong> - Autogestión de Certificados de Homologación.</li>
                    <li>Sube allí el archivo .csr o selecciona el Alias que ya diste de alta.</li>
                    <li>Luego entra a <strong className="text-white">"Autorizar CUIT a acceder a Web-Services de Homologación"</strong>.</li>
                    <li>Vincula tu CUIT con el servicio <strong className="text-white">wsfe</strong> y el certificado de pruebas.</li>
                  </ol>
                  <p className="mt-4 text-orange-200">Una vez completado, carga el .crt y el .key en la sección de configuración de LYNX y haz la prueba de comunicación.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-6">
        {status && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`p-3 border ${status.type === 'success' ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-red-500/50 bg-red-500/10 text-red-500'} text-[10px] font-bold uppercase tracking-widest flex justify-between items-center`}
          >
            <span>{status.msg}</span>
            <button onClick={() => setStatus(null)} className="opacity-50 hover:opacity-100">X</button>
          </motion.div>
        )}

        <div className="bg-black/40 border border-primary/20 p-4 rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-primary underline underline-offset-4 uppercase tracking-widest font-bold block mb-1">ENTORNO DIGITAL AFIP</span>
            <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase">
              CONECTADO A: {config.afipProduction ? 'SERVIDOR DE PRODUCCIÓN (Real)' : 'SERVIDOR DE HOMOLOGACIÓN (Pruebas)'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-primary uppercase tracking-widest font-bold">MODO PRODUCCIÓN</span>
            <div 
              className={`w-10 h-5 rounded-full relative p-1 cursor-pointer transition-colors ${config.afipProduction ? 'bg-primary' : 'bg-gray-600'}`}
              onClick={async () => {
                const newVal = !config.afipProduction;
                updateField('afipProduction', newVal);
                try {
                  const res = await fetch("/api/config", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...config, afipProduction: newVal })
                  });
                  const data = await res.json();
                  if (data.success) {
                    fetchConfig();
                  }
                } catch (e) {
                  console.error("Error auto-saving afipProduction toggle", e);
                }
              }}
            >
              <div className={`absolute w-3 h-3 bg-white rounded-full transition-all ${config.afipProduction ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <OSField 
            label="RAZÓN SOCIAL / NOMBRE" 
            value={config.razonSocial || ''} 
            onChange={(val) => updateField('razonSocial', val)}
            placeholder="Ej: ASTUDILLA JUAN SIMON"
            required
          />
          <OSField 
            label="DOMICILIO COMERCIAL" 
            value={config.domicilioComercial || ''} 
            onChange={(val) => updateField('domicilioComercial', val)}
            placeholder="Ej: SARA DE ECLESTTON 1099"
            required
          />
          <OSField 
            label="CUIT DEL EMISOR" 
            value={config.afipCuit || ''} 
            onChange={(val) => updateField('afipCuit', val)}
            placeholder="Ej: 20357067465"
            required
          />
          <OSField 
            label="PUNTO DE VENTA HAB." 
            value={config.puntoVenta || ''} 
            onChange={(val) => updateField('puntoVenta', val)}
            placeholder="Ej: 0004"
            required
          />
          <OSField 
            label="FECHA DE INSCRIPCIÓN" 
            value={config.fechaInscripcion || ''} 
            onChange={(val) => updateField('fechaInscripcion', val)}
            placeholder="Ej: 01/12/2025"
            required
          />
          <div className="space-y-2">
            <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold">
              CATEGORÍA ACTUAL (AFIP) <span className="text-red-500">*</span>
            </label>
            <select 
              value={config.categoriaMonotributo || 'Categoría A (Hasta $6.450.000,00)'}
              onChange={(e) => updateField('categoriaMonotributo', e.target.value)}
              className="os-input font-bold tracking-tight bg-black cursor-pointer appearance-none"
            >
              <option value="Categoría A (Hasta $6.450.000,00)">Categoría A (Hasta $6.450.000,00)</option>
              <option value="Categoría B">Categoría B</option>
              <option value="Categoría C">Categoría C</option>
            </select>
          </div>
          <div className="col-span-2">
            <OSField 
              label="TOKEN DE ACCESO AFIP SDK (OBTENIDO DE AFIPSDK.COM)" 
              value={config.afipToken || ''} 
              onChange={(val) => updateField('afipToken', val)}
              placeholder="Ej: pegá tu access_token de afipsdk.com"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button 
            onClick={saveConfig}
            className="text-[10px] border border-primary bg-primary/10 px-6 py-2 uppercase tracking-[0.2em] font-bold text-primary hover:bg-primary hover:text-black transition-colors"
          >
            GUARDAR CONFIGURACIÓN FISCAL
          </button>
          
          <button className="text-[10px] text-primary uppercase tracking-widest border-b border-dashed border-primary pb-0.5 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Edit3 size={14} /> CONFIGURAR LÍMITES DE CATEGORÍAS
          </button>
        </div>

        <p className="text-[10px] text-gray-500 italic mt-4">
          Usado para anualizar tus ingresos en caso de que lleves menos de 12 meses inscripto.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">UBICACIÓN DEL CERTIFICADO (.CRT)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="os-input text-[10px] font-mono" 
                value={config.afipCrtPath || ''} 
                onChange={(e) => updateField('afipCrtPath', e.target.value)}
                placeholder="Ruta absoluta del archivo .crt" 
              />
              <label className="text-[10px] border border-primary/30 px-4 flex items-center justify-center uppercase tracking-[0.2em] hover:bg-primary hover:text-black transition-colors cursor-pointer">
                SUBIR
                <input type="file" className="hidden" accept=".crt" onChange={(e) => handleFileUpload('crt', e)} />
              </label>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">UBICACIÓN CLAVE PRIVADA (.KEY)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="os-input text-[10px] font-mono" 
                value={config.afipKeyPath || ''} 
                onChange={(e) => updateField('afipKeyPath', e.target.value)}
                placeholder="Ruta absoluta del archivo .key" 
              />
              <label className="text-[10px] border border-primary/30 px-4 flex items-center justify-center uppercase tracking-[0.2em] hover:bg-primary hover:text-black transition-colors cursor-pointer">
                SUBIR
                <input type="file" className="hidden" accept=".key" onChange={(e) => handleFileUpload('key', e)} />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={testConnection}
            disabled={testing}
            className="w-full py-4 border border-primary text-xs font-bold tracking-[0.4em] uppercase hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            {testing ? "PROBANDO..." : "PROBAR COMUNICACIÓN"}
          </button>
          <button 
            onClick={generateCSR}
            disabled={generating}
            className="w-full py-4 border border-primary text-xs font-bold tracking-[0.4em] uppercase hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            {generating ? "GENERANDO..." : "GENERAR KEY Y PEDIDO (CSR)"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OSField({ label, value, onChange, placeholder, required }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string, required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type="text" 
        className={`os-input font-bold tracking-tight ${required && !value ? 'border-red-500/30' : ''}`} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
