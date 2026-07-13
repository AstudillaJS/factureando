import React, { useState, useEffect, useRef } from "react";
import { UserCheck, ChevronDown, PlusCircle, Building2, Trash2, SwitchCamera } from "lucide-react";

export default function ProfileSwitcher() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchProfilesData = () => {
    // Cargar perfil activo
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        setActiveProfile(data);
      })
      .catch(console.error);

    // Cargar todos los perfiles
    fetch("/api/profiles")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProfiles(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchProfilesData();

    // Cerrar dropdown al hacer click afuera
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchProfile = async (id: string) => {
    try {
      const res = await fetch("/api/profiles/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        window.location.reload(); // Recargar para aplicar tema, facturas y productos
      }
    } catch (e) {
      console.error("Error switching profile:", e);
    }
  };

  const handleAddNew = () => {
    setIsOpen(false);
    if (typeof (window as any).showOnboardingWizard === "function") {
      (window as any).showOnboardingWizard();
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      alert("No podés eliminar el único perfil de contribuyente activo.");
      return;
    }
    if (!confirm("¿Estás seguro de que querés eliminar este contribuyente? Se borrarán sus configuraciones y productos del POS.")) {
      return;
    }

    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchProfilesData();
        if (activeProfile?.id === id) {
          window.location.reload();
        }
      }
    } catch (e) {
      console.error("Error deleting profile:", e);
    }
  };

  if (!activeProfile) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Trigger Selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 hover:border-primary/50 rounded-xl transition-all duration-300 text-left cursor-pointer active:scale-98 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
          <Building2 size={16} />
        </div>
        <div className="hidden sm:block">
          <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest block font-bold leading-tight">CONTRIBUYENTE ACTIVO</span>
          <span className="text-xs font-black text-primary uppercase tracking-tight block max-w-[150px] truncate leading-tight">
            {activeProfile.businessName || "SIN CONFIGURAR"}
          </span>
        </div>
        <ChevronDown size={14} className={`text-primary/70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu Glassmorphism */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-black/85 backdrop-blur-2xl border border-primary/20 rounded-xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[999]">
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest p-2 block border-b border-white/5 mb-1.5 font-bold">
            SELECCIONAR CONTRIBUYENTE
          </span>
          
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {profiles.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSwitchProfile(p.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 border text-left ${
                  activeProfile.id === p.id 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-transparent border-transparent hover:bg-white/5 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-black ${
                    activeProfile.id === p.id ? "bg-primary/20 border-primary/30" : "bg-black/20 border-white/5"
                  }`}>
                    {p.businessName ? p.businessName.substring(0,2).toUpperCase() : "CF"}
                  </div>
                  <div className="truncate">
                    <span className="text-[11px] font-bold uppercase block truncate leading-tight">{p.businessName || "Negocio sin nombre"}</span>
                    <span className="text-[9px] font-mono text-gray-500 block mt-0.5">CUIT: {p.afipCuit || "S/D"}</span>
                  </div>
                </div>
                
                {profiles.length > 1 && (
                  <button 
                    onClick={(e) => handleDelete(e, p.id)}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 mt-2 pt-2">
            <button
              onClick={handleAddNew}
              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-primary/30 hover:border-primary text-primary hover:bg-primary/10 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all"
            >
              <PlusCircle size={12} /> AÑADIR CONTRIBUYENTE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
