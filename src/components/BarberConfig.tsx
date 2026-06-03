import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Scissors } from "lucide-react";

export default function BarberConfig() {
  const [config, setConfig] = useState<any>({});
  const [status, setStatus] = useState<{msg: string, type: 'success'|'error'} | null>(null);

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

  const updateField = (key: string, val: string) => {
    setConfig((prev: any) => ({
      ...prev,
      barberPrices: {
        ...(prev.barberPrices || {}),
        [key]: Number(val)
      }
    }));
  };

  const saveConfig = async () => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ msg: "PRECIOS GUARDADOS CORRECTAMENTE", type: 'success' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus({ msg: "ERROR AL GUARDAR", type: 'error' });
      }
    } catch (e) {
      setStatus({ msg: "ERROR AL CONECTAR CON EL SERVIDOR", type: 'error' });
    }
  };

  const prices = config.barberPrices || {
    corteCabello: 0,
    perfiladoCejas: 0,
    recorteBarba: 0,
    afeitadoTradicional: 0,
    completoDeluxe: 0,
    cortePerfilado: 0
  };

  return (
    <div className="os-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="os-section-title !mb-0 text-primary uppercase italic flex items-center gap-2">
          <Scissors size={20} /> CONFIGURACIÓN PRECIOS BARBERÍA
        </h2>
      </div>

      {status && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-3 mb-6 border ${status.type === 'success' ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-red-500/50 bg-red-500/10 text-red-500'} text-[10px] font-bold uppercase tracking-widest`}
        >
          {status.msg}
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">Corte de Cabello ($)</label>
          <input type="number" className="os-input font-mono" value={prices.corteCabello} onChange={(e) => updateField('corteCabello', e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">Perfilado de Cejas ($)</label>
          <input type="number" className="os-input font-mono" value={prices.perfiladoCejas} onChange={(e) => updateField('perfiladoCejas', e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">Recorte de Barba ($)</label>
          <input type="number" className="os-input font-mono" value={prices.recorteBarba} onChange={(e) => updateField('recorteBarba', e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">Afeitado Tradicional ($)</label>
          <input type="number" className="os-input font-mono" value={prices.afeitadoTradicional} onChange={(e) => updateField('afeitadoTradicional', e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">Completo Deluxe ($)</label>
          <input type="number" className="os-input font-mono" value={prices.completoDeluxe} onChange={(e) => updateField('completoDeluxe', e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">Corte + Perfilado ($)</label>
          <input type="number" className="os-input font-mono" value={prices.cortePerfilado} onChange={(e) => updateField('cortePerfilado', e.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        <button onClick={saveConfig} className="w-full py-4 border border-primary text-xs font-bold tracking-[0.4em] uppercase hover:bg-primary/5 transition-colors">
          GUARDAR PRECIOS BARBERÍA
        </button>
      </div>
    </div>
  );
}
