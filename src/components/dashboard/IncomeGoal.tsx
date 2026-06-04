import { TrendingUp, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInDays } from "date-fns";

export default function IncomeGoal() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [target, setTarget] = useState(0);
  const [insightMode, setInsightMode] = useState<'mes' | 'trabajados'>('mes');

  useEffect(() => {
    fetch("/api/invoices").then(res => res.json()).then(setInvoices).catch(console.error);
    fetch("/api/config").then(res => res.json()).then(data => {
      if (data.monthlyGoal) setTarget(data.monthlyGoal);
      else setTarget(1000000); // Default to 1M
    }).catch(console.error);
  }, []);

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const currentMonthInvoices = invoices.filter(inv => {
    try {
      const invDate = parseISO(inv.createdAt || inv.date);
      return isWithinInterval(invDate, { start, end });
    } catch (e) {
      return false;
    }
  });

  const actual = currentMonthInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const percentage = target > 0 ? (actual / target) * 100 : 0;

  const daysPassedInMonth = Math.max(1, differenceInDays(now, start) + 1);
  const uniqueDaysWorked = new Set(currentMonthInvoices.map(inv => inv.date)).size || 1;

  const divisor = insightMode === 'mes' ? daysPassedInMonth : uniqueDaysWorked;
  const ritmoDiario = actual / divisor;
  
  // Calculate estimated total based on current pace
  const daysInMonth = differenceInDays(end, start) + 1;
  const projectedTotal = ritmoDiario * daysInMonth;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Target Progress Card */}
      <div className="md:col-span-2 os-card !p-8 border-l-4 border-l-red-600 bg-gradient-to-r from-red-950/20 to-transparent">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-red-500 font-black text-xs tracking-[0.3em] uppercase">META DE INGRESOS MENSUAL</h3>
          <span className="text-xs font-mono text-white tracking-widest">{Math.round(percentage)}% COMPLETADO</span>
        </div>
        
        <div className="w-full h-2 bg-gray-900 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-linear-to-r from-red-600 to-pink-500" style={{ width: `${percentage}%` }}></div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-bold">ACTUAL:</span>
            <span className="text-3xl font-black text-primary tracking-tighter">$ {actual.toLocaleString('es-AR')}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-bold">OBJETIVO:</span>
            <span className="text-2xl font-black text-white/80 tracking-tighter">$ {target.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>

      {/* Smart Insights Card */}
      <div className="os-card !p-8 border-l-4 border-l-amber-500 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 transition-opacity group-hover:opacity-40">
          <Zap className="text-amber-500" size={48} />
        </div>
        
        <div className="flex items-center gap-2 mb-8">
          <Zap className="text-amber-500" size={16} />
          <h3 className="text-amber-500 font-black text-xs tracking-[0.3em] uppercase">SMART INSIGHTS</h3>
          <div className="ml-auto flex gap-1 cursor-pointer">
             <span 
               onClick={() => setInsightMode('mes')}
               className={`text-[8px] px-1.5 py-0.5 font-bold ${insightMode === 'mes' ? 'bg-primary text-black' : 'border border-primary/30 text-primary/50 hover:bg-primary/10'}`}
             >
               MES
             </span>
             <span 
               onClick={() => setInsightMode('trabajados')}
               className={`text-[8px] px-1.5 py-0.5 font-bold ${insightMode === 'trabajados' ? 'bg-primary text-black' : 'border border-primary/30 text-primary/50 hover:bg-primary/10'}`}
             >
               TRABAJADOS
             </span>
          </div>
        </div>

        <div className="mb-8">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-bold">RITMO DIARIO ACTUAL</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tighter">$ {Math.round(ritmoDiario).toLocaleString('es-AR')}</span>
            <span className="text-[10px] text-gray-500 uppercase">/ DÍA</span>
            <span className="text-xl font-black text-red-600/80 tracking-tighter ml-2">--</span>
            <span className="text-[8px] text-gray-500 uppercase font-bold">HS / DÍA</span>
          </div>
        </div>

        <div className="bg-green-950/20 border border-green-900/40 p-4 rounded-sm mb-4">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <TrendingUp size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">PROYECCIÓN ESTIMADA</span>
          </div>
          <span className="text-lg font-black text-green-500 tracking-tighter block mb-1">$ {Math.round(projectedTotal).toLocaleString('es-AR')}</span>
          <p className="text-[8px] text-gray-400 italic">Si mantienes este ritmo hasta fin de mes.</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-primary mb-2">
            <TrendingUp size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">ESTADO DE LA META</span>
          </div>
          <div className="flex items-center gap-2 text-white mb-1">
            <div className="w-4 h-4 bg-white/10 flex items-center justify-center">
               <div className={`w-1.5 h-1.5 ${percentage >= 100 ? 'bg-green-500' : percentage > 0 ? 'bg-primary' : 'bg-gray-500'}`}></div>
            </div>
            <span className="font-bold text-sm tracking-tight uppercase">
              {percentage >= 100 ? 'META ALCANZADA' : percentage > 0 ? 'EN PROGRESO' : 'SIN ACTIVIDAD'}
            </span>
          </div>
          <span className="text-xl font-black text-green-500 block mb-2">$ {Math.round(actual).toLocaleString('es-AR')}</span>
          <p className="text-[9px] text-gray-500 italic leading-relaxed">
            {percentage > 0 ? `Has completado el ${Math.round(percentage)}% de tu objetivo mensual.` : 'Comienza a registrar facturas para proyectar tus metas.'}
          </p>
        </div>
      </div>
    </div>
  );
}
