import { Plus, Edit2, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function ClientManagement() {
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedClientAccount, setSelectedClientAccount] = useState<any | null>(null);

  const [newClient, setNewClient] = useState({ name: '', cuit: '', rate: '' });
  const [errors, setErrors] = useState<{name?: string, cuit?: string, rate?: string}>({});

  const fetchClientsAndInvoices = async () => {
    try {
      const resClients = await fetch("/api/clients");
      const dataClients = await resClients.json();
      if (Array.isArray(dataClients)) setClients(dataClients);

      const resInvoices = await fetch("/api/invoices");
      const dataInvoices = await resInvoices.json();
      if (Array.isArray(dataInvoices)) setInvoices(dataInvoices);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClientsAndInvoices();
  }, []);

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

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        name: newClient.name.toUpperCase().trim(), 
        cuit: newClient.cuit.replace(/[^0-9]/g, ''), 
        rate: Number(newClient.rate), 
        active: true 
      };

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchClientsAndInvoices();
        setShowModal(false);
        setNewClient({ name: '', cuit: '', rate: '' });
        setErrors({});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClient = async (id: any) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) return;
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchClientsAndInvoices();
      }
    } catch (err) {
      console.error(err);
    }
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
                <button 
                  onClick={() => setSelectedClientAccount(client)}
                  className="text-[10px] border border-primary/30 px-3 py-1 uppercase tracking-widest hover:bg-white/5 transition-colors text-primary/70 cursor-pointer"
                >
                  VER CUENTA CORRIENTE
                </button>
                <button 
                  onClick={() => handleDeleteClient(client.id)}
                  className="p-2 border border-red-900/40 hover:bg-red-900/20 transition-colors text-red-500/50 hover:text-red-500 cursor-pointer"
                >
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

      <AnimatePresence>
        {selectedClientAccount && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClientAccount(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="os-card w-full max-w-2xl relative z-10 !mb-0 border-primary bg-black/90 p-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-violet-600"></div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-primary font-black tracking-widest italic uppercase">ESTADO DE CUENTA CORRIENTE</h3>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1 block">
                    CLIENTE: {selectedClientAccount.name} | CUIT: {selectedClientAccount.cuit}
                  </span>
                </div>
                <button onClick={() => setSelectedClientAccount(null)} className="text-gray-500 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 mb-6 font-mono text-[11px]">
                {invoices.filter((inv: any) => inv.clientCuit === selectedClientAccount.cuit).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Sin comprobantes facturados</span>
                  </div>
                ) : (
                  invoices
                    .filter((inv: any) => inv.clientCuit === selectedClientAccount.cuit)
                    .map((inv: any) => (
                      <div key={inv.id} className="flex justify-between items-center p-3 border border-white/5 bg-white/5 rounded-xl">
                        <div>
                          <span className="font-bold text-white uppercase block">FACTURA NRO: {inv.voucherNumber ? inv.voucherNumber.toString().padStart(8, '0') : 'BORRADOR'}</span>
                          <span className="text-[9px] text-gray-500 block mt-1">{inv.date} | {inv.description || 'Servicios'}</span>
                        </div>
                        <span className="font-bold text-primary text-sm">${inv.amount?.toLocaleString('es-AR')}</span>
                      </div>
                    ))
                )}
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-mono block">TOTAL FACTURADO ACUMULADO</span>
                  <span className="text-xl font-black text-primary font-mono">
                    ${invoices
                      .filter((inv: any) => inv.clientCuit === selectedClientAccount.cuit)
                      .reduce((acc: number, cur: any) => acc + (cur.amount || 0), 0)
                      .toLocaleString('es-AR')}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedClientAccount(null)}
                  className="os-button flex items-center justify-center py-2 px-6 cursor-pointer"
                >
                  CERRAR EXTRACTO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
