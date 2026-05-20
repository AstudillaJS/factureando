import { useState, useEffect } from "react";
import { HelpCircle, Edit3 } from "lucide-react";
import { motion } from "motion/react";

export default function FiscalCluster() {
  const [testing, setTesting] = useState(false);
  const [generating, setGenerating] = useState(false);
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
      setStatus({ msg: data.message, type: 'success' });
    } catch (err) {
      setStatus({ msg: "Error al generar CSR", type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="os-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="os-section-title !mb-0 text-primary uppercase italic">4. CLUSTER FISCAL ARCA (EX AFIP)</h2>
        <button className="text-[10px] text-primary/50 border border-primary/20 px-3 py-1 uppercase tracking-widest hover:bg-primary/10 transition-colors flex items-center gap-2">
          ¿CÓMO CONFIGURAR? <HelpCircle size={14} />
        </button>
      </div>
      
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
            <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase">CONECTADO A: SERVIDOR DE PRODUCCIÓN (Real)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-primary uppercase tracking-widest font-bold">MODO PRODUCCIÓN</span>
            <div className="w-10 h-5 bg-primary rounded-full relative p-1 cursor-pointer">
              <div className="absolute right-1 w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <OSField label="RAZÓN SOCIAL / NOMBRE" value="Astudilla Juan Simon" />
          <OSField label="DOMICILIO COMERCIAL" value="Sara de Eclestton 1099" />
          <OSField label="CUIT DEL EMISOR" value="20357067465" />
          <OSField label="PUNTO DE VENTA HAB." value="0004" />
          <OSField label="FECHA DE INSCRIPCIÓN" value="01/12/2025" />
          <div className="space-y-2">
            <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold">CATEGORÍA ACTUAL (AFIP)</label>
            <select className="os-input font-bold tracking-tight bg-black cursor-pointer appearance-none">
              <option>Categoría A (Hasta $6.450.000,00)</option>
              <option>Categoría B</option>
              <option>Categoría C</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
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
              <input type="text" className="os-input text-[10px] font-mono" value={config.afipCrtPath || ''} readOnly placeholder="Ningún certificado cargado" />
              <label className="text-[10px] border border-primary/30 px-4 flex items-center justify-center uppercase tracking-[0.2em] hover:bg-primary hover:text-black transition-colors cursor-pointer">
                CARGAR
                <input type="file" className="hidden" accept=".crt" onChange={(e) => handleFileUpload('crt', e)} />
              </label>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">UBICACIÓN CLAVE PRIVADA (.KEY)</label>
            <div className="flex gap-2">
              <input type="text" className="os-input text-[10px] font-mono" value={config.afipKeyPath || ''} readOnly placeholder="Ninguna clave cargada" />
              <label className="text-[10px] border border-primary/30 px-4 flex items-center justify-center uppercase tracking-[0.2em] hover:bg-primary hover:text-black transition-colors cursor-pointer">
                CARGAR
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

function OSField({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold">{label}</label>
      <input type="text" className="os-input font-bold tracking-tight" defaultValue={value} />
    </div>
  );
}
