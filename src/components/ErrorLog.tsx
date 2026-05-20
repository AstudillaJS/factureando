import { useState } from "react";

export default function ErrorLog() {
  const [logs, setLogs] = useState([
    { time: '19/05 07:25:30', type: 'INFO', origin: 'RELOJ', message: 'Punch-in: INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L' },
    { time: '18/05 07:29:51', type: 'INFO', origin: 'RELOJ', message: 'Punch-in: INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L' },
    { time: '15/05 08:12:31', type: 'INFO', origin: 'RELOJ', message: 'Punch-in: INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L' },
    { time: '12/05 07:48:15', type: 'INFO', origin: 'RELOJ', message: 'Punch-in: INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L' },
    { time: '07/05 07:24:34', type: 'INFO', origin: 'RELOJ', message: 'Punch-in: INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L' },
    { time: '06/05 08:07:33', type: 'INFO', origin: 'RELOJ', message: 'Punch-in: INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L' },
    { time: '05/05 12:00:58', type: 'INFO', origin: 'RELOJ', message: 'Punch-in: INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L' },
    { time: '05/05 08:39:18', type: 'INFO', origin: 'RELOJ', message: 'Punch-in: INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L' },
    { time: '04/05 12:39:14', type: 'INFO', origin: 'FACTURACIÓN', message: 'Factura #1 generada exitosamente para INSTITUTO DE TRAUMATOLOGIA Y ENFERMEDADES OSEAS S R L' },
    { time: '04/05 12:39:03', type: 'INFO', origin: 'ARCA', message: 'Prueba de conexión exitosa' },
  ]);

  return (
    <div className="os-card !p-0 overflow-hidden">
      <div className="p-6 pb-2 flex justify-between items-center">
        <h2 className="os-section-title !mb-0 text-primary uppercase italic">7. REGISTRO TÉCNICO (ERROR LOG)</h2>
        <button 
          onClick={() => setLogs([])}
          className="text-[10px] text-red-500/50 border border-red-900/30 px-4 py-1 uppercase tracking-widest hover:bg-red-900/10 transition-colors"
        >
          LIMPIAR LOGS
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[10px] tracking-tighter">
          <thead>
            <tr className="border-y border-border-amber/20 bg-primary/5">
              <th className="p-4 uppercase text-primary/70 tracking-widest font-bold">TIMESTAMP</th>
              <th className="p-4 uppercase text-primary/70 tracking-widest font-bold">TIPO</th>
              <th className="p-4 uppercase text-primary/70 tracking-widest font-bold">ORIGEN</th>
              <th className="p-4 uppercase text-primary/70 tracking-widest font-bold">MENSAJE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-amber/10">
            {logs.map((log, i) => (
              <tr key={i} className="hover:bg-primary/5 transition-colors group">
                <td className="p-4 text-primary group-hover:text-primary-dark">{log.time}</td>
                <td className="p-4 text-gray-500">{log.type}</td>
                <td className="p-4 font-bold text-primary italic">{log.origin}</td>
                <td className="p-4 text-gray-400 group-hover:text-gray-200">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Scroll indicator mimic from photo */}
      <div className="h-1 bg-black relative">
        <div className="absolute left-0 top-0 h-full bg-primary/30" style={{ width: '40%' }}></div>
        <div className="absolute right-0 top-0 h-full bg-white/10 w-4"></div>
      </div>
    </div>
  );
}
