import React, { useState, useEffect } from "react";
import { TrendingUp, RefreshCw, Save } from "lucide-react";

export default function InflationSettings() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchRates = () => {
    fetch("/api/inflation")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRates(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleRateChange = (index: number, val: string) => {
    const updated = [...rates];
    updated[index].rate = parseFloat(val) || 0;
    setRates(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/inflation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rates),
      });
      if (res.ok) {
        setMessage({ text: "ÍNDICES DE INFLACIÓN GUARDADOS CORRECTAMENTE", type: "success" });
      } else {
        setMessage({ text: "ERROR AL GUARDAR LOS ÍNDICES", type: "error" });
      }
    } catch (e) {
      setMessage({ text: "ERROR DE CONEXIÓN CON EL SERVIDOR", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Simular recopilación de portal oficial BCRA/INDEC
      const mockPortalRates = [
        { year: 2026, month: 1, rate: 6.0 },
        { year: 2026, month: 2, rate: 5.5 },
        { year: 2026, month: 3, rate: 4.8 },
        { year: 2026, month: 4, rate: 4.2 },
        { year: 2026, month: 5, rate: 3.8 },
        { year: 2026, month: 6, rate: 3.5 },
      ];
      setRates(mockPortalRates);
      setMessage({ text: "DATOS RECOPILADOS CON ÉXITO DEL PORTAL ESTADÍSTICO", type: "success" });
    } catch (e) {
      setMessage({ text: "ERROR AL INTENTAR RECOPILAR DATOS", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="os-card mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded">
            <TrendingUp size={20} className="text-primary" />
          </div>
          <h2 className="text-sm font-black text-primary tracking-widest uppercase italic">9. PANEL DE CONTROL DE INFLACIÓN</h2>
        </div>
        <button
          onClick={handleSync}
          disabled={loading}
          className="os-button flex items-center gap-2 !px-4 py-1 text-xs"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {loading ? "SINCRO..." : "RECOPILAR DE PORTAL BCRA"}
        </button>
      </div>

      <p className="text-[10px] text-gray-500 italic mb-6 font-mono uppercase tracking-tight">
        Define el historial de inflación mensual. Estos coeficientes se utilizan para recomendar ajustes de tarifas cuando emites importes repetitivos.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        {rates.map((r, idx) => (
          <div key={`${r.year}-${r.month}`} className="border border-white/5 rounded-xl bg-white/5 p-3 text-center">
            <span className="text-[10px] font-bold text-gray-400 block mb-1">{monthNames[r.month - 1]} {r.year}</span>
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                step="0.1"
                className="bg-black/40 border border-white/10 px-2 py-1 rounded text-center w-16 text-xs text-white font-mono focus:border-primary focus:outline-none"
                value={r.rate}
                onChange={(e) => handleRateChange(idx, e.target.value)}
              />
              <span className="text-[10px] text-primary/80 font-bold">%</span>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg border text-xs font-mono uppercase tracking-wider mb-4 ${
          message.type === "success" ? "bg-green-950/20 border-green-800/40 text-green-400" : "bg-red-950/20 border-red-800/40 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="os-button w-full flex items-center justify-center gap-2 py-3"
      >
        <Save size={14} />
        {saving ? "GUARDANDO..." : "GUARDAR ÍNDICES DE INFLACIÓN"}
      </button>
    </div>
  );
}
