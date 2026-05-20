import { motion } from "motion/react";
import IncomeGoal from "./dashboard/IncomeGoal";
import MonotributoProjection from "./dashboard/MonotributoProjection";
import InvoiceHistory from "./dashboard/InvoiceHistory";

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-primary tracking-tighter uppercase italic leading-none">PANEL DE CONTROL</h1>
          <div className="h-1.5 w-48 bg-primary mt-4 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
        </div>
        <div className="text-right font-mono text-[10px] text-primary/40 uppercase tracking-[0.3em]">
           ESTADO DEL SISTEMA: OPERATIVO <br />
           NODO DE DATOS: ACTIVO
        </div>
      </header>

      <IncomeGoal />
      <MonotributoProjection />
      <InvoiceHistory />
      
      <footer className="pt-12 pb-8 border-t border-primary/10 flex justify-between items-center text-[8px] text-gray-600 uppercase tracking-[0.4em] font-bold">
         <div>CHRONOS LABOR OS • KERNEL V2.3.84</div>
         <div className="flex gap-8">
            <span className="text-primary/40 hover:text-primary cursor-pointer transition-colors">EXPORTAR REPORTE PDF</span>
            <span className="text-primary/40 hover:text-primary cursor-pointer transition-colors">DUMP BASE DE COMPROBANTES</span>
         </div>
      </footer>
    </motion.div>
  );
}
