import { Plus, Edit2, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function ClientManagement() {
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const [newClient, setNewClient] = useState({ name: '', cuit: '', rate: '' });
  const [errors, setErrors] = useState<{name?: string, cuit?: string, rate?: string}>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!newClient.name.trim()) newErrors.name = "El nombre es requerido";
    
    const cuitClean = newClient.cuit.replace(/[^0-9]/g, '');
    if (cuitClean.length !== 11) {
      newErrors.cuit = "El CUIT debe tener 11 dígitos";
    }

    if (!newClient.rate || Number(newClient.rate) <= 0) {
      newErrors.rate = "La tarifa debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const id = clients.length + 1;
    setClients([...clients, { 
      id, 
      name: newClient.name.toUpperCase().trim(), 
      cuit: newClient.cuit.replace(/[^0-9]/g, ''), 
      rate: Number(newClient.rate), 
      active: true 
    }]);
    setShowModal(false);
    setNewClient({ name: '', cuit: '', rate: '' });
    setErrors({});
  };

  return (
    <div className="os-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="os-section-title !mb-0 text-primary uppercase italic">5. GESTIÓN DE CLIENTES</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="os-button flex items-center gap-2 !px-4 py-1 text-xs"
        >
          <Plus size={16} /> NUEVO CLIENTE
        </button>
      </div>

      <div className="space-y-4">
        {clients.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-primary/20 rounded-sm">
            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">NO HAY CLIENTES REGISTRADOS</span>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="border border-border-amber/50 p-4 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-primary shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-widest uppercase">{client.name}</span>
                    <span className="text-[8px] text-primary/50 uppercase tracking-widest font-bold">[{client.active ? 'ACTIVO' : 'INACTIVO'}]</span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase mt-1">
                    CUIT: {client.cuit} | TARIFA: ${client.rate}/hs
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-[10px] border border-primary/30 px-3 py-1 uppercase tracking-widest hover:bg-white/5 transition-colors text-primary/70">USAR ESTE</button>
                <button className="p-2 border border-primary/30 hover:bg-primary/10 transition-colors text-gray-400 group-hover:text-primary">
                  <Edit2 size={14} />
                </button>
                <button className="p-2 border border-red-900/40 hover:bg-red-900/20 transition-colors text-red-500/50 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="os-card w-full max-w-md relative z-10 !mb-0 border-primary"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-primary font-black tracking-widest italic">NUEVO EXPEDIENTE DE CLIENTE</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">NOMBRE O RAZÓN SOCIAL</label>
                  <input 
                    required
                    type="text" 
                    className={`os-input font-bold ${errors.name ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}`}
                    value={newClient.name}
                    onChange={e => setNewClient({...newClient, name: e.target.value})}
                  />
                  {errors.name && <span className="text-[9px] text-red-500 uppercase font-bold mt-1 block">{errors.name}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">CUIT (SÓLO NÚMEROS)</label>
                    <input 
                      required
                      type="text" 
                      className={`os-input font-mono ${errors.cuit ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}`}
                      placeholder="11 DÍGITOS"
                      value={newClient.cuit}
                      onChange={e => setNewClient({...newClient, cuit: e.target.value})}
                    />
                    {errors.cuit && <span className="text-[9px] text-red-500 uppercase font-bold mt-1 block">{errors.cuit}</span>}
                  </div>
                  <div>
                    <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">TARIFA (ARS/HS)</label>
                    <input 
                      required
                      type="number" 
                      className={`os-input font-mono ${errors.rate ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}`}
                      value={newClient.rate}
                      onChange={e => setNewClient({...newClient, rate: e.target.value})}
                    />
                    {errors.rate && <span className="text-[9px] text-red-500 uppercase font-bold mt-1 block">{errors.rate}</span>}
                  </div>
                </div>
                <button type="submit" className="os-button w-full py-4 mt-4 font-black">REGISTRAR CLIENTE</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
