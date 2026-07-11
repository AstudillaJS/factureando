import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Scissors, Plus, Minus } from "lucide-react";

const DEFAULT_PRODUCTS = [
  { id: "corteCabello", name: "Corte de Cabello", price: 22000 },
  { id: "perfiladoCejas", name: "Perfilado de Cejas", price: 15000 },
  { id: "recorteBarba", name: "Recorte de Barba", price: 22000 },
  { id: "afeitadoTradicional", name: "Afeitado Tradicional", price: 22000 },
  { id: "completoDeluxe", name: "Completo Deluxe", price: 44000 },
  { id: "cortePerfilado", name: "Corte + Perfilado", price: 33000 }
];

export default function BarberPOS() {
  const [config, setConfig] = useState<any>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        // Migración idéntica si no existe posProducts
        if (!data.posProducts) {
          const oldPrices = data.barberPrices || {};
          data.posProducts = DEFAULT_PRODUCTS.map(p => ({
            ...p,
            price: oldPrices[p.id] !== undefined ? oldPrices[p.id] : p.price
          }));
        }
        if (!data.businessName) {
          data.businessName = "Barbería";
        }
        setConfig(data);

        // Inicializar contadores en cero para cada producto
        const initialCounts: Record<string, number> = {};
        data.posProducts.forEach((p: any) => {
          initialCounts[p.id] = 0;
        });
        setCounts(initialCounts);
      })
      .catch(console.error);
  }, []);

  const businessName = config.businessName || "Barbería";
  const products = config.posProducts || DEFAULT_PRODUCTS;

  const calculateTotal = () => {
    return products.reduce((sum: number, p: any) => sum + (counts[p.id] || 0) * (p.price || 0), 0);
  };

  const total = calculateTotal();

  const handleInc = (id: string) => setCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const handleDec = (id: string) => setCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));

  const generateGlobalInvoice = async () => {
    if (total === 0) {
      setStatus({ msg: "NO HAY ÍTEMS CARGADOS", type: 'error' });
      return;
    }

    if (total > 344000) {
      setStatus({ msg: "MONTO EXCEDE LÍMITE AFIP PARA CONSUMIDOR FINAL ($344.000)", type: 'error' });
      return;
    }

    try {
      const payload = {
        amount: total,
        date: date,
        type: 'C',
        clientCuit: '0',
        clientName: 'CONSUMIDOR FINAL',
        description: `Servicios de ${businessName} del día ${date}`,
        method: 'manual',
        status: 'pending'
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ msg: "JORNADA FACTURADA COMO BORRADOR CON ÉXITO", type: 'success' });
        
        // Resetear contadores a cero
        const resetCounts: Record<string, number> = {};
        products.forEach((p: any) => {
          resetCounts[p.id] = 0;
        });
        setCounts(resetCounts);

        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus({ msg: "ERROR AL FACTURAR JORNADA", type: 'error' });
      }
    } catch (e) {
      setStatus({ msg: "ERROR AL CONECTAR CON EL SERVIDOR", type: 'error' });
    }
  };

  const ServiceItem = ({ label, id, price }: { label: string, id: string, price: number }) => (
    <div className="flex items-center justify-between p-3 border border-primary/20 bg-black/20">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-primary font-bold">{label}</div>
        <div className="text-xs font-mono text-gray-400">${price} c/u</div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => handleDec(id)} className="w-8 h-8 flex items-center justify-center border border-primary/40 hover:bg-primary/20 text-primary transition-colors">
          <Minus size={14} />
        </button>
        <span className="font-mono text-xl w-6 text-center">{counts[id] || 0}</span>
        <button onClick={() => handleInc(id)} className="w-8 h-8 flex items-center justify-center border border-primary/40 hover:bg-primary/20 text-primary transition-colors">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="os-card mb-8 border-primary/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Scissors size={120} />
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-2xl font-black text-primary tracking-tighter uppercase italic flex items-center gap-2">
          <Scissors size={24} /> TERMINAL DE CARGA: {businessName.toUpperCase()}
        </h2>
        <div className="flex items-center gap-4">
          <label className="text-[10px] text-primary/70 uppercase tracking-widest font-bold">FECHA DE JORNADA:</label>
          <input 
            type="date" 
            className="os-input text-[12px] py-1 font-mono"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {status && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-3 mb-6 border ${status.type === 'success' ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-red-500/50 bg-red-500/10 text-red-500'} text-[10px] font-bold uppercase tracking-widest relative z-10`}
        >
          {status.msg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {products.map((prod: any, idx: number) => (
          <ServiceItem 
            key={prod.id || idx} 
            label={`${idx + 1}. ${prod.name}`} 
            id={prod.id} 
            price={prod.price} 
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-primary/20 pt-6 relative z-10">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary/50 font-bold mb-1">TOTAL RECAUDADO ESTIMADO</div>
          <div className="text-4xl font-mono text-primary">${total.toLocaleString('es-AR')}</div>
        </div>
        
        <button 
          onClick={generateGlobalInvoice}
          className="bg-primary text-black font-black uppercase tracking-[0.2em] px-8 py-4 hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
        >
          REGISTRAR JORNADA Y FACTURAR A CONS. FINAL
        </button>
      </div>
    </div>
  );
}
