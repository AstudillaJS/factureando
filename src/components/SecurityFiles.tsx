import { Search } from "lucide-react";

export default function SecurityFiles() {
  return (
    <div className="os-card">
      <h2 className="os-section-title">3. SEGURIDAD Y ARCHIVOS</h2>
      
      <div className="space-y-6">
        <div>
          <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block">CARPETA DESTINO DE FACTURAS (PDF)</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              className="os-input font-mono text-xs" 
              defaultValue="C:\Users\astud\OneDrive" 
              readOnly
            />
            <button className="os-button whitespace-nowrap">CAMBIAR</button>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block">CLAVE DE ACCESO LOCAL</label>
          <input 
            type="password" 
            className="os-input" 
            placeholder="Dejar vacío para desactivar" 
          />
        </div>

        <div className="bg-primary/5 border border-primary/20 p-4 rounded flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <span className="font-bold tracking-widest text-xs uppercase underline underline-offset-4 decoration-primary/30">SISTEMA DE PROTECCIÓN DE DATOS</span>
            </div>
            <p className="text-[10px] text-gray-600 font-mono tracking-tighter">
              UBICACIÓN: C:\Users\astud\AppData\Roaming\tracker-de-horas\session_data.json
            </p>
            <p className="text-[10px] text-primary/50 italic">
              * Se crea una copia de seguridad automática cada vez que se guardan cambios. El sistema conserva los últimos 10 estados para recuperación ante fallos.
            </p>
          </div>
          <button className="text-[10px] border border-primary/30 px-3 py-1 uppercase tracking-widest hover:bg-primary hover:text-black transition-colors">
            ABRIR CARPETA DE BACKUPS
          </button>
        </div>

        <div className="border border-dashed border-border-amber/50 p-6 rounded flex justify-between items-center group cursor-pointer hover:bg-primary/[0.02] transition-colors">
          <div className="flex items-center gap-4">
            <Search className="text-primary" size={20} />
            <div>
              <span className="font-bold text-xs tracking-widest uppercase block group-hover:text-primary">ASISTENTE DE RECUPERACIÓN LYNX</span>
              <p className="text-[10px] text-gray-500 italic mt-1 font-mono">Si perdiste tus horas al actualizar, usa esta herramienta para rastrear archivos antiguos.</p>
            </div>
          </div>
          <button className="os-button">BUSCAR DATOS PERDIDOS</button>
        </div>
      </div>
    </div>
  );
}
