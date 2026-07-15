import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, Building2, User, Key, CheckCircle, Upload, Play, Palette } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface OnboardingWizardProps {
  onComplete: (updatedConfig: any) => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { setThemeColor, setTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [cuit, setCuit] = useState("");
  const [category, setCategory] = useState("A");
  const [puntoVenta, setPuntoVenta] = useState("1");
  const [invoiceLogo, setInvoiceLogo] = useState("");
  const [themeColor, setThemeColorVal] = useState("");
  const [useHomologation, setUseHomologation] = useState(true);
  const [crtPath, setCrtPath] = useState("");
  const [keyPath, setKeyPath] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [existingProfiles, setExistingProfiles] = useState<any[]>([]);
  const [importFromProfileId, setImportFromProfileId] = useState<string>("none");

  useEffect(() => {
    fetch("/api/profiles")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExistingProfiles(data);
        }
      })
      .catch(console.error);
  }, []);

  // Extraer color dominante del logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64Data = event.target.result as string;
        setInvoiceLogo(base64Data);

        const img = new Image();
        img.src = base64Data;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, 1, 1);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            const hex = "#" + [r, g, b].map(x => {
              const hexStr = x.toString(16);
              return hexStr.length === 1 ? "0" + hexStr : hexStr;
            }).join("");

            setThemeColorVal(hex);
            setThemeColor(hex);
            setTheme("brand");
          }
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (step === 1 && !businessName.trim()) {
      setStatus("POR FAVOR INGRESA EL NOMBRE DE TU NEGOCIO");
      return;
    }
    if (step === 2 && (!cuit.trim() || cuit.length !== 11)) {
      setStatus("INGRESA UN CUIT VÁLIDO DE 11 DÍGITOS (SIN GUIONES)");
      return;
    }
    setStatus(null);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStatus(null);
    setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    try {
      let importedProducts: any[] = [];
      let importedPrices: any = null;
      
      if (importFromProfileId && importFromProfileId !== "none") {
        const sourceProfile = existingProfiles.find(p => p.id === importFromProfileId);
        if (sourceProfile) {
          importedProducts = sourceProfile.posProducts || [];
          importedPrices = sourceProfile.barberPrices || null;
        }
      }

      const payload = {
        businessName,
        afipCuit: cuit,
        monotributoCategory: category,
        puntoVenta: parseInt(puntoVenta) || 1,
        invoiceLogo,
        themeColor,
        afipProduction: !useHomologation,
        theme: themeColor ? "brand" : "cyberpunk",
        posProducts: importedProducts,
        barberPrices: importedPrices
      };

      // Si ya hay perfiles creados, llamamos a POST /api/profiles (alta de contribuyente nuevo)
      // de lo contrario, llamamos a POST /api/config (configuración inicial del primer perfil)
      const endpoint = existingProfiles.length > 0 ? "/api/profiles" : "/api/config";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onComplete(payload);
      } else {
        setStatus(data.message || "ERROR AL GUARDAR EL CONTRIBUYENTE");
      }
    } catch (e) {
      setStatus("ERROR DE CONEXIÓN CON EL SERVIDOR LOCAL");
    }
  };

  const stepsList = [
    { title: "NEGOCIO", icon: <Building2 size={16} /> },
    { title: "FISCAL", icon: <User size={16} /> },
    { title: "CONEXIÓN AFIP", icon: <Key size={16} /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-2xl z-[9999] flex items-center justify-center p-4">
      {/* Background ambient glow spots inside wizard */}
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-violet-500/5 blur-[80px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="os-card max-w-xl w-full border-primary/50 relative overflow-hidden bg-black/60 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-500 to-primary"></div>
        
        {/* Wizard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-primary tracking-tighter uppercase italic flex items-center gap-2">
              <Sparkles size={20} /> BIENVENIDO A FACTUREANDO
            </h2>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1">ASISTENTE DE CONFIGURACIÓN INICIAL</p>
          </div>
          <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
            PASO {step} DE 3
          </span>
        </div>

        {/* Step Progress indicators */}
        <div className="flex gap-2 mb-8">
          {stepsList.map((s, idx) => (
            <div 
              key={idx} 
              className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl font-mono text-[9px] uppercase tracking-wider font-bold transition-all duration-300 ${
                step === idx + 1 
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(245,158,11,0.1)]" 
                  : idx + 1 < step 
                    ? "bg-primary/5 border-primary/30 text-primary/70"
                    : "bg-black/20 border-white/5 text-gray-600"
              }`}
            >
              {s.icon} {s.title}
            </div>
          ))}
        </div>

        {status && (
          <div className="p-3 mb-6 border border-red-500/30 bg-red-500/5 text-red-500 text-[10px] font-mono rounded-xl uppercase tracking-tight">
            {status}
          </div>
        )}

        {/* Wizard Steps Content */}
        <div className="min-h-[220px] flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-[10px] text-primary/80 uppercase tracking-widest font-bold mb-2 block">NOMBRE COMERCIAL / TITULAR</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Mi Cafetería, Dr. Juan Pérez" 
                    className="os-input font-mono uppercase"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    required
                  />
                  <p className="text-[9px] text-gray-500 font-mono mt-1">* Se utilizará para personalizar las pantallas y facturas.</p>
                </div>

                <div className="p-4 border border-white/5 rounded-xl bg-black/25 flex items-center gap-4 justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-primary/80 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Palette size={12} /> LOGOTIPO DE MARCA (OPCIONAL)
                    </span>
                    <p className="text-[9px] text-gray-500 font-mono">Extraerá automáticamente la paleta de colores cromática de tu negocio.</p>
                  </div>
                  <label className="border border-dashed border-primary/30 hover:border-primary px-4 py-2 text-[9px] uppercase tracking-widest font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload size={12} /> {invoiceLogo ? "CAMBIAR" : "SUBIR LOGO"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>

                {invoiceLogo && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <img src={invoiceLogo} alt="Logo" className="w-10 h-10 object-contain rounded-lg border border-primary/20" />
                    <div>
                      <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest block">¡LOGO CARGADO CON ÉXITO!</span>
                      <span className="text-[9px] font-mono text-gray-500 uppercase block">COLOR DE TEMA DETECTADO: <span style={{ color: themeColor }} className="font-bold">{themeColor}</span></span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-primary/80 uppercase tracking-widest font-bold mb-2 block">CUIT (11 DÍGITOS)</label>
                    <input 
                      type="text" 
                      maxLength={11}
                      placeholder="20369106539" 
                      className="os-input font-mono"
                      value={cuit}
                      onChange={e => setCuit(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-primary/80 uppercase tracking-widest font-bold mb-2 block">PUNTO DE VENTA AFIP</label>
                    <input 
                      type="number" 
                      min={1}
                      className="os-input font-mono"
                      value={puntoVenta}
                      onChange={e => setPuntoVenta(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-primary/80 uppercase tracking-widest font-bold mb-2 block">CATEGORÍA DE MONOTRIBUTO</label>
                  <select 
                    className="os-input font-mono"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].map(cat => (
                      <option key={cat} value={cat}>CATEGORÍA {cat}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-gray-500 font-mono mt-1.5">* Requerida para verificar tus escalas y límites de ingresos automáticos.</p>
                </div>

                {existingProfiles.length > 0 && (
                  <div className="p-4 border border-primary/20 rounded-xl bg-primary/5 space-y-3">
                    <div>
                      <label className="text-[10px] text-primary/80 uppercase tracking-widest font-bold mb-1.5 block">
                        IMPORTAR PRODUCTOS Y PRECIOS (OPCIONAL)
                      </label>
                      <select
                        className="os-input font-mono text-xs cursor-pointer"
                        value={importFromProfileId}
                        onChange={e => setImportFromProfileId(e.target.value)}
                      >
                        <option value="none">NO, EMPEZAR CON DATOS EN CERO (NUEVO CONTRIBUYENTE)</option>
                        {existingProfiles.map(p => (
                          <option key={p.id} value={p.id}>
                            IMPORTAR DESDE: {p.businessName.toUpperCase()} (CUIT: {p.afipCuit})
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] text-gray-500 font-mono mt-1">
                        * Si elegís esta opción, copiaremos todos los artículos del catálogo del contribuyente seleccionado. De lo contrario, iniciarás con el POS en cero.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1">
                    <Shield size={12} /> ENTORNO DE FACTURACIÓN
                  </span>
                  <p className="text-[9px] text-gray-500 font-mono tracking-tight leading-relaxed">
                    Puedes conectar credenciales oficiales de AFIP de producción, o habilitar el modo simulación para verificar el sistema con datos de prueba sin valor fiscal.
                  </p>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="homologation-check"
                      className="os-checkbox"
                      checked={useHomologation}
                      onChange={e => setUseHomologation(e.target.checked)}
                    />
                    <label htmlFor="homologation-check" className="text-[10px] font-bold text-gray-300 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">
                      HABILITAR MODO PRUEBAS / SIMULACIÓN (RECOMENDADO)
                    </label>
                  </div>
                </div>

                {!useHomologation && (
                  <div className="p-4 border border-dashed border-red-500/20 bg-red-500/5 rounded-xl space-y-2">
                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest block">⚠ REQUIERE ARCHIVOS CERTIFICADOS</span>
                    <p className="text-[8px] text-gray-500 font-mono leading-tight">
                      Para emitir facturas reales, deberás cargar tus archivos .crt y .key emitidos por AFIP desde la pestaña de Configuración una vez dentro del sistema.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-6 mt-8 border-t border-white/5">
            {step > 1 ? (
              <button 
                onClick={handleBack}
                className="border border-white/10 hover:bg-white/5 text-gray-400 px-6 py-2.5 rounded-xl uppercase tracking-widest text-[9px] font-bold transition-all"
              >
                ATRÁS
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button 
                onClick={handleNext}
                className="bg-primary text-black px-6 py-2.5 rounded-xl uppercase tracking-widest text-[9px] font-black hover:bg-primary/95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                SIGUIENTE
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                className="bg-primary text-black px-8 py-3 rounded-xl uppercase tracking-widest text-[9px] font-black hover:bg-primary/95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
              >
                <CheckCircle size={12} /> FINALIZAR CONFIGURACIÓN
              </button>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
