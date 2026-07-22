import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Search, Plus, Minus, Trash2, Tag, Calendar, User, FileText, CheckCircle2 } from "lucide-react";

const DEFAULT_PRODUCTS = [
  { id: "corteCabello", name: "Corte de Cabello", price: 22000 },
  { id: "perfiladoCejas", name: "Perfilado de Cejas", price: 15000 },
  { id: "recorteBarba", name: "Recorte de Barba", price: 22000 },
  { id: "afeitadoTradicional", name: "Afeitado Tradicional", price: 22000 },
  { id: "completoDeluxe", name: "Completo Deluxe", price: 44000 },
  { id: "cortePerfilado", name: "Corte + Perfilado", price: 33000 }
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function BarberPOS() {
  const [config, setConfig] = useState<any>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientCuit, setSelectedClientCuit] = useState("0");
  const [customDescription, setCustomDescription] = useState("");
  const [status, setStatus] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [inflationRates, setInflationRates] = useState<any[]>([]);
  const [suggestedIncrease, setSuggestedIncrease] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
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
      })
      .catch(console.error);

    fetch("/api/clients")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClients(data);
      })
      .catch(console.error);

    fetch("/api/invoices")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInvoices(data);
      })
      .catch(console.error);

    fetch("/api/inflation")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInflationRates(data);
      })
      .catch(console.error);
  }, []);



  const businessName = config.businessName || "Barbería";
  const products = config.posProducts || DEFAULT_PRODUCTS;

  // Filtrar catálogo por término de búsqueda
  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  useEffect(() => {
    if (selectedClientCuit === "0" || total <= 0) {
      setSuggestedIncrease(null);
      return;
    }

    const amt = total;
    const previousInvoices = invoices.filter(
      (inv: any) => inv.clientCuit === selectedClientCuit && Math.abs(inv.amount - amt) < 10
    );

    if (previousInvoices.length > 0) {
      const sorted = [...previousInvoices].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastInvoice = sorted[0];

      const lastDate = new Date(lastInvoice.date);
      const currentDate = new Date(date);
      const monthsDiff = (currentDate.getFullYear() - lastDate.getFullYear()) * 12 + (currentDate.getMonth() - lastDate.getMonth());

      if (monthsDiff > 0) {
        let accumulatedInflation = 0;
        for (let i = 0; i < monthsDiff; i++) {
          const checkMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + i + 1, 1);
          const rateObj = inflationRates.find(
            (r: any) => r.year === checkMonth.getFullYear() && r.month === (checkMonth.getMonth() + 1)
          );
          accumulatedInflation += rateObj ? rateObj.rate : 4.0;
        }

        if (accumulatedInflation > 0) {
          const suggestedAmount = amt * (1 + accumulatedInflation / 100);
          setSuggestedIncrease({
            lastDate: lastInvoice.date,
            rate: accumulatedInflation.toFixed(1),
            suggested: Math.round(suggestedAmount)
          });
          return;
        }
      }
    }
    setSuggestedIncrease(null);
  }, [total, selectedClientCuit, date, invoices, inflationRates]);

  const handleInvoiceSubmit = async (methodType: 'draft' | 'afip') => {
    if (cart.length === 0) {
      setStatus({ msg: "EL CARRITO ESTÁ VACÍO", type: 'error' });
      return;
    }

    // Validación de límites de consumidor final para AFIP
    if (selectedClientCuit === "0" && total > 344000) {
      setStatus({ msg: "MONTO EXCEDE EL LÍMITE AFIP PARA CONSUMIDOR FINAL ($344.000)", type: 'error' });
      return;
    }

    try {
      const clientObj = clients.find(c => c.cuit === selectedClientCuit);
      const payload = {
        amount: total,
        date: date,
        type: selectedClientCuit === '0' ? 'C' : 'A',
        clientCuit: selectedClientCuit,
        clientName: selectedClientCuit === '0' ? 'CONSUMIDOR FINAL' : (clientObj?.name || 'CLIENTE'),
        description: customDescription || `Venta de ${businessName} - ${date}`,
        method: methodType === 'afip' ? 'automatic' : 'manual',
        status: methodType === 'afip' ? 'emitted' : 'pending',
        items: cart
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus({ 
          msg: methodType === 'afip' ? "FACTURA EMITIDA Y APROBADA POR AFIP CON ÉXITO" : "BORRADOR GUARDADO CORRECTAMENTE EN EL REGISTRO", 
          type: 'success' 
        });
        clearCart();
        setCustomDescription("");
        setTimeout(() => setStatus(null), 5000);
      } else {
        setStatus({ msg: data.error || "ERROR AL REGISTRAR COMPROBANTE", type: 'error' });
      }
    } catch (e) {
      setStatus({ msg: "ERROR AL CONECTAR CON EL SERVIDOR DE FACTURACIÓN", type: 'error' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 relative z-20">
      
      {/* SECCIÓN IZQUIERDA: CATÁLOGO DE PRODUCTOS (8 cols) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
        <div className="os-card flex-1 mb-0 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-primary tracking-tighter uppercase italic flex items-center gap-2">
                <ShoppingCart size={22} className="text-primary" /> POS: {businessName.toUpperCase()}
              </h2>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1">SELECCIONA ARTÍCULOS PARA FACTURAR</p>
            </div>
            
            {/* Buscador de Productos */}
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                placeholder="BUSCAR EN CATÁLOGO..." 
                className="os-input pl-9 text-[11px] py-2 w-full font-mono"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Grilla de productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto max-h-[460px] pr-1">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod: any, idx: number) => (
                <button
                  key={prod.id || idx}
                  onClick={() => addToCart(prod)}
                  className="flex flex-col justify-between items-start p-4 bg-black/20 border border-primary/10 hover:border-primary/50 rounded-xl hover:bg-primary/[0.02] active:scale-95 transition-all text-left group h-[100px]"
                >
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wide group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {prod.name}
                  </span>
                  <div className="flex justify-between items-center w-full mt-2">
                    <span className="text-xs font-mono font-black text-primary">${prod.price.toLocaleString('es-AR')}</span>
                    <span className="text-[9px] uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold group-hover:bg-primary group-hover:text-black transition-all">
                      + AGREGAR
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-xs font-mono text-gray-600 uppercase tracking-widest border border-dashed border-primary/10 rounded-xl">
                Ningún producto coincide con la búsqueda
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: CARRITO DE COMPRAS (4 cols) */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
        <div className="os-card flex-1 mb-0 flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex justify-between items-center border-b border-primary/10 pb-3 mb-4">
              <span className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                <ShoppingCart size={14} /> DETALLE DE FACTURA
              </span>
              <button 
                onClick={clearCart} 
                className="text-[9px] uppercase tracking-widest text-red-400 hover:text-red-500 font-bold transition-colors"
                disabled={cart.length === 0}
              >
                VACIAR
              </button>
            </div>

            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 mb-4 border ${status.type === 'success' ? 'border-green-500/30 bg-green-500/5 text-green-500' : 'border-red-500/30 bg-red-500/5 text-red-500'} text-[9px] font-mono rounded-lg uppercase tracking-tight`}
              >
                {status.msg}
              </motion.div>
            )}

            {/* Listado de items en el carrito */}
            <div className="space-y-2 overflow-y-auto max-h-[220px] mb-4 pr-1">
              <AnimatePresence initial={false}>
                {cart.length > 0 ? (
                  cart.map(item => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between p-2.5 bg-black/35 rounded-xl border border-primary/5"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="text-[10px] font-bold text-gray-300 truncate uppercase tracking-wide leading-tight">{item.name}</div>
                        <div className="text-[9px] font-mono text-gray-600 mt-0.5">${item.price.toLocaleString('es-AR')} c/u</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQty(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="font-mono text-xs w-4 text-center font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded transition-colors ml-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-700">
                    <Tag size={28} className="text-gray-800 mb-2" />
                    <p className="text-[10px] font-mono uppercase tracking-widest">CARRITO VACÍO</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* CONFIGURACIÓN Y EMISIÓN (FIJO ABAJO) */}
          <div className="border-t border-primary/10 pt-4 mt-auto space-y-4">
            
            {/* Fecha y Cliente */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-1 block flex items-center gap-1">
                  <Calendar size={10} /> FECHA
                </label>
                <input 
                  type="date" 
                  className="os-input py-1.5 px-2 text-[10px] font-mono rounded-lg w-full"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-1 block flex items-center gap-1">
                  <User size={10} /> CLIENTE
                </label>
                <select 
                  className="os-input py-1.5 px-2 text-[10px] font-mono rounded-lg w-full"
                  value={selectedClientCuit}
                  onChange={e => setSelectedClientCuit(e.target.value)}
                >
                  <option value="0">CONS. FINAL</option>
                  {clients.map(c => (
                    <option key={c.cuit} value={c.cuit}>{c.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción personalizada */}
            <div>
              <label className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-1 block flex items-center gap-1">
                <FileText size={10} /> DESCRIPCIÓN DE FACTURA (OPCIONAL)
              </label>
              <input 
                type="text" 
                placeholder={`SERVICIOS DE ${businessName.toUpperCase()}`}
                className="os-input py-1.5 px-3 text-[10px] font-mono rounded-lg w-full"
                value={customDescription}
                onChange={e => setCustomDescription(e.target.value)}
              />
            </div>

            {suggestedIncrease && (
              <div className="p-3 border border-amber-500/30 bg-amber-500/5 text-amber-500 rounded-xl space-y-1 text-[9px] font-mono leading-relaxed">
                <span className="font-bold uppercase block text-primary">⚠️ ALERTA DE AJUSTE POR INFLACIÓN</span>
                <span>Mismo importe cobrado el {suggestedIncrease.lastDate}.</span>
                <span className="block text-white">Inflación acumulada: <span className="text-amber-500 font-bold">+{suggestedIncrease.rate}%</span></span>
                <span className="block mt-1 font-bold text-white">Sugerido para mantener valor: <span className="text-primary font-black">${suggestedIncrease.suggested.toLocaleString('es-AR')}</span></span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center py-2 bg-primary/[0.02] border border-primary/5 rounded-xl px-4">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">TOTAL A COBRAR</span>
              <span className="text-xl font-mono font-black text-primary">${total.toLocaleString('es-AR')}</span>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => handleInvoiceSubmit('draft')}
                disabled={cart.length === 0}
                className="border border-primary/20 text-primary py-2.5 rounded-xl uppercase tracking-widest text-[9px] font-bold hover:bg-primary/10 transition-all duration-200 disabled:opacity-30"
              >
                REGISTRAR BORRADOR
              </button>
              
              <button 
                onClick={() => handleInvoiceSubmit('afip')}
                disabled={cart.length === 0}
                className="bg-primary text-black py-2.5 rounded-xl uppercase tracking-[0.15em] text-[9px] font-black hover:bg-primary/90 transition-all duration-200 shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-1"
              >
                <CheckCircle2 size={11} /> EMITIR EN AFIP
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
