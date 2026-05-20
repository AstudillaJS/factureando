import { Shield } from "lucide-react";

export default function SystemCore() {
  return (
    <div className="os-card">
      <h2 className="os-section-title text-primary uppercase italic">6. NÚCLEO DEL SISTEMA Y ACTUALIZACIONES</h2>
      
      <div className="border border-border-amber/30 p-6 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5">
            <Shield className="text-primary/70" size={24} />
          </div>
          <div>
            <span className="font-bold text-sm tracking-[0.3em] uppercase block mb-1 underline underline-offset-4 decoration-primary/30">CHRONOS LABOR OS</span>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">VERSIÓN ACTUAL: 2.3.84</span>
          </div>
        </div>
        
        <div className="text-right space-y-2">
          <button className="os-button !px-8">BUSCAR ACTUALIZACIÓN</button>
          <p className="text-[8px] text-green-500/50 uppercase tracking-[0.2em] font-bold">EL SOFTWARE ESTÁ ACTUALIZADO</p>
        </div>
      </div>
    </div>
  );
}
