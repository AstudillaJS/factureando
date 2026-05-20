import { TrendingUp, Zap } from "lucide-react";

export default function IncomeGoal() {
  const actual = 2185400.145;
  const target = 3500000.00;
  const percentage = (actual / target) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Target Progress Card */}
      <div className="md:col-span-2 os-card !p-8 border-l-4 border-l-red-600 bg-gradient-to-r from-red-950/20 to-transparent">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-red-500 font-black text-xs tracking-[0.3em] uppercase">META DE INGRESOS MENSUAL</h3>
          <span className="text-xs font-mono text-white tracking-widest">62% COMPLETADO</span>
        </div>
        
        <div className="w-full h-2 bg-gray-900 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-linear-to-r from-red-600 to-pink-500" style={{ width: '62%' }}></div>
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
          <div className="ml-auto flex gap-1">
             <span className="bg-primary text-black text-[8px] px-1.5 py-0.5 font-bold">MES</span>
             <span className="border border-primary/30 text-primary/50 text-[8px] px-1.5 py-0.5 font-bold">TRABAJADOS</span>
          </div>
        </div>

        <div className="mb-8">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-bold">RITMO DIARIO ACTUAL</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tighter">$ 182.115,89</span>
            <span className="text-[10px] text-gray-500 uppercase">/ DÍA</span>
            <span className="text-xl font-black text-red-600/80 tracking-tighter ml-2">10117.5</span>
            <span className="text-[8px] text-gray-500 uppercase font-bold">HS / DÍA</span>
          </div>
        </div>

        <div className="bg-green-950/20 border border-green-900/40 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <TrendingUp size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">ESTADO DE LA META</span>
          </div>
          <div className="flex items-center gap-2 text-white mb-1">
            <div className="w-4 h-4 bg-white/10 flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-blue-400"></div>
            </div>
            <span className="font-bold text-sm tracking-tight uppercase">SUPERÁVIT PREVISTO</span>
          </div>
          <span className="text-xl font-black text-green-500 block mb-2">$ 3.820.933,67</span>
          <p className="text-[9px] text-gray-500 italic leading-relaxed">
            Vas por buen camino. A este ritmo, superarás tu objetivo mensual con creces.
          </p>
        </div>
      </div>
    </div>
  );
}
