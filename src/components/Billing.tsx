import { motion } from "motion/react";
import { Zap, FileSpreadsheet, Keyboard, Radio, Link2 } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function Billing() {
  const [method, setMethod] = useState<'mp' | 'excel' | 'manual' | null>(null);
  const [manualForm, setManualForm] = useState({ concept: '', amount: '' });
  const [manualErrors, setManualErrors] = useState<{concept?: string, amount?: string}>({});

  const [mpToken, setMpToken] = useState("");
  const [mpStatus, setMpStatus] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [testingMP, setTestingMP] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data && data.mpToken) {
          setMpToken(data.mpToken);
        }
      })
      .catch(console.error);
  }, []);

  const testMPConnection = async () => {
    if (!mpToken) {
      setMpStatus({ msg: "El Access Token es requerido", type: 'error' });
      return;
    }
    setTestingMP(true);
    setMpStatus(null);
    try {
      const res = await fetch("/api/mercadopago/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: mpToken })
      });
      const data = await res.json();
      if (res.ok) {
        setMpStatus({ msg: data.message, type: 'success' });
      } else {
        setMpStatus({ msg: data.message, type: 'error' });
      }
    } catch (err) {
      setMpStatus({ msg: "Error al comunicar con el servidor de pagos", type: 'error' });
    } finally {
      setTestingMP(false);
    }
  };

  const validateManual = () => {
    const errors: typeof manualErrors = {};
    if (!manualForm.concept.trim()) errors.concept = "El concepto es requerido";
    if (!manualForm.amount || Number(manualForm.amount) <= 0) errors.amount = "El monto debe ser mayor a 0";
    setManualErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [draftStatus, setDraftStatus] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const handleGenerateDraft = async () => {
    if (validateManual()) {
      try {
        const payload = {
          amount: Number(manualForm.amount),
          date: new Date().toISOString().split('T')[0],
          type: 'C',
          clientCuit: manualForm.cuit || '0',
          clientName: manualForm.client || 'CONSUMIDOR FINAL',
          description: manualForm.concept,
          method: 'manual',
          status: 'pending'
        };

        const res = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.success) {
          setDraftStatus({ msg: "BORRADOR GUARDADO CON ÉXITO", type: 'success' });
          setManualForm({ concept: '', amount: '', client: '', cuit: '' });
          setManualErrors({});
          setTimeout(() => setDraftStatus(null), 3000);
        } else {
          setDraftStatus({ msg: "ERROR AL GUARDAR BORRADOR", type: 'error' });
        }
      } catch (e) {
        setDraftStatus({ msg: "ERROR AL CONECTAR CON EL SERVIDOR", type: 'error' });
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-5xl mx-auto"
    >
      <header className="mb-12">
        <h1 className="text-4xl font-black text-primary tracking-tighter uppercase italic">MÓDULO DE FACTURACIÓN AUTOMÁTICA</h1>
        <div className="h-1 w-32 bg-primary mt-2"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <BillingMethodCard 
          icon={<Radio className="text-blue-500" />}
          title="MERCADO PAGO"
          description="Sincroniza ventas mediante Webhooks de API."
          active={method === 'mp'}
          onClick={() => setMethod('mp')}
        />
        <BillingMethodCard 
          icon={<FileSpreadsheet className="text-green-500" />}
          title="EXCEL / SHEET"
          description="Importa registros desde tabla estructurada."
          active={method === 'excel'}
          onClick={() => setMethod('excel')}
        />
        <BillingMethodCard 
          icon={<Keyboard className="text-primary" />}
          title="CARGA MANUAL"
          description="Ingreso directo de ítems de facturación."
          active={method === 'manual'}
          onClick={() => setMethod('manual')}
        />
      </div>

      <div className="os-card border-dashed min-h-[400px] flex flex-col items-center justify-center text-center p-12">
        {!method ? (
          <div className="space-y-4">
            <Link2 size={48} className="text-primary/20 mx-auto" />
            <h3 className="text-primary font-black tracking-widest italic uppercase">SELECCIONE MÉTODO DE ENTRADA</h3>
            <p className="text-xs text-gray-600 font-mono italic">EL NÚCLEO ESPERA LA DEFINICIÓN DEL MÓDULO DE DATOS</p>
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 border-b border-primary/20 pb-4">
              <Zap className="text-primary" size={24} />
              <h3 className="text-2xl font-black text-primary tracking-tighter uppercase italic">{method === 'mp' ? 'CONEXIÓN MERCADO PAGO' : method === 'excel' ? 'IMPORTACIÓN EXCEL' : 'TERMINAL MANUAL'}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-6">
                {method === 'mp' && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">ACCESS TOKEN (PROD)</label>
                      <input 
                        type="password" 
                        placeholder="APP_USR-..." 
                        className="os-input font-mono" 
                        value={mpToken}
                        onChange={(e) => setMpToken(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">WEBHOOK ENDPOINT URL</label>
                      <div className="os-input font-mono bg-black/40 flex items-center justify-between group">
                        <span className="truncate opacity-60">https://ais-dev-iuj5yuo7tu2ohzmlhpqnzq-43753993199.us-central1.run.app/api/mercadopago/webhook</span>
                        <button className="text-[8px] text-primary hover:underline ml-2">COPIAR</button>
                      </div>
                      <p className="text-[8px] text-gray-500 mt-2 font-mono uppercase italic tracking-tighter">
                        * Configure esta URL en su panel de Mercado Pago Developers para recibir notificaciones automáticas de pago.
                      </p>
                    </div>
                    {mpStatus && (
                      <div className={`p-4 border text-[10px] font-bold uppercase tracking-widest ${mpStatus.type === 'success' ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-red-500/50 bg-red-500/10 text-red-500'}`}>
                        {mpStatus.msg}
                      </div>
                    )}
                    <button 
                      onClick={testMPConnection}
                      disabled={testingMP}
                      className="os-button w-full py-4 border-blue-500/50 text-blue-500 disabled:opacity-50"
                    >
                      {testingMP ? "PROBANDO ENLACE..." : "PROBAR WEBHOOK / API"}
                    </button>
                  </div>
                )}
                {method === 'excel' && (
                  <>
                    <div className="border-2 border-dashed border-green-900/40 p-8 rounded flex flex-col items-center justify-center gap-4 bg-green-500/5 cursor-pointer hover:bg-green-500/10 transition-colors">
                      <FileSpreadsheet className="text-green-500" size={32} />
                      <span className="text-[10px] font-bold text-green-500">ARRASTRE SU ARCHIVO .XLSX / .CSV AQUÍ</span>
                      <a href="/template_facturacion.csv" download className="text-[10px] font-bold text-green-500 hover:underline underline-offset-4 mt-4 bg-green-500/20 px-4 py-2 rounded uppercase tracking-widest">
                        DESCARGAR PLANTILLA DE FACTURACIÓN
                      </a>
                    </div>
                  </>
                )}
                {method === 'manual' && (
                  <div className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        placeholder="CONCEPTO / SERVICIO" 
                        className={`os-input ${manualErrors.concept ? 'border-red-500' : ''}`}
                        value={manualForm.concept}
                        onChange={e => setManualForm({...manualForm, concept: e.target.value})}
                      />
                      {manualErrors.concept && <span className="text-[9px] text-red-500 font-bold uppercase mt-1 block px-2">{manualErrors.concept}</span>}
                    </div>
                    <div>
                      <input 
                        type="number" 
                        placeholder="MONTO TOTAL" 
                        className={`os-input ${manualErrors.amount ? 'border-red-500' : ''}`}
                        value={manualForm.amount}
                        onChange={e => setManualForm({...manualForm, amount: e.target.value})}
                      />
                      {manualErrors.amount && <span className="text-[9px] text-red-500 font-bold uppercase mt-1 block px-2">{manualErrors.amount}</span>}
                    </div>
                    {draftStatus && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`p-3 border ${draftStatus.type === 'success' ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-red-500/50 bg-red-500/10 text-red-500'} text-[10px] font-bold uppercase tracking-widest mb-4`}
                      >
                        {draftStatus.msg}
                      </motion.div>
                    )}
                    <button onClick={handleGenerateDraft} className="os-button w-full py-4">GENERAR BORRADOR</button>
                  </div>
                )}
              </div>
              <div className="bg-black/50 p-6 border border-primary/10 font-mono text-[10px] text-gray-500 leading-relaxed">
                <div className="flex justify-between border-b border-primary/5 pb-2 mb-4">
                  <span className="text-primary font-bold tracking-widest">ESTADO DEL KERNEL</span>
                  <span className="text-green-500">ESPERANDO PAYLOAD</span>
                </div>
                {`> BOOTING ${method.toUpperCase()} ADAPTER...\n> LOADED CONFIGURATION\n> READY FOR INGESTION`}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BillingMethodCard({ icon, title, description, active, onClick }: { icon: React.ReactNode, title: string, description: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`os-card !p-6 text-left transition-all duration-300 group ${active ? 'border-primary ring-1 ring-primary/20 bg-primary/5 scale-105' : 'hover:border-primary/50'}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-2 rounded bg-black border ${active ? 'border-primary' : 'border-gray-800'}`}>
          {icon}
        </div>
        <h3 className={`font-black tracking-widest text-sm transition-colors ${active ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>{title}</h3>
      </div>
      <p className="text-[10px] text-gray-600 italic font-mono leading-relaxed">{description}</p>
    </button>
  );
}
