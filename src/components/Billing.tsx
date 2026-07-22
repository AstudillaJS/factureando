import { motion } from "motion/react";
import { Zap, FileSpreadsheet, Keyboard, Radio, Link2 } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function Billing() {
  const [method, setMethod] = useState<'mp' | 'excel' | 'manual' | null>(null);
  const [manualForm, setManualForm] = useState({ 
    concept: '', 
    amount: '', 
    date: new Date().toISOString().split('T')[0],
    client: '',
    cuit: ''
  });
  const [manualErrors, setManualErrors] = useState<{concept?: string, amount?: string}>({});

  const [mpToken, setMpToken] = useState("");
  const [mpStatus, setMpStatus] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [testingMP, setTestingMP] = useState(false);

  // Nuevos estados para inflación, cuentas y repetición
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [inflationRates, setInflationRates] = useState<any[]>([]);
  const [suggestedIncrease, setSuggestedIncrease] = useState<any | null>(null);

  const fetchBillingData = async () => {
    try {
      const resConfig = await fetch("/api/config");
      const dataConfig = await resConfig.json();
      if (dataConfig && dataConfig.mpToken) setMpToken(dataConfig.mpToken);

      const resClients = await fetch("/api/clients");
      const dataClients = await resClients.json();
      if (Array.isArray(dataClients)) setClients(dataClients);

      const resInvoices = await fetch("/api/invoices");
      const dataInvoices = await resInvoices.json();
      if (Array.isArray(dataInvoices)) setInvoices(dataInvoices);

      const resInflation = await fetch("/api/inflation");
      const dataInflation = await resInflation.json();
      if (Array.isArray(dataInflation)) setInflationRates(dataInflation);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  useEffect(() => {
    if (!manualForm.cuit || !manualForm.amount || Number(manualForm.amount) <= 0) {
      setSuggestedIncrease(null);
      return;
    }

    const amt = Number(manualForm.amount);
    const previousInvoices = invoices.filter(
      (inv: any) => inv.clientCuit === manualForm.cuit && Math.abs(inv.amount - amt) < 10
    );

    if (previousInvoices.length > 0) {
      const sorted = [...previousInvoices].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastInvoice = sorted[0];

      const lastDate = new Date(lastInvoice.date);
      const currentDate = new Date(manualForm.date);
      const monthsDiff = (currentDate.getFullYear() - lastDate.getFullYear()) * 12 + (currentDate.getMonth() - lastDate.getMonth());

      if (monthsDiff > 0) {
        let accumulatedInflation = 0;
        for (let i = 0; i < monthsDiff; i++) {
          const checkMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + i + 1, 1);
          const rateObj = inflationRates.find(
            (r: any) => r.year === checkMonth.getFullYear() && r.month === (checkMonth.getMonth() + 1)
          );
          accumulatedInflation += rateObj ? rateObj.rate : 4.0;
        }

        if (accumulatedInflation > 0) {
          const suggestedAmount = amt * (1 + accumulatedInflation / 100);
          setSuggestedIncrease({
            lastDate: lastInvoice.date,
            rate: accumulatedInflation.toFixed(1),
            suggested: Math.round(suggestedAmount)
          });
          return;
        }
      }
    }
    setSuggestedIncrease(null);
  }, [manualForm.amount, manualForm.cuit, manualForm.date, invoices, inflationRates]);

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
          date: manualForm.date || new Date().toISOString().split('T')[0],
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
          setManualForm({ 
            concept: '', 
            amount: '', 
            client: '', 
            cuit: '', 
            date: new Date().toISOString().split('T')[0] 
          });
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
                      <label className="text-[8px] text-primary/60 uppercase font-mono block mb-1 px-1">Seleccionar Cliente Registrado</label>
                      <select 
                        className="os-input font-bold tracking-tight bg-black cursor-pointer text-xs"
                        onChange={(e) => {
                          const c = clients.find(cl => cl.cuit === e.target.value);
                          if (c) {
                            setManualForm(prev => ({ ...prev, client: c.name, cuit: c.cuit }));
                          } else {
                            setManualForm(prev => ({ ...prev, client: '', cuit: '' }));
                          }
                        }}
                        value={manualForm.cuit}
                      >
                        <option value="">-- SELECCIONAR CLIENTE (OPCIONAL) --</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.cuit}>{c.name} (CUIT: {c.cuit})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input 
                          type="text" 
                          placeholder="CUIT DESTINATARIO" 
                          className="os-input font-mono"
                          value={manualForm.cuit}
                          onChange={e => setManualForm({...manualForm, cuit: e.target.value.replace(/[^0-9]/g, '')})}
                        />
                      </div>
                      <div>
                        <input 
                          type="text" 
                          placeholder="NOMBRE / RAZÓN SOCIAL" 
                          className="os-input"
                          value={manualForm.client}
                          onChange={e => setManualForm({...manualForm, client: e.target.value.toUpperCase()})}
                        />
                      </div>
                    </div>

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

                    {suggestedIncrease && (
                      <div className="p-3 border border-amber-500/30 bg-amber-500/5 text-amber-500 rounded-xl space-y-1 text-[10px] font-mono leading-relaxed">
                        <span className="font-bold uppercase block text-primary">⚠️ ALERTA DE AJUSTE POR INFLACIÓN</span>
                        <span>Mismo importe facturado el {suggestedIncrease.lastDate}.</span>
                        <span className="block text-white">Inflación acumulada: <span className="text-amber-500 font-bold">+{suggestedIncrease.rate}%</span></span>
                        <span className="block mt-1 font-bold text-white">Importe sugerido: <span className="text-primary font-black">${suggestedIncrease.suggested.toLocaleString('es-AR')}</span></span>
                        <button 
                          type="button"
                          onClick={() => setManualForm(prev => ({ ...prev, amount: suggestedIncrease.suggested.toString() }))}
                          className="mt-2 text-[9px] uppercase bg-primary text-black font-black px-3 py-1 rounded hover:opacity-90 transition-opacity cursor-pointer block"
                        >
                          Aplicar Ajuste Sugerido
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="text-[8px] text-primary/60 uppercase font-mono block mb-1 px-1">Fecha de Emisión de Factura</label>
                      <input 
                        type="date" 
                        className="os-input font-mono text-xs"
                        value={manualForm.date}
                        onChange={e => setManualForm({...manualForm, date: e.target.value})}
                      />
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
                    <button onClick={handleGenerateDraft} className="os-button w-full py-4 cursor-pointer">GENERAR BORRADOR</button>
                  </div>
                )}
              </div>
              
              {method === 'manual' ? (
                <div className="bg-black/50 p-6 border border-primary/10 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between border-b border-primary/5 pb-2 mb-4 font-mono text-[10px]">
                      <span className="text-primary font-bold tracking-widest uppercase italic">HISTORIAL PARA REPETIR</span>
                      <span className="text-gray-500">ÚLTIMAS EMITIDAS</span>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {invoices.slice(0, 5).map((inv: any) => (
                        <div key={inv.id} className="p-2.5 border border-white/5 bg-white/5 rounded-xl flex items-center justify-between font-mono text-[9px] leading-relaxed">
                          <div className="min-w-0 flex-1 mr-2">
                            <span className="font-bold text-white block uppercase truncate">{inv.description || 'Sin concepto'}</span>
                            <span className="text-gray-500 block mt-0.5">${inv.amount?.toLocaleString('es-AR')} | {inv.clientName}</span>
                          </div>
                          <button
                            onClick={() => setManualForm({
                              concept: inv.description || '',
                              amount: (inv.amount || '').toString(),
                              client: inv.clientName || '',
                              cuit: inv.clientCuit || '',
                              date: new Date().toISOString().split('T')[0]
                            })}
                            className="text-[9px] font-bold border border-primary/30 text-primary hover:bg-primary hover:text-black transition-all px-2.5 py-1 uppercase rounded-lg cursor-pointer"
                          >
                            REPETIR
                          </button>
                        </div>
                      ))}
                      {invoices.length === 0 && (
                        <p className="text-[10px] text-gray-600 italic text-center py-12">No hay facturas previas registradas</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 text-[9px] text-gray-500 font-mono">
                    {`> KERNEL_STATE: STABLE\n> SYSTEM_ADAPTER: READY`}
                  </div>
                </div>
              ) : (
                <div className="bg-black/50 p-6 border border-primary/10 font-mono text-[10px] text-gray-500 leading-relaxed rounded-xl">
                  <div className="flex justify-between border-b border-primary/5 pb-2 mb-4">
                    <span className="text-primary font-bold tracking-widest">ESTADO DEL KERNEL</span>
                    <span className="text-green-500">ESPERANDO PAYLOAD</span>
                  </div>
                  {`> BOOTING ${method.toUpperCase()} ADAPTER...\n> LOADED CONFIGURATION\n> READY FOR INGESTION`}
                </div>
              )}
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
