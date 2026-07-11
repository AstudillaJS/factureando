import { motion } from "motion/react";
import IncomeGoal from "./dashboard/IncomeGoal";
import MonotributoProjection from "./dashboard/MonotributoProjection";
import InvoiceHistory from "./dashboard/InvoiceHistory";
import BarberPOS from "./dashboard/BarberPOS";
import SalesStats from "./dashboard/SalesStats";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Dashboard() {
  const handleExportPDF = async () => {
    try {
      const res = await fetch("/api/invoices");
      const invoices = await res.json();
      
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Reporte de Comprobantes", 14, 22);
      
      const tableData = invoices.map((inv: any) => [
        inv.date,
        inv.type,
        inv.clientName || 'Consumidor Final',
        inv.clientCuit || '0',
        `$${inv.amount.toLocaleString('es-AR')}`
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['Fecha', 'Tipo', 'Cliente', 'CUIT/DNI', 'Monto']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [245, 158, 11] }
      });

      doc.save(`reporte_facturacion_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      alert("Error al generar PDF");
    }
  };

  const handleDumpDB = async () => {
    try {
      const res = await fetch("/api/invoices");
      const invoices = await res.json();
      
      const blob = new Blob([JSON.stringify(invoices, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dump_comprobantes_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert("Error al descargar la base de datos");
    }
  };

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

      <BarberPOS />

      <SalesStats />

      <IncomeGoal />
      <MonotributoProjection />
      <InvoiceHistory />
      
      <footer className="pt-12 pb-8 border-t border-primary/10 flex justify-between items-center text-[8px] text-gray-600 uppercase tracking-[0.4em] font-bold">
         <div>CHRONOS LABOR OS • KERNEL V2.3.84</div>
         <div className="flex gap-8">
            <span onClick={handleExportPDF} className="text-primary/40 hover:text-primary cursor-pointer transition-colors">EXPORTAR REPORTE PDF</span>
            <span onClick={handleDumpDB} className="text-primary/40 hover:text-primary cursor-pointer transition-colors">DUMP BASE DE COMPROBANTES</span>
         </div>
      </footer>
    </motion.div>
  );
}
