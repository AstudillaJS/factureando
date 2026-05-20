import { useState, useMemo } from "react";
import { Check, FileText, Trash2, ExternalLink, RefreshCw, AlertTriangle, ShieldCheck, Search, Calendar } from "lucide-react";
import { parse, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function InvoiceHistory() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const allInvoices = [
    { 
      id: 3, 
      client: 'INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L', 
      amount: 4210500.00, 
      period: '01/05 al 15/05',
      date: '16/05/2026',
      hours: 234.0,
      type: 'RECIBO C'
    },
    { 
      id: 2, 
      client: 'TECNOLOGIA INTEGRAL S.A.', 
      amount: 1250000.00, 
      period: '15/04 al 30/04',
      date: '02/05/2026',
      hours: 80.0,
      type: 'RECIBO C'
    },
    { 
      id: 1, 
      client: 'INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L', 
      amount: 3473455.00, 
      period: '01/04 al 29/04',
      date: '04/05/2026',
      hours: 193.0,
      type: 'RECIBO C'
    }
  ];

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(inv => {
      if (!dateFrom && !dateTo) return true;
      
      const invDate = parse(inv.date, 'dd/MM/yyyy', new Date());
      const fromD = dateFrom ? startOfDay(new Date(dateFrom)) : null;
      const toD = dateTo ? endOfDay(new Date(dateTo)) : null;

      if (fromD && toD && fromD > toD) return false; // Invalid range, show nothing

      if (fromD && toD) {
        return isWithinInterval(invDate, { start: fromD, end: toD });
      } else if (fromD) {
        return invDate >= fromD;
      } else if (toD) {
        return invDate <= toD;
      }
      return true;
    });
  }, [dateFrom, dateTo]);

  const dateError = dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo);

  const handleAnnul = (inv: typeof allInvoices[0]) => {
    if (confirm(`¿Desea anular el comprobante #${inv.id} y generar una Nota de Crédito?`)) {
      alert(`Nota de Crédito generada exitosamente para ${inv.client} por $${inv.amount.toLocaleString('es-AR')}`);
    }
  };

  const checkConstancia = (cuit: string) => {
    alert(`Consultando ARCA/AFIP para CUIT: ${cuit}...\n\nESTADO: ACTIVO\nCATEGORÍA: MONOTRIBUTO C\nDOMICILIO FISCAL: VALIDADO`);
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
          <button className="os-button !px-4">+ AÑADIR HISTÓRICO</button>
        </div>

        {filteredInvoices.map((inv) => (
          <div key={inv.id} className="border border-green-900/40 bg-green-950/5 p-4 flex items-center group transition-all hover:bg-green-950/10 mb-2">
            <div className="w-1.5 h-16 bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.5)] mr-6"></div>
            
            <div className="w-12 h-12 bg-green-600/20 rounded-sm flex items-center justify-center mr-6">
              <Check className="text-green-500" size={24} />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-sm tracking-widest uppercase text-white group-hover:text-green-400 transition-colors">{inv.client}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] text-gray-500 uppercase font-mono">MAY 2026 • COMPROBANTE: {inv.id}</span>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-xl font-black text-green-500 tracking-tighter">$ {inv.amount.toLocaleString('es-AR')}</div>
                   <div className="text-[10px] text-gray-500 font-mono mt-1">{inv.hours.toLocaleString('es-AR')} HS</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 ml-8">
              <button 
                onClick={() => checkConstancia(inv.cuit)}
                className="os-button border-gray-600/40 text-gray-400 hover:text-white !px-4"
              >
                VER PDF
              </button>
              <button className="p-2 border border-red-900/40 hover:bg-red-900/20 text-red-500/50 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed History */}
      <div className="os-card !p-8">
        <h2 className="text-primary font-black text-sm tracking-[0.3em] uppercase italic mb-8">HISTORIAL DE COMPROBANTES</h2>
        
        {filteredInvoices.map((inv) => (
          <div key={`det-${inv.id}`} className="bg-primary/5 border border-primary/20 p-6 flex items-center group mb-4 last:mb-0">
            <div className="flex-1">
              <div className="flex items-baseline gap-6">
                 <h4 className="font-black text-lg tracking-widest uppercase text-green-500">{inv.type} #{inv.id}</h4>
                 <div className="text-2xl font-black text-white tracking-tighter">$ {inv.amount.toLocaleString('es-AR')}</div>
              </div>
              <div className="text-[10px] text-gray-600 uppercase font-mono tracking-widest mt-2">
                 FECHA: {inv.date} | PERIODO: {inv.period}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-2 border border-red-900/40 hover:bg-red-900/20 text-red-500/50 hover:text-red-500 transition-colors mr-2">
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => checkConstancia(inv.cuit)}
                className="os-button border-gray-600/40 text-gray-400 hover:text-white flex items-center gap-2"
              >
                 ABRIR PDF <ExternalLink size={12} />
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
        ))}
      </div>
    </div>
  );
}
