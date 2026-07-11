import { TrendingUp, Zap, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInDays } from "date-fns";

export default function IncomeGoal() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [target, setTarget] = useState(0);
  const [insightMode, setInsightMode] = useState<'mes' | 'trabajados'>('mes');
  
  // Editable Goal states
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [editTargetVal, setEditTargetVal] = useState("");

  // Monotributo states
  const [categories, setCategories] = useState<any[]>([]);
  const [userCategoryLetter, setUserCategoryLetter] = useState('A');

  const loadData = () => {
    fetch("/api/invoices").then(res => res.json()).then(setInvoices).catch(console.error);
    fetch("/api/config").then(res => res.json()).then(data => {
      if (data.monthlyGoal) setTarget(data.monthlyGoal);
      else setTarget(1000000); // Default to 1M

      if (data.categoriaMonotributo) {
        const match = data.categoriaMonotributo.match(/Categoría\s+([A-K])/i);
        if (match && match[1]) {
          setUserCategoryLetter(match[1].toUpperCase());
        }
      }
    }).catch(console.error);
    
    fetch("/api/afip/categories")
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.categories);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTarget = async () => {
    const val = Number(editTargetVal);
    if (!isNaN(val) && val >= 0) {
      setTarget(val);
      setIsEditingTarget(false);
      try {
        await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monthlyGoal: val })
        });
      } catch (e) {
        console.error("Error saving goal:", e);
      }
    } else {
      setIsEditingTarget(false);
    }
  };

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
  
  const daysInMonth = differenceInDays(end, start) + 1;
  const projectedTotal = ritmoDiario * daysInMonth;

  // Calculo de facturacion acumulada de últimos 12 meses (L12M)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(now.getFullYear() - 1);
  
  const twelveMonthInvoices = invoices.filter(inv => {
    try {
      if (inv.status !== 'emitted') return false;
      const invDate = parseISO(inv.createdAt || inv.date);
      return invDate >= twelveMonthsAgo && invDate <= now;
    } catch (e) {
      return false;
    }
  });

  const twelveMonthTotal = twelveMonthInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  
  const currentCategoryObj = categories.find(cat => cat.category === userCategoryLetter) || { category: 'A', limit: 8992597.87 };
  const categoryPercentage = (twelveMonthTotal / currentCategoryObj.limit) * 100;

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {isEditingTarget ? (
                <input 
                  type="number"
                  className="os-input font-bold tracking-tight bg-black border border-primary text-2xl text-right p-1 rounded max-w-[185px]"
                  value={editTargetVal}
                  autoFocus
                  onChange={e => setEditTargetVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveTarget();
                    if (e.key === 'Escape') setIsEditingTarget(false);
                  }}
                  onBlur={handleSaveTarget}
                />
              ) : (
                <div 
                  onClick={() => {
                    setEditTargetVal(target.toString());
                    setIsEditingTarget(true);
                  }}
                  className="flex items-center gap-2 justify-end cursor-pointer group"
                >
                  <span className="text-2xl font-black text-white/80 tracking-tighter group-hover:text-primary transition-colors underline decoration-dotted decoration-white/20">
                    $ {target.toLocaleString('es-AR')}
                  </span>
                  <Edit2 size={12} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
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

      {/* AFIP Monotributo Category Contrast Card */}
      <div className="os-card !p-8 border-l-4 border-l-primary/60 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
          <div>
            <h3 className="text-primary font-black text-xs tracking-[0.3em] uppercase mb-1">CONTROL DE LÍMITE MONOTRIBUTO (L12M)</h3>
            <p className="text-[9px] text-gray-500 font-mono">Contraste de facturación acumulada últimos 12 meses contra escalas vigentes ARCA/AFIP</p>
          </div>
          <span className="text-xs font-mono text-white tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded">
            Categoría {currentCategoryObj.category} (Límite Anual: $ {currentCategoryObj.limit.toLocaleString('es-AR')})
          </span>
        </div>

        <div className="w-full h-2 bg-gray-900 rounded-full mb-6 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${categoryPercentage >= 90 ? 'bg-red-500' : categoryPercentage >= 75 ? 'bg-amber-500' : 'bg-primary'}`} 
            style={{ width: `${Math.min(100, categoryPercentage)}%` }}
          ></div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1 font-mono font-bold">FACTURADO ACUMULADO (L12M):</span>
            <span className="text-2xl font-black text-primary tracking-tighter">$ {twelveMonthTotal.toLocaleString('es-AR')}</span>
            <span className="text-[10px] text-gray-500 font-mono ml-2 font-bold">({Math.round(categoryPercentage)}% de la escala)</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1 font-mono font-bold">CUPO DISPONIBLE ANTES DE EXCLUSIÓN:</span>
            <span className={`text-xl font-black ${currentCategoryObj.limit - twelveMonthTotal <= 0 ? 'text-red-500' : 'text-white/80'}`}>
              {currentCategoryObj.limit - twelveMonthTotal <= 0 ? 'EXCEDIDO' : `$ ${(currentCategoryObj.limit - twelveMonthTotal).toLocaleString('es-AR')}`}
            </span>
          </div>
        </div>
        
        {categoryPercentage >= 90 && (
          <div className="mt-6 p-4 bg-red-950/20 border border-red-900/40 text-[9px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
            ⚠️ ALERTA DE RIESGO FISCAL: Has consumido el {Math.round(categoryPercentage)}% del cupo anual disponible para la Categoría {currentCategoryObj.category}. Deberías evaluar pausar facturación o prepararte para la recategorización obligatoria.
          </div>
        )}
      </div>
    </div>
  );
}
