import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Upload, Save, Sliders, Palette, FileText, RefreshCw, FilePenLine } from "lucide-react";
import { generateInvoicePDF } from "../utils/pdfGenerator";

const mockInvoice = {
  id: "2026-9999",
  ptoVta: 2,
  voucherNumber: 3,
  date: "2026-05-30",
  amount: 206000,
  description: "Servicios de Barbería del día 2026-05-30",
  clientCuit: "20369106539",
  clientName: "CONSUMIDOR FINAL",
  cae: "86238304087136",
  caeVto: "2026-06-14"
};

export default function InvoiceDesignSettings() {
  const [activeTab, setActiveTab] = useState<'design' | 'logos' | 'spacing'>('design');
  const [saving, setSaving] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>("");

  const [settings, setSettings] = useState({
    invoiceLogo: "",
    pdfColorPalette: "slate",
    pdfLogoPosition: "izquierda",
    pdfLogoSizeWidth: 30,
    pdfLynxLogo: "",
    pdfLynxPosition: "abajo_derecha",
    pdfLynxSize: 25,
    pdfLynxOpacity: 0.08,
    pdfHeaderHeight: 55,
    pdfCompanyNameSize: 16,
    pdfCompanyNameY: 25,
    pdfRightColTitleSize: 18,
    pdfRightColDetailsSize: 9,
    pdfRightColY: 15,
    pdfInvoiceTypeX: 95,
    pdfInvoiceTypeY: 10,
    pdfTableStartY: 98,
    // Nuevos campos
    domicilioComercial: "",
    nombreFantasia: "",
    inicioActividad: "01/05/2026",
    ingresosBrutos: "",
    pdfLeftColAlign: "centrado",
    pdfLeftColX: 15,
    pdfRightColX: 110,
    pdfLogoX: 15,
    pdfLogoY: 12,
  });

  // Load config on mount
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({
          ...prev,
          invoiceLogo: data.invoiceLogo || "",
          pdfColorPalette: data.pdfColorPalette || "slate",
          pdfLogoPosition: data.pdfLogoPosition || "izquierda",
          pdfLogoSizeWidth: data.pdfLogoSizeWidth ? Number(data.pdfLogoSizeWidth) : 30,
          pdfLynxLogo: data.pdfLynxLogo || "",
          pdfLynxPosition: data.pdfLynxPosition || "abajo_derecha",
          pdfLynxSize: data.pdfLynxSize ? Number(data.pdfLynxSize) : 25,
          pdfLynxOpacity: data.pdfLynxOpacity ? Number(data.pdfLynxOpacity) : 0.08,
          pdfHeaderHeight: data.pdfHeaderHeight ? Number(data.pdfHeaderHeight) : 55,
          pdfCompanyNameSize: data.pdfCompanyNameSize ? Number(data.pdfCompanyNameSize) : 16,
          pdfCompanyNameY: data.pdfCompanyNameY ? Number(data.pdfCompanyNameY) : 25,
          pdfRightColTitleSize: data.pdfRightColTitleSize ? Number(data.pdfRightColTitleSize) : 18,
          pdfRightColDetailsSize: data.pdfRightColDetailsSize ? Number(data.pdfRightColDetailsSize) : 9,
          pdfRightColY: data.pdfRightColY ? Number(data.pdfRightColY) : 15,
          pdfInvoiceTypeX: data.pdfInvoiceTypeX ? Number(data.pdfInvoiceTypeX) : 95,
          pdfInvoiceTypeY: data.pdfInvoiceTypeY ? Number(data.pdfInvoiceTypeY) : 10,
          pdfTableStartY: data.pdfTableStartY ? Number(data.pdfTableStartY) : 98,
          // Nuevos campos cargados de la DB
          domicilioComercial: data.domicilioComercial || "",
          nombreFantasia: data.nombreFantasia || "",
          inicioActividad: data.inicioActividad || "01/05/2026",
          ingresosBrutos: data.ingresosBrutos || "",
          pdfLeftColAlign: data.pdfLeftColAlign || "centrado",
          pdfLeftColX: data.pdfLeftColX ? Number(data.pdfLeftColX) : 15,
          pdfRightColX: data.pdfRightColX ? Number(data.pdfRightColX) : 110,
          pdfLogoX: data.pdfLogoX ? Number(data.pdfLogoX) : 15,
          pdfLogoY: data.pdfLogoY ? Number(data.pdfLogoY) : 12,
        }));
      })
      .catch(console.error);
  }, []);

  // Update real-time PDF preview URL (Debounced)
  useEffect(() => {
    let active = true;
    const updatePreview = async () => {
      try {
        const url = await generateInvoicePDF(mockInvoice, settings);
        if (active) {
          setPdfPreviewUrl(url);
        }
      } catch (err) {
        console.error("Error updating PDF preview:", err);
      }
    };

    const timer = setTimeout(() => {
      updatePreview();
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [settings]);

  // Handle logo change for business logo
  const handleBusinessLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSettings(prev => ({ ...prev, invoiceLogo: event.target.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle logo change for LYNX logo
  const handleLynxLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSettings(prev => ({ ...prev, pdfLynxLogo: event.target.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      console.log("Enviando configuración para guardar...", settings);
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Diseño de factura guardado exitosamente.");
      } else {
        const errorText = await res.text();
        console.error(`Error del servidor al guardar diseño (Status ${res.status}):`, errorText);
        alert(`Error al guardar el diseño. Detalle: ${errorText || res.statusText || res.status}`);
      }
    } catch (error: any) {
      console.error("Error de conexión al guardar el diseño:", error);
      alert(`Error de conexión al guardar el diseño. Detalle: ${error.message}`);
    }
    setSaving(false);
  };

  const resetLynxLogo = () => {
    setSettings(prev => ({ ...prev, pdfLynxLogo: "" }));
  };

  // Paletas de colores
  const palettes = [
    { id: "slate", name: "Pizarra Clásica", primary: "bg-[#1e293b]", secondary: "bg-[#94a3b8]" },
    { id: "blue", name: "Azul Profesional", primary: "bg-[#1e3a8a]", secondary: "bg-[#60a5fa]" },
    { id: "emerald", name: "Verde Esmeralda", primary: "bg-[#064e3b]", secondary: "bg-[#34d299]" },
    { id: "amber", name: "Ámbar Premium", primary: "bg-[#78350f]", secondary: "bg-[#fbc124]" },
    { id: "monochrome", name: "Monocromo", primary: "bg-[#000000]", secondary: "bg-[#71717a]" },
    { id: "soft_white", name: "Blanco Minimalista", primary: "bg-[#f1f5f9] border border-primary/20", secondary: "bg-[#cbd5e1]" }
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2 rounded">
          <ImageIcon size={24} className="text-primary" />
        </div>
        <h2 className="text-2xl font-black text-primary tracking-widest uppercase italic">7. DISEÑO DE FACTURA (PDF)</h2>
      </div>

      <div className="os-card !p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controles de Configuración */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Tabs Selector */}
            <div className="flex border-b border-primary/20 pb-2 gap-4">
              <button 
                type="button"
                onClick={() => setActiveTab('design')}
                className={`text-[11px] font-bold tracking-widest uppercase pb-2 transition-colors flex items-center gap-2 ${activeTab === 'design' ? 'text-primary border-b-2 border-primary' : 'text-primary/40 hover:text-primary/70'}`}
              >
                <Palette size={14} /> Diseño & Datos
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('logos')}
                className={`text-[11px] font-bold tracking-widest uppercase pb-2 transition-colors flex items-center gap-2 ${activeTab === 'logos' ? 'text-primary border-b-2 border-primary' : 'text-primary/40 hover:text-primary/70'}`}
              >
                <ImageIcon size={14} /> Logos
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('spacing')}
                className={`text-[11px] font-bold tracking-widest uppercase pb-2 transition-colors flex items-center gap-2 ${activeTab === 'spacing' ? 'text-primary border-b-2 border-primary' : 'text-primary/40 hover:text-primary/70'}`}
              >
                <Sliders size={14} /> Alineación & Márgenes
              </button>
            </div>

            {/* TAB: DISEÑO & DATOS */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-3">PALETA DE COLORES PRINCIPAL</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {palettes.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleInputChange('pdfColorPalette', p.id)}
                        className={`flex items-center justify-between p-3 border rounded text-left transition-all ${settings.pdfColorPalette === p.id ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5' : 'border-primary/20 hover:border-primary/50 bg-black/45'}`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider">{p.name}</span>
                        <div className="flex gap-1.5">
                          <span className={`w-4 h-4 rounded-full ${p.primary} border border-white/20`} />
                          <span className={`w-4 h-4 rounded-full ${p.secondary} border border-white/20`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-primary/10 p-4 rounded bg-primary/2 space-y-4">
                  <h3 className="text-xs font-black tracking-wider text-primary uppercase flex items-center gap-1.5">
                    <FilePenLine size={14} /> DATOS FISCALES / COMERCIALES DE EMISOR
                  </h3>
                  
                  <div>
                    <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">Nombre Comercial / Fantasía (Lado Izquierdo)</label>
                    <input 
                      type="text" 
                      className="os-input text-xs" 
                      placeholder="Ej: Loaiza Martha"
                      value={settings.nombreFantasia}
                      onChange={(e) => handleInputChange('nombreFantasia', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">Dirección Comercial (Lado Izquierdo)</label>
                    <textarea 
                      rows={2}
                      className="os-input text-xs resize-none" 
                      placeholder="Ej: SAN PEDRITO AV. 248 Piso:PB&#10;Ciudad Autónoma de Buenos Aires"
                      value={settings.domicilioComercial}
                      onChange={(e) => handleInputChange('domicilioComercial', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">Inicio de Actividad</label>
                      <input 
                        type="text" 
                        className="os-input text-xs" 
                        placeholder="Ej: 01/05/2026"
                        value={settings.inicioActividad}
                        onChange={(e) => handleInputChange('inicioActividad', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">Ingresos Brutos C.M</label>
                      <input 
                        type="text" 
                        className="os-input text-xs" 
                        placeholder="Ej: 23-95543325-4"
                        value={settings.ingresosBrutos}
                        onChange={(e) => handleInputChange('ingresosBrutos', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: LOGOS */}
            {activeTab === 'logos' && (
              <div className="space-y-6">
                
                {/* Logo del Comercio */}
                <div className="border border-primary/10 p-4 rounded bg-primary/2">
                  <h3 className="text-xs font-black tracking-wider text-primary uppercase mb-4">LOGO DEL COMERCIO</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">POSICIÓN DEL LOGO</label>
                      <select 
                        className="os-input !py-1 text-xs" 
                        value={settings.pdfLogoPosition}
                        onChange={(e) => handleInputChange('pdfLogoPosition', e.target.value)}
                      >
                        <option value="izquierda">Cabecera Izquierda</option>
                        <option value="derecha">Cabecera Derecha</option>
                        <option value="oculto">Ocultar Logo</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">ANCHO DEL LOGO ({settings.pdfLogoSizeWidth} mm)</label>
                      <input 
                        type="range"
                        min="15"
                        max="60"
                        className="w-full accent-primary mt-1"
                        value={settings.pdfLogoSizeWidth}
                        onChange={(e) => handleInputChange('pdfLogoSizeWidth', Number(e.target.value))}
                      />
                    </div>

                    {settings.pdfLogoPosition !== "oculto" && (
                      <>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-primary/70 uppercase font-mono">Alineación Horizontal X</span>
                            <span className="text-[10px] text-primary font-bold">{settings.pdfLogoX} mm</span>
                          </div>
                          <input 
                            type="range" min="5" max="150" className="w-full accent-primary" 
                            value={settings.pdfLogoX}
                            onChange={(e) => handleInputChange('pdfLogoX', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-primary/70 uppercase font-mono">Alineación Vertical Y</span>
                            <span className="text-[10px] text-primary font-bold">{settings.pdfLogoY} mm</span>
                          </div>
                          <input 
                            type="range" min="5" max="50" className="w-full accent-primary" 
                            value={settings.pdfLogoY}
                            onChange={(e) => handleInputChange('pdfLogoY', Number(e.target.value))}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-primary/20 rounded p-4 text-center hover:bg-primary/5 transition-colors relative cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      onChange={handleBusinessLogoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="mx-auto mb-2 text-primary/50" size={24} />
                    <p className="text-xs text-primary font-bold uppercase">Haz clic o arrastra el logo del negocio</p>
                    {settings.invoiceLogo && <p className="text-[9px] text-green-500 font-mono mt-1 uppercase">✓ Logo cargado</p>}
                  </div>
                </div>

                {/* Logo de LYNX */}
                <div className="border border-primary/10 p-4 rounded bg-primary/2">
                  <h3 className="text-xs font-black tracking-wider text-primary uppercase mb-4">LOGO / MARCA DE LYNX (Branding)</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">UBICACIÓN EN HOJA</label>
                      <select 
                        className="os-input !py-1 text-xs" 
                        value={settings.pdfLynxPosition}
                        onChange={(e) => handleInputChange('pdfLynxPosition', e.target.value)}
                      >
                        <option value="abajo_derecha">Abajo Derecha (Pie de pág.)</option>
                        <option value="abajo_izquierda">Abajo Izquierda (Pie de pág.)</option>
                        <option value="abajo_centro">Abajo al Centro (Pie de pág.)</option>
                        <option value="marca_agua">Centro (Marca de Agua)</option>
                        <option value="oculto">Ocultar de la Factura</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">ANCHO DEL LOGO ({settings.pdfLynxSize} mm)</label>
                      <input 
                        type="range"
                        min="10"
                        max="60"
                        className="w-full accent-primary mt-1"
                        value={settings.pdfLynxSize}
                        onChange={(e) => handleInputChange('pdfLynxSize', Number(e.target.value))}
                      />
                    </div>

                    {settings.pdfLynxPosition === "marca_agua" && (
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">OPACIDAD DE MARCA DE AGUA ({(settings.pdfLynxOpacity * 100).toFixed(0)}%)</label>
                        <input 
                          type="range"
                          min="0.02"
                          max="0.30"
                          step="0.01"
                          className="w-full accent-primary mt-1"
                          value={settings.pdfLynxOpacity}
                          onChange={(e) => handleInputChange('pdfLynxOpacity', Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="border-2 border-dashed border-primary/20 rounded p-4 text-center hover:bg-primary/5 transition-colors relative cursor-pointer flex-1">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        onChange={handleLynxLogoChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="mx-auto mb-1 text-primary/50" size={20} />
                      <p className="text-[10px] text-primary font-bold uppercase">Subir logo LYNX personalizado</p>
                      {settings.pdfLynxLogo && <p className="text-[9px] text-green-500 font-mono mt-1 uppercase">✓ Logo personalizado</p>}
                    </div>

                    {settings.pdfLynxLogo && (
                      <button 
                        type="button" 
                        onClick={resetLynxLogo}
                        className="os-button border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs px-3"
                      >
                        Restaurar original
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: SPACING & ALIGNMENTS */}
            {activeTab === 'spacing' && (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                
                <div>
                  <h3 className="text-xs font-black tracking-wider text-primary uppercase mb-3">DIMENSIONES GENERALES DE LA HOJA</h3>
                  <div className="space-y-3 bg-black/30 p-3 border border-primary/10 rounded">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-primary/70 uppercase font-mono">Altura de Cabecera</span>
                        <span className="text-[10px] text-primary font-bold">{settings.pdfHeaderHeight} mm</span>
                      </div>
                      <input 
                        type="range" min="35" max="75" className="w-full accent-primary" 
                        value={settings.pdfHeaderHeight}
                        onChange={(e) => handleInputChange('pdfHeaderHeight', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-primary/70 uppercase font-mono">Inicio de Tabla de Ítems</span>
                        <span className="text-[10px] text-primary font-bold">{settings.pdfTableStartY} mm</span>
                      </div>
                      <input 
                        type="range" min="70" max="115" className="w-full accent-primary" 
                        value={settings.pdfTableStartY}
                        onChange={(e) => handleInputChange('pdfTableStartY', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black tracking-wider text-primary uppercase mb-3">COLUMNA IZQUIERDA (Fantasía)</h3>
                  <div className="space-y-3 bg-black/30 p-3 border border-primary/10 rounded">
                    <div>
                      <label className="text-[9px] text-primary/70 uppercase font-mono block mb-1">Alineación de Texto</label>
                      <select
                        className="os-input !py-1 text-xs"
                        value={settings.pdfLeftColAlign}
                        onChange={(e) => handleInputChange('pdfLeftColAlign', e.target.value)}
                      >
                        <option value="centrado">Centrado en bloque izquierdo</option>
                        <option value="izquierda">Alineado a la Izquierda</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-primary/70 uppercase font-mono">Posición Horizontal (Margen X)</span>
                        <span className="text-[10px] text-primary font-bold">{settings.pdfLeftColX} mm</span>
                      </div>
                      <input 
                        type="range" min="5" max="50" className="w-full accent-primary" 
                        value={settings.pdfLeftColX}
                        onChange={(e) => handleInputChange('pdfLeftColX', Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-primary/70 uppercase font-mono">Posición Vertical (Alineación Y)</span>
                        <span className="text-[10px] text-primary font-bold">{settings.pdfCompanyNameY} mm</span>
                      </div>
                      <input 
                        type="range" min="12" max="60" className="w-full accent-primary" 
                        value={settings.pdfCompanyNameY}
                        onChange={(e) => handleInputChange('pdfCompanyNameY', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-primary/70 uppercase font-mono">Tamaño de Fuente Nombre</span>
                        <span className="text-[10px] text-primary font-bold">{settings.pdfCompanyNameSize} px</span>
                      </div>
                      <input 
                        type="range" min="10" max="24" className="w-full accent-primary" 
                        value={settings.pdfCompanyNameSize}
                        onChange={(e) => handleInputChange('pdfCompanyNameSize', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black tracking-wider text-primary uppercase mb-3">COLUMNA DERECHA (FACTURA)</h3>
                  <div className="space-y-3 bg-black/30 p-3 border border-primary/10 rounded">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-primary/70 uppercase font-mono">Posición Horizontal (Margen X)</span>
                        <span className="text-[10px] text-primary font-bold">{settings.pdfRightColX} mm</span>
                      </div>
                      <input 
                        type="range" min="80" max="140" className="w-full accent-primary" 
                        value={settings.pdfRightColX}
                        onChange={(e) => handleInputChange('pdfRightColX', Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-primary/70 uppercase font-mono">Posición Vertical (Alineación Y)</span>
                        <span className="text-[10px] text-primary font-bold">{settings.pdfRightColY} mm</span>
                      </div>
                      <input 
                        type="range" min="12" max="50" className="w-full accent-primary" 
                        value={settings.pdfRightColY}
                        onChange={(e) => handleInputChange('pdfRightColY', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-primary/70 uppercase font-mono">Tamaño Fuente "FACTURA"</span>
                        <span className="text-[10px] text-primary font-bold">{settings.pdfRightColTitleSize} px</span>
                      </div>
                      <input 
                        type="range" min="12" max="24" className="w-full accent-primary" 
                        value={settings.pdfRightColTitleSize}
                        onChange={(e) => handleInputChange('pdfRightColTitleSize', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-primary/70 uppercase font-mono">Tamaño Fuente Detalles</span>
                        <span className="text-[10px] text-primary font-bold">{settings.pdfRightColDetailsSize} px</span>
                      </div>
                      <input 
                        type="range" min="7" max="13" className="w-full accent-primary" 
                        value={settings.pdfRightColDetailsSize}
                        onChange={(e) => handleInputChange('pdfRightColDetailsSize', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black tracking-wider text-primary uppercase mb-3">CAJA COMPROBANTE C (Centro)</h3>
                  <div className="space-y-3 bg-black/30 p-3 border border-primary/10 rounded">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] text-primary/70 uppercase font-mono">Posición X</span>
                          <span className="text-[10px] text-primary font-bold">{settings.pdfInvoiceTypeX} mm</span>
                        </div>
                        <input 
                          type="range" min="85" max="115" className="w-full accent-primary" 
                          value={settings.pdfInvoiceTypeX}
                          onChange={(e) => handleInputChange('pdfInvoiceTypeX', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] text-primary/70 uppercase font-mono">Posición Y</span>
                          <span className="text-[10px] text-primary font-bold">{settings.pdfInvoiceTypeY} mm</span>
                        </div>
                        <input 
                          type="range" min="10" max="40" className="w-full accent-primary" 
                          value={settings.pdfInvoiceTypeY}
                          onChange={(e) => handleInputChange('pdfInvoiceTypeY', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            <button 
              type="button"
              onClick={saveSettings} 
              disabled={saving}
              className="os-button w-full mt-4"
            >
              <Save size={16} className="inline mr-2" />
              {saving ? 'GUARDANDO CONFIGURACIÓN...' : 'GUARDAR DISEÑO FINAL'}
            </button>
          </div>

          {/* Live Preview Pane */}
          <div className="lg:col-span-6 flex flex-col h-[650px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-primary/70 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <FileText size={12} className="text-primary" /> VISTA PREVIA DEL PDF EN VIVO
              </label>
              <span className="text-[8px] font-mono text-primary/40 uppercase flex items-center gap-1">
                <RefreshCw size={8} className="animate-pulse text-green-500" /> Auto-Regenerando
              </span>
            </div>
            
            <div className="flex-1 bg-black/60 border border-primary/20 rounded p-1.5 relative overflow-hidden flex items-center justify-center">
              {pdfPreviewUrl ? (
                <iframe 
                  src={pdfPreviewUrl} 
                  className="w-full h-full rounded border-0 bg-white"
                  title="Vista Previa de Factura PDF"
                />
              ) : (
                <div className="text-center opacity-30">
                  <ImageIcon size={48} className="mx-auto mb-2 animate-pulse text-primary" />
                  <p className="text-xs font-mono uppercase tracking-widest">Generando Vista Previa...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
