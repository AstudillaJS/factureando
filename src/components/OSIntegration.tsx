import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";

export default function OSIntegration() {
  const { displayMode, setDisplayMode } = useTheme();
  const [opacity, setOpacity] = useState(95);

  useEffect(() => {
    fetch("/api/config").then(res => res.json()).then(data => {
      if (data.opacity) {
        setOpacity(data.opacity);
        handleOpacityChange(data.opacity, false);
      }
    }).catch(console.error);
  }, []);

  const handleOpacityChange = (val: number, save = true) => {
    setOpacity(val);
    try {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('set-opacity', val / 100);
      if (save) {
        fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opacity: val })
        });
      }
    } catch (e) {
      console.log('No electron environment for opacity');
    }
  };

  return (
    <div className="os-card">
      <h2 className="os-section-title">2. INTEGRACIÓN VIRTUAL DEL SO</h2>
      
      <div className="space-y-4">
        <label className="flex items-start gap-4 cursor-pointer group">
          <input type="checkbox" className="os-checkbox mt-1" defaultChecked />
          <div>
            <span className="font-bold text-sm tracking-widest uppercase group-hover:text-primary transition-colors">AUTO-ARRANQUE CON WINDOWS</span>
          </div>
        </label>

        <label className="flex items-start gap-4 cursor-pointer group">
          <input type="checkbox" className="os-checkbox mt-1" defaultChecked />
          <div>
            <span className="font-bold text-sm tracking-widest uppercase group-hover:text-primary transition-colors">INVISIBILIDAD EN BANDEJA DE SISTEMA</span>
            <p className="text-xs text-gray-500 mt-1 italic">Si la cajita roja (X) minimiza o cierra de verdad la aplicación.</p>
          </div>
        </label>

        <div className="border border-border-amber/50 p-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-sm tracking-widest uppercase">ACTIVAR WIDGET DE MONITOREO</span>
              <p className="text-xs text-gray-500 mt-1 italic">Muestra una mini-ventana con el tiempo real y ganancia actual.</p>
            </div>
            <input type="checkbox" className="os-checkbox" defaultChecked />
          </div>
        </div>

        <div className="border border-border-amber/50 p-4">
          <span className="text-[10px] text-primary/70 uppercase tracking-widest mb-4 block font-bold tracking-[0.1em]">MODO DE PRESENTACIÓN DEL WIDGET</span>
          <div className="flex gap-4">
            <button 
              onClick={() => setDisplayMode('floating')}
              className={`flex-1 py-3 border border-primary text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${displayMode === 'floating' ? 'bg-primary/20 shadow-[inset_0_0_10px_rgba(var(--primary-rgb),0.2)]' : 'bg-primary/5 hover:bg-primary/10 opacity-60 hover:opacity-100'}`}
            >
              VENTANA FLOTANTE
            </button>
            <button 
              onClick={() => setDisplayMode('topbar')}
              className={`flex-1 py-3 border border-primary text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${displayMode === 'topbar' ? 'bg-primary/20 shadow-[inset_0_0_10px_rgba(var(--primary-rgb),0.2)]' : 'bg-primary/5 hover:bg-primary/10 opacity-60 hover:opacity-100'}`}
            >
              BARRA SUPERIOR
            </button>
          </div>
        </div>

        <div className="border border-border-amber/50 p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] text-primary/70 uppercase tracking-widest">TRANSPARENCIA "FANTASMA" DE LA VENTANA ({opacity}%)</span>
          </div>
          <div className="relative">
            <input 
              type="range" 
              min="20" max="100" 
              value={opacity}
              onChange={(e) => handleOpacityChange(Number(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(245,158,11,0.5)] cursor-pointer"
            />
          </div>
          <div className="flex justify-between mt-2 text-[8px] uppercase tracking-widest text-gray-600">
            <span>INVISIBLE</span>
            <span>OPACO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
