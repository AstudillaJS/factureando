/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LayoutDashboard, FileText, Settings, ShieldAlert, Cpu, Users, Files, Zap, Terminal, X, Minus, Square } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Dashboard from "./components/Dashboard";
import Billing from "./components/Billing";
import OSIntegration from "./components/OSIntegration";
import SecurityFiles from "./components/SecurityFiles";
import FiscalCluster from "./components/FiscalCluster";
import ClientManagement from "./components/ClientManagement";
import SystemCore from "./components/SystemCore";
import ErrorLog from "./components/ErrorLog";
import ThemeSelector from "./components/ThemeSelector";
import BarberConfig from "./components/BarberConfig";
import InvoiceDesignSettings from "./components/InvoiceDesignSettings";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import OnboardingWizard from "./components/OnboardingWizard";
import ProfileSwitcher from "./components/ProfileSwitcher";

type Tabs = "dashboard" | "billing" | "config";

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tabs>("dashboard");
  const { displayMode } = useTheme();
  const [showWizard, setShowWizard] = useState(false);
  const [showStartupSelector, setShowStartupSelector] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);

  const handleSelectStartupProfile = async (id: string) => {
    try {
      const res = await fetch("/api/profiles/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("startupProfileSelected", "true");
        setShowStartupSelector(false);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const startupProfileSelected = sessionStorage.getItem("startupProfileSelected");

    fetch("/api/profiles")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProfiles(data);
          if (data.length === 0) {
            setShowWizard(true);
          } else if (data.length >= 2 && !startupProfileSelected) {
            setShowStartupSelector(true);
          }
        }
      })
      .catch(console.error);

    // Registrar trigger global para abrir asistente
    (window as any).showOnboardingWizard = () => setShowWizard(true);
    return () => {
      delete (window as any).showOnboardingWizard;
    };
  }, []);

  const isFloating = displayMode === 'floating';

  const NavContent = (
    <div className={`flex ${displayMode === 'topbar' ? 'flex-row items-center justify-between w-full px-8 h-12' : 'flex-col items-center py-8 gap-10 h-full w-full'} border-border-amber bg-black/80 backdrop-blur-md z-50`}>
      <div className={`border border-primary flex items-center justify-center rounded text-primary font-bold shadow-lg shadow-primary/20 ${displayMode === 'topbar' ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-xl'}`}>
        CL
      </div>
      
      <div className={`flex ${displayMode === 'topbar' ? 'flex-row gap-8' : 'flex-col gap-6'}`}>
        <NavIcon 
          icon={<LayoutDashboard size={displayMode === 'topbar' ? 20 : 24} />} 
          active={activeTab === "dashboard"} 
          onClick={() => setActiveTab("dashboard")} 
          label="Dashboard"
        />
        <NavIcon 
          icon={<FileText size={displayMode === 'topbar' ? 20 : 24} />} 
          active={activeTab === "billing"} 
          onClick={() => setActiveTab("billing")} 
          label="Billing"
        />
        <NavIcon 
          icon={<Settings size={displayMode === 'topbar' ? 20 : 24} />} 
          active={activeTab === "config"} 
          onClick={() => setActiveTab("config")} 
          label="Settings"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <ProfileSwitcher />
        <div className={`text-[8px] text-primary/50 uppercase tracking-[0.2em] font-black italic ${displayMode === 'topbar' ? '' : '[writing-mode:vertical-rl] opacity-50'}`}>
          CHRONOS LABOR OS v2.3.84
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-bg-dark text-white selection:bg-primary selection:text-black overflow-hidden relative`}>
      {showWizard && (
        <OnboardingWizard 
          onComplete={() => {
            setShowWizard(false);
            window.location.reload(); // Recargar para aplicar tema color y configs
          }}
        />
      )}
      {showStartupSelector && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[99999] flex items-center justify-center p-6 select-none">
          <div className="max-w-2xl w-full text-center space-y-8">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="os-card border-primary/30 p-8 bg-black/80 relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-600 to-primary"></div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="border border-primary/40 px-3 py-1.5 rounded-lg bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] mb-3">
                  <span className="text-sm font-black text-primary font-mono tracking-widest">LYNX FACTURAS</span>
                </div>
                <h2 className="text-xl font-black tracking-widest text-primary uppercase italic">
                  SELECCIONAR CONTRIBUYENTE
                </h2>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-1">
                  Elegí el perfil de facturación para iniciar sesión
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1 mb-6">
                {profiles.map((p) => {
                  const initials = p.businessName ? p.businessName.substring(0, 2).toUpperCase() : "CF";
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectStartupProfile(p.id)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-primary/40 bg-white/5 hover:bg-primary/5 transition-all text-left group shadow-md hover:shadow-primary/5 cursor-pointer active:scale-[0.99]"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 bg-black/30 text-xs font-black text-white group-hover:border-primary group-hover:text-primary transition-all">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-black uppercase text-white block truncate leading-snug group-hover:text-primary transition-all">
                          {p.businessName || "Contribuyente"}
                        </span>
                        <span className="text-[8px] font-mono text-gray-500 block mt-0.5 uppercase tracking-wide">
                          CUIT: {p.afipCuit || "S/D"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="pt-4 border-t border-white/5 flex justify-center">
                <button
                  onClick={() => {
                    setShowStartupSelector(false);
                    setShowWizard(true);
                  }}
                  className="flex items-center gap-2 py-2.5 px-6 border border-dashed border-primary/30 hover:border-primary text-primary hover:bg-primary/10 rounded-xl text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer"
                >
                  + AÑADIR NUEVO CONTRIBUYENTE
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      {/* Background Glows for Organic Glassmorphism */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-fuchsia-600/10 to-pink-600/10 blur-[150px] pointer-events-none z-0"></div>

      {/* Background Grid */}
      <div className="fixed inset-0 os-grid pointer-events-none z-10"></div>

      {displayMode === 'topbar' && (
        <nav className="fixed top-0 left-0 w-full border-b border-border-amber z-50">
          {NavContent}
        </nav>
      )}

      {displayMode === 'floating' && (
        <nav className="fixed left-0 top-0 h-full w-20 border-r border-border-amber z-[60]">
          {NavContent}
        </nav>
      )}

      {/* Main Content Area */}
      <main className={`${displayMode === 'topbar' ? 'pt-12' : 'pl-20'} min-h-screen relative`}>
        <AnimatePresence mode="wait">
          {isFloating ? (
            <motion.div
              key="floating-window"
              drag
              dragMomentum={false}
              className="absolute top-20 left-20 w-[1000px] h-[700px] bg-black border border-primary/40 shadow-2xl flex flex-col z-50 rounded-sm overflow-hidden"
            >
              <div className="h-8 bg-primary/10 border-b border-primary/20 flex items-center justify-between px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-primary" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-primary/80 italic">CHRONOS_PROCESS_DAEMON.EXE</span>
                </div>
                <div className="flex gap-4">
                  <Minus size={14} className="text-primary/50 hover:text-primary cursor-pointer" />
                  <Square size={10} className="text-primary/50 hover:text-primary cursor-pointer mt-0.5" />
                  <X size={14} className="text-red-500/50 hover:text-red-500 cursor-pointer" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <TabRouter activeTab={activeTab} />
              </div>
              <div className="h-6 bg-primary/5 border-t border-primary/20 px-4 flex items-center justify-between">
                <span className="text-[8px] font-mono text-primary/40 uppercase">SYSTEM_STATE: STABLE</span>
                <span className="text-[8px] font-mono text-primary/40 uppercase">UTC_SYNC: ACTIVE</span>
              </div>
            </motion.div>
          ) : (
            <div className="min-h-screen">
              <TabRouter activeTab={activeTab} />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabRouter({ activeTab }: { activeTab: Tabs }) {
  return (
    <AnimatePresence mode="wait">
      {activeTab === "dashboard" && (
        <Dashboard key="dashboard" />
      )}
      
      {activeTab === "billing" && (
        <Billing key="billing" />
      )}

      {activeTab === "config" && (
        <motion.div 
          key="config"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-8 max-w-5xl mx-auto md:pb-24"
        >
          <header className="mb-12">
            <h1 className="text-4xl font-black text-primary tracking-tighter uppercase italic">CONFIGURACIÓN DEL SISTEMA</h1>
            <div className="h-1 w-32 bg-primary mt-2"></div>
          </header>

          <OSIntegration />
          <ThemeSelector />
          <BarberConfig />
          <SecurityFiles />
          <FiscalCluster />
          <InvoiceDesignSettings />
          <ClientManagement />
          <SystemCore />
          <ErrorLog />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function NavIcon({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
  const { displayMode } = useTheme();
  return (
    <button 
      onClick={onClick}
      className={`relative group p-3 transition-colors duration-200 ${active ? 'text-primary' : 'text-gray-600 hover:text-white'}`}
    >
      {icon}
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 border border-primary rounded m-1"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className={`absolute ${displayMode === 'topbar' ? 'top-full mt-2 left-1/2 -translate-x-1/2' : 'left-full ml-4 top-1/2 -translate-y-1/2'} px-2 py-1 bg-primary text-black text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50`}>
        {label}
      </div>
    </button>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-screen gap-4"
    >
      <Terminal size={64} className="text-primary animate-pulse" />
      <h2 className="text-3xl font-black text-primary/50 uppercase italic tracking-widest">{title} [ STAND BY ]</h2>
      <p className="text-gray-600 font-mono">ESTE MÓDULO SE ACTIVARÁ EN LA SIGUIENTE FASE</p>
    </motion.div>
  );
}

