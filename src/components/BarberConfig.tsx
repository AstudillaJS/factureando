import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Scissors, Plus, Trash2 } from "lucide-react";

const DEFAULT_PRODUCTS = [
  { id: "corteCabello", name: "Corte de Cabello", price: 22000 },
  { id: "perfiladoCejas", name: "Perfilado de Cejas", price: 15000 },
  { id: "recorteBarba", name: "Recorte de Barba", price: 22000 },
  { id: "afeitadoTradicional", name: "Afeitado Tradicional", price: 22000 },
  { id: "completoDeluxe", name: "Completo Deluxe", price: 44000 },
  { id: "cortePerfilado", name: "Corte + Perfilado", price: 33000 }
];

export default function BarberConfig() {
  const [config, setConfig] = useState<any>({});
  const [status, setStatus] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      
      // Migración inteligente: mapear los precios antiguos a la nueva estructura si no existe posProducts
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
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateProductField = (index: number, field: 'name' | 'price', value: string) => {
    setConfig((prev: any) => {
      const updatedProducts = [...(prev.posProducts || [])];
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: field === 'price' ? Number(value) : value
      };
      return {
        ...prev,
        posProducts: updatedProducts
      };
    });
  };

  const addProduct = () => {
    setConfig((prev: any) => ({
      ...prev,
      posProducts: [
        ...(prev.posProducts || []),
        { id: `prod_${Date.now()}`, name: "Nuevo Producto/Servicio", price: 0 }
      ]
    }));
  };

  const removeProduct = (index: number) => {
    setConfig((prev: any) => {
      const updatedProducts = [...(prev.posProducts || [])];
      updatedProducts.splice(index, 1);
      return {
        ...prev,
        posProducts: updatedProducts
      };
    });
  };

  const saveConfig = async () => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ msg: "CONFIGURACIÓN GUARDADA CORRECTAMENTE", type: 'success' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus({ msg: "ERROR AL GUARDAR", type: 'error' });
      }
    } catch (e) {
      setStatus({ msg: "ERROR AL CONECTAR CON EL SERVIDOR", type: 'error' });
    }
  };

  const businessName = config.businessName || "Barbería";
  const products = config.posProducts || [];

  return (
    <div className="os-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="os-section-title !mb-0 text-primary uppercase italic flex items-center gap-2">
          <Scissors size={20} /> CONFIGURACIÓN PRECIOS: {businessName.toUpperCase()}
        </h2>
      </div>

      {status && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-3 mb-6 border ${status.type === 'success' ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-red-500/50 bg-red-500/10 text-red-500'} text-[10px] font-bold uppercase tracking-widest`}
        >
          {status.msg}
        </motion.div>
      )}

      {/* Business Name Field */}
      <div className="mb-6 bg-black/10 p-4 border border-primary/20 rounded-sm">
        <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">Nombre del Negocio / Rubro Comercial</label>
        <input 
          type="text" 
          className="os-input font-mono" 
          value={businessName} 
          onChange={(e) => setConfig((prev: any) => ({ ...prev, businessName: e.target.value }))}
          placeholder="Ej. Barbería, Cafetería, Almacén, Kiosco"
        />
      </div>

      {/* Dynamic Products list */}
      <h3 className="text-[10px] text-primary/70 uppercase tracking-[0.2em] mb-4 font-bold">LISTADO DE PRODUCTOS / SERVICIOS</h3>
      
      <div className="space-y-3">
        {products.map((prod: any, idx: number) => (
          <div key={prod.id || idx} className="flex gap-4 items-end bg-black/10 p-3 border border-primary/10 rounded-sm">
            <div className="flex-1">
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Nombre</label>
              <input 
                type="text" 
                className="os-input" 
                value={prod.name} 
                onChange={(e) => updateProductField(idx, 'name', e.target.value)} 
              />
            </div>
            <div className="w-32">
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Precio ($)</label>
              <input 
                type="number" 
                className="os-input font-mono" 
                value={prod.price} 
                onChange={(e) => updateProductField(idx, 'price', e.target.value)} 
              />
            </div>
            <button 
              onClick={() => removeProduct(idx)}
              className="os-button !border-red-500/40 text-red-500 hover:bg-red-500 hover:text-black py-3 px-3 flex items-center justify-center gap-1"
              title="Eliminar"
            >
              <Trash2 size={12} />
              <span className="hidden sm:inline">ELIMINAR</span>
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={addProduct}
        className="os-button border-dashed border-primary/30 text-primary/70 hover:bg-primary/5 w-full mt-4 flex items-center justify-center gap-2"
      >
        <Plus size={14} /> AGREGAR PRODUCTO O SERVICIO
      </button>

      <div className="mt-8 border-t border-primary/20 pt-6">
        <button onClick={saveConfig} className="w-full py-4 border border-primary text-xs font-bold tracking-[0.4em] uppercase hover:bg-primary/5 transition-colors">
          GUARDAR CONFIGURACIÓN Y PRECIOS
        </button>
      </div>
    </div>
  );
}
