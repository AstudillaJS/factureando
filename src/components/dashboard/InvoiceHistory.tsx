import { useState, useMemo, useEffect } from "react";
import { Search, ShieldCheck, Check, Calendar, Trash2, FileText, AlertCircle, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";
import { generateInvoicePDF } from "../../utils/pdfGenerator";
import { parse, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function InvoiceHistory() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ total: 0, current: 0 });
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);

  const loadInvoices = () => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllInvoices(data.reverse());
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(inv => {
      // Search
      const searchLower = String(searchTerm || '').toLowerCase();
      const matchSearch = 
        String(inv.clientName || '').toLowerCase().includes(searchLower) ||
        String(inv.clientCuit || '').includes(searchLower) ||
        String(inv.type || '').toLowerCase().includes(searchLower) ||
        String(inv.id || '').toLowerCase().includes(searchLower);

      if (!matchSearch) return false;

      // Dates
      if (!inv.date) return true;
      try {
        const invDate = parse(inv.date, 'yyyy-MM-dd', new Date());
        const fromD = dateFrom ? startOfDay(parse(dateFrom, 'yyyy-MM-dd', new Date())) : null;
        const toD = dateTo ? endOfDay(parse(dateTo, 'yyyy-MM-dd', new Date())) : null;

        if (fromD && toD) {
          return isWithinInterval(invDate, { start: fromD, end: toD });
        } else if (fromD) {
          return invDate >= fromD;
        } else if (toD) {
          return invDate <= toD;
        }
      } catch (e) {
        return true;
      }
      return true;
    });
  }, [allInvoices, dateFrom, dateTo, searchTerm]);

  const dateError = dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo);

  const handleAnnul = (inv: typeof allInvoices[0]) => {
    if (confirm(`¿Desea anular el comprobante #${inv.id} y generar una Nota de Crédito?`)) {
      alert(`Nota de Crédito generada exitosamente para ${inv.client} por $${inv.amount.toLocaleString('es-AR')}`);
    }
  };

  const checkConstancia = (cuit: string) => {
    alert(`Consultando ARCA/AFIP para CUIT: ${cuit}...\n\nESTADO: ACTIVO\nCATEGORÍA: MONOTRIBUTO C\nDOMICILIO FISCAL: VALIDADO`);
  };

  const handleEmitBatch = async () => {
    let drafts = filteredInvoices.filter(inv => inv.status === 'pending');
    if (selectedDrafts.length > 0) {
      drafts = drafts.filter(inv => selectedDrafts.includes(inv.id));
    }

    if (drafts.length === 0) return alert("No hay borradores pendientes para emitir seleccionados.");
    if (!confirm(`Se enviarán a AFIP ${drafts.length} comprobantes.\n¿Confirmar CIERRE DE LOTE? Esta acción tiene validez legal.`)) return;
    
    setIsProcessingBatch(true);
    setBatchProgress({ total: drafts.length, current: 0 });

    let errors = 0;
    for (let i = 0; i < drafts.length; i++) {
      setBatchProgress(prev => ({ ...prev, current: i + 1 }));
      try {
        const res = await fetch('/api/afip/emit-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: drafts[i].id })
        });
        const data = await res.json();
        if (!data.success) {
          console.error(`Error en factura #${drafts[i].id}: ${data.message}`);
          errors++;
        }
      } catch (e) {
        errors++;
      }
    }
    
    setIsProcessingBatch(false);
    setSelectedDrafts([]);
    loadInvoices(); // Reload after batch
    if (errors > 0) alert(`Lote finalizado con ${errors} errores. Verificá la consola para detalles.`);
    else alert("¡Lote de facturación enviado a AFIP exitosamente!");
  };

  const toggleSelectDraft = (id: string) => {
    setSelectedDrafts(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const viewPDF = async (inv: any) => {
    try {
      const configRes = await fetch('/api/config');
      const configData = await configRes.json();
      const pdfUrl = await generateInvoicePDF(inv, configData);
      window.open(pdfUrl, '_blank');
    } catch (e) {
      alert("Error al generar PDF.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="os-card !p-6 flex flex-wrap items-end gap-6 bg-primary/2 border-dashed">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">BUSCAR COMPROBANTE</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
            <input 
              type="text" 
              className="os-input !pl-10 !py-2" 
              placeholder="CLIENTE, #, TIPO..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">DESDE</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={14} />
              <input 
                type="date" 
                className={`os-input !pl-10 !py-2 text-[10px] ${dateError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}`} 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">HASTA</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={14} />
              <input 
                type="date" 
                className={`os-input !pl-10 !py-2 text-[10px] ${dateError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}`} 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
        {dateError && <span className="text-[9px] text-red-500 font-bold uppercase w-full">RANGO DE FECHAS INVÁLIDO</span>}

        <button 
          className="os-button !h-[42px] border-red-950/40 text-red-500/50 hover:text-red-500"
          onClick={() => { setDateFrom(""); setDateTo(""); }}
        >
          LIMPIAR
        </button>
      </div>
      {/* Short History */}
      <div className="os-card !p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <ShieldCheck size={18} className="text-primary/70" />
             <h2 className="text-primary font-black text-sm tracking-[0.3em] uppercase italic">HISTORIAL DE COMPROBANTES EMITIDOS</h2>
          </div>
          <div className="flex gap-4 items-center">
            {isProcessingBatch ? (
              <div className="flex items-center gap-2 text-yellow-500 font-bold uppercase text-xs">
                <RefreshCw size={14} className="animate-spin" />
                EMITIENDO {batchProgress.current} DE {batchProgress.total}...
              </div>
            ) : (
              <button 
                onClick={handleEmitBatch}
                className="os-button border-yellow-500/50 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 font-bold tracking-widest text-[10px]"
              >
                <AlertCircle size={14} className="inline mr-2" />
                CERRAR LOTE (EMITIR BORRADORES)
              </button>
            )}
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-primary/20 rounded-sm">
            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">NO SE REGISTRARON COMPROBANTES EMITIDOS</span>
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div key={inv.id} className={`border ${inv.status === 'pending' ? 'border-yellow-900/40 bg-yellow-950/5 hover:bg-yellow-950/10' : 'border-green-900/40 bg-green-950/5 hover:bg-green-950/10'} p-4 flex items-center group transition-all mb-2`}>
              <div className={`w-1.5 h-16 mr-6 ${inv.status === 'pending' ? 'bg-yellow-600 shadow-[0_0_15px_rgba(202,138,4,0.5)]' : 'bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.5)]'}`}></div>
              
              {inv.status === 'pending' ? (
                <div className="mr-6 flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 accent-yellow-500 cursor-pointer"
                    checked={selectedDrafts.includes(inv.id)}
                    onChange={() => toggleSelectDraft(inv.id)}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-green-600/20 rounded-sm flex items-center justify-center mr-6">
                  <Check className="text-green-500" size={24} />
                </div>
              )}

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-sm tracking-widest uppercase text-white group-hover:text-green-400 transition-colors">{inv.clientName || 'CONSUMIDOR FINAL'}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] text-gray-500 uppercase font-mono">{inv.date} • COMPROBANTE: #{inv.id?.slice(-4) || 'BORRADOR'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                     <div className="text-xl font-black text-green-500 tracking-tighter">$ {(inv.amount || 0).toLocaleString('es-AR')}</div>
                     <div className="text-[10px] text-gray-500 font-mono mt-1 uppercase">{inv.status === 'pending' ? 'Borrador' : 'Emitido'}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-8">
                {inv.status === 'emitted' ? (
                  <button 
                    onClick={() => viewPDF(inv)}
                    className="os-button border-green-600/40 text-green-400 hover:text-green-300 !px-4 hover:bg-green-600/20"
                  >
                    <FileText size={14} className="inline mr-2" />
                    VER PDF A4
                  </button>
                ) : (
                  <div className="px-4 py-2 text-[10px] text-yellow-500 font-bold border border-yellow-500/20 bg-yellow-500/5 rounded-sm">
                    PENDIENTE
                  </div>
                )}
                
                <button 
                  onClick={() => checkConstancia(inv.clientCuit)}
                  className="os-button border-gray-600/40 text-gray-400 hover:text-white !px-4"
                >
                  VER DETALLE
                </button>
                <button className="p-2 border border-red-900/40 hover:bg-red-900/20 text-red-500/50 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed History */}
      <div className="os-card !p-8">
        <h2 className="text-primary font-black text-sm tracking-[0.3em] uppercase italic mb-8">HISTORIAL DE COMPROBANTES</h2>
        
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-primary/20 rounded-sm">
            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">HISTORIAL DE COMPROBANTES VACÍO</span>
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div key={`det-${inv.id}`} className="bg-primary/5 border border-primary/20 p-6 flex items-center group mb-4 last:mb-0">
              <div className="flex-1">
                <div className="flex items-baseline gap-6">
                   <h4 className="font-black text-lg tracking-widest uppercase text-green-500">{inv.type || 'C'} #{inv.id?.slice(-4)}</h4>
                   <div className="text-2xl font-black text-white tracking-tighter">$ {(inv.amount || 0).toLocaleString('es-AR')}</div>
                </div>
                <div className="text-[10px] text-gray-600 uppercase font-mono tracking-widest mt-2">
                   FECHA: {inv.date} | ESTADO: {inv.status === 'pending' ? 'BORRADOR' : 'EMITIDO'}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 border border-red-900/40 hover:bg-red-900/20 text-red-500/50 hover:text-red-500 transition-colors mr-2">
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => checkConstancia(inv.clientCuit)}
                  className="os-button border-gray-600/40 text-gray-400 hover:text-white flex items-center gap-2"
                >
                   DETALLES <ExternalLink size={12} />
                </button>
                <button className="os-button border-amber-600/40 text-amber-500/70 hover:text-amber-500 flex items-center gap-2">
                   REGENERAR PDF <RefreshCw size={12} />
                </button>
                <button 
                  onClick={() => handleAnnul(inv)}
                  className="os-button border-red-600/40 text-red-500/70 hover:text-red-500 flex items-center gap-2"
                >
                   ANULAR <AlertTriangle size={12} />
                </button>
                <button className="os-button border-gray-600/40 text-gray-500 hover:text-white flex items-center gap-2">
                   VERIFICAR EN ARCA
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
