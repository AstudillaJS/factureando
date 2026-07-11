import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Calendar, Trophy, Percent } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function SalesStats() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInvoices(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="os-card text-center py-12 text-xs font-mono text-gray-500 uppercase tracking-widest animate-pulse">
        Calculando estadísticas y ranking...
      </div>
    );
  }

  // 1. Calcular productos más vendidos
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  let totalItemsCount = 0;

  invoices.forEach(inv => {
    // Si la factura contiene items individuales (versión nueva con carrito)
    if (Array.isArray(inv.items)) {
      inv.items.forEach((item: any) => {
        const key = item.id || item.name;
        if (!productSales[key]) {
          productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.quantity * item.price;
        totalItemsCount += item.quantity;
      });
    } else {
      // Fallback para facturas históricas sin desglose de ítems (se asume como un único servicio general)
      const key = "legacy_service";
      if (!productSales[key]) {
        productSales[key] = { name: "Servicios Generales (Histórico)", quantity: 0, revenue: 0 };
      }
      productSales[key].quantity += 1;
      productSales[key].revenue += inv.amount || 0;
      totalItemsCount += 1;
    }
  });

  const sortedProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // 2. Calcular Top 5 Días de Mayor Facturación
  const dailyBilling: Record<string, number> = {};
  invoices.forEach(inv => {
    const rawDate = inv.date || (inv.createdAt ? inv.createdAt.split('T')[0] : null);
    if (rawDate) {
      dailyBilling[rawDate] = (dailyBilling[rawDate] || 0) + (inv.amount || 0);
    }
  });

  const sortedDays = Object.entries(dailyBilling)
    .map(([dateStr, amount]) => ({ dateStr, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // 3. Calcular Ingresos por Mes
  const monthlyBilling: Record<string, number> = {};
  invoices.forEach(inv => {
    const rawDate = inv.date || (inv.createdAt ? inv.createdAt.split('T')[0] : null);
    if (rawDate) {
      const monthKey = rawDate.substring(0, 7); // YYYY-MM
      monthlyBilling[monthKey] = (monthlyBilling[monthKey] || 0) + (inv.amount || 0);
    }
  });

  const sortedMonths = Object.entries(monthlyBilling)
    .map(([monthStr, amount]) => ({ monthStr, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const formatDayName = (dateStr: string) => {
    try {
      const parsed = parseISO(dateStr);
      return format(parsed, "eeee dd 'de' MMMM", { locale: es }).toUpperCase();
    } catch {
      return dateStr;
    }
  };

  const formatMonthName = (monthStr: string) => {
    try {
      const parsed = parseISO(`${monthStr}-01`);
      return format(parsed, "MMMM yyyy", { locale: es }).toUpperCase();
    } catch {
      return monthStr;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-20">
      
      {/* CARD 1: LO MÁS VENDIDO */}
      <div className="os-card mb-0 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Trophy size={14} /> LO MÁS VENDIDO (CANTIDAD)
          </h3>
          <div className="space-y-3">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((p, idx) => {
                const percentage = totalItemsCount > 0 ? Math.round((p.quantity / totalItemsCount) * 100) : 0;
                return (
                  <div key={idx} className="p-3 bg-black/20 rounded-xl border border-primary/5 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-bold text-gray-300 uppercase truncate max-w-[70%]">
                        {idx + 1}. {p.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-primary">
                        {p.quantity} VENTAS
                      </span>
                    </div>
                    {/* Barra de progreso visual */}
                    <div className="w-full bg-primary/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-gray-600 font-mono mt-1">
                      <span>RECAUDACIÓN: ${p.revenue.toLocaleString('es-AR')}</span>
                      <span className="flex items-center gap-0.5"><Percent size={9} />{percentage}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-[10px] font-mono text-gray-600 uppercase">
                Sin datos de ventas registrados
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD 2: DÍAS RÉCORD DE INGRESO */}
      <div className="os-card mb-0 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <TrendingUp size={14} /> JORNADAS RÉCORD (TOP 5 DÍAS)
          </h3>
          <div className="space-y-3">
            {sortedDays.length > 0 ? (
              sortedDays.map((day, idx) => (
                <div key={idx} className="p-3 bg-black/20 rounded-xl border border-primary/5 flex justify-between items-center">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-gray-300 truncate tracking-wide">
                      {idx + 1}. {formatDayName(day.dateStr)}
                    </div>
                    <div className="text-[9px] font-mono text-gray-600 mt-0.5">FECHA: {day.dateStr}</div>
                  </div>
                  <span className="text-sm font-mono font-black text-primary ml-2">
                    ${day.amount.toLocaleString('es-AR')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[10px] font-mono text-gray-600 uppercase">
                Sin datos de facturación diaria
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD 3: RANKING DE INGRESOS MENSUALES */}
      <div className="os-card mb-0 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Calendar size={14} /> INGRESOS POR MES (RANKING)
          </h3>
          <div className="space-y-3">
            {sortedMonths.length > 0 ? (
              sortedMonths.map((m, idx) => (
                <div key={idx} className="p-3 bg-black/20 rounded-xl border border-primary/5 flex justify-between items-center">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-gray-300 truncate uppercase tracking-widest">
                      {idx + 1}. {formatMonthName(m.monthStr)}
                    </div>
                    <div className="text-[9px] font-mono text-gray-600 mt-0.5">PERÍODO: {m.monthStr}</div>
                  </div>
                  <span className="text-sm font-mono font-black text-primary ml-2">
                    ${m.amount.toLocaleString('es-AR')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[10px] font-mono text-gray-600 uppercase">
                Sin datos de facturación mensual
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
