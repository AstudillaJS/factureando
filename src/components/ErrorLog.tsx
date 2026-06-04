import { useState, useEffect } from "react";

export default function ErrorLog() {
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="os-card !p-0 overflow-hidden">
      <div className="p-6 pb-2 flex justify-between items-center">
        <h2 className="os-section-title !mb-0 text-primary uppercase italic">7. REGISTRO TÉCNICO (ERROR LOG)</h2>
        <button 
          onClick={async () => {
            try {
              await fetch("/api/logs", { method: 'DELETE' });
              setLogs([]);
            } catch(e) {
              console.error(e);
            }
          }}
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
