/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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

type Tabs = "dashboard" | "billing" | "config";

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tabs>("dashboard");
  const { displayMode } = useTheme();

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
      
      <div className={`text-[8px] text-primary/50 uppercase tracking-[0.2em] font-black italic ${displayMode === 'topbar' ? '' : '[writing-mode:vertical-rl] opacity-50'}`}>
        CHRONOS LABOR OS v2.3.84
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-hidden relative`}>
      {/* Background Grid */}
      <div className="fixed inset-0 os-grid pointer-events-none"></div>

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

