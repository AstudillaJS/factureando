import { Shield, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    require?: (module: string) => any;
  }
}

export default function SystemCore() {
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [currentVersion, setCurrentVersion] = useState('Desconocida');

  useEffect(() => {
    // Obtener la versión actual desde el proceso de Electron si está disponible
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        
        // Cargar versión dinámicamente
        const appVersion = ipcRenderer.sendSync('get-app-version');
        if (appVersion) setCurrentVersion(appVersion);
        ipcRenderer.on('update-available', (_: any, info: any) => {
          setUpdateStatus({ msg: `NUEVA VERSIÓN DISPONIBLE: v${info.version} — DESCARGANDO...`, type: 'info' });
        });
        ipcRenderer.on('update-downloaded', () => {
          setUpdateStatus({ msg: 'ACTUALIZACIÓN LISTA — REINICIÁ LA APP PARA INSTALAR', type: 'success' });
        });
        ipcRenderer.on('update-not-available', () => {
          setUpdateStatus({ msg: 'EL SOFTWARE ESTÁ ACTUALIZADO', type: 'success' });
          setChecking(false);
        });
        ipcRenderer.on('update-error', (_: any, err: string) => {
          setUpdateStatus({ msg: `ERROR AL BUSCAR ACTUALIZACIONES: ${err}`, type: 'error' });
          setChecking(false);
        });
      } catch (e) {
        // No estamos en Electron (modo desarrollo web)
      }
    }
  }, []);

  const checkForUpdates = () => {
    setChecking(true);
    setUpdateStatus(null);

    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('check-for-updates');
      } catch (e) {
        setUpdateStatus({ msg: 'ERROR: NO SE PUDO CONECTAR CON EL ACTUALIZADOR', type: 'error' });
        setChecking(false);
      }
    } else {
      // Modo web (no Electron) — simular respuesta
      setTimeout(() => {
        setUpdateStatus({ msg: 'FUNCIÓN DISPONIBLE SOLO EN LA APP DE ESCRITORIO', type: 'info' });
        setChecking(false);
      }, 1000);
    }
  };

  const installUpdate = () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('install-update');
      } catch (e) {}
    }
  };

  const statusColors = {
    success: 'text-green-500/70',
    error: 'text-red-500/70',
    info: 'text-amber-400/70',
  };

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
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">VERSIÓN ACTUAL: {currentVersion}</span>
          </div>
        </div>
        
        <div className="text-right space-y-2">
          {updateStatus?.msg === 'ACTUALIZACIÓN LISTA — REINICIÁ LA APP PARA INSTALAR' ? (
            <button 
              onClick={installUpdate}
              className="os-button !px-8 bg-green-600 border-green-500 text-white hover:bg-green-500"
            >
              REINICIAR E INSTALAR
            </button>
          ) : (
            <button 
              onClick={checkForUpdates}
              disabled={checking}
              className="os-button !px-8 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              {checking ? 'BUSCANDO...' : 'BUSCAR ACTUALIZACIÓN'}
            </button>
          )}
          {updateStatus && (
            <p className={`text-[8px] uppercase tracking-[0.2em] font-bold ${statusColors[updateStatus.type]}`}>
              {updateStatus.msg}
            </p>
          )}
          {!updateStatus && (
            <p className="text-[8px] text-green-500/50 uppercase tracking-[0.2em] font-bold">EL SOFTWARE ESTÁ ACTUALIZADO</p>
          )}
        </div>
      </div>
    </div>
  );
}
