import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Upload, Save } from "lucide-react";

export default function InvoiceDesignSettings() {
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.invoiceLogo) setLogoBase64(data.invoiceLogo);
      })
      .catch(console.error);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveLogo = async () => {
    setSaving(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceLogo: logoBase64 })
      });
      alert("Logo de Factura guardado correctamente.");
    } catch (error) {
      alert("Error al guardar logo.");
    }
    setSaving(false);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2 rounded">
          <ImageIcon size={24} className="text-primary" />
        </div>
        <h2 className="text-2xl font-black text-primary tracking-widest uppercase italic">7. DISEÑO DE FACTURA (PDF)</h2>
      </div>

      <div className="os-card !p-8">
        <p className="text-primary/70 mb-6 text-sm">
          Sube el logo de tu negocio en formato PNG o JPG. Este logo aparecerá en la parte superior izquierda de tus facturas generadas.
        </p>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <label className="text-[10px] text-primary/70 uppercase tracking-widest block font-bold mb-2">LOGO DEL NEGOCIO</label>
            <div className="border-2 border-dashed border-primary/20 rounded-md p-8 text-center hover:bg-primary/5 transition-colors cursor-pointer relative overflow-hidden">
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto mb-2 text-primary/50" size={32} />
              <p className="text-sm text-primary font-bold">HAZ CLIC O ARRASTRA TU LOGO AQUÍ</p>
              <p className="text-xs text-primary/50 mt-2">Recomendado: PNG Transparente</p>
            </div>

            <button 
              onClick={saveLogo} 
              disabled={saving || !logoBase64}
              className="os-button w-full mt-4"
            >
              <Save size={16} className="inline mr-2" />
              {saving ? 'GUARDANDO...' : 'GUARDAR DISEÑO'}
            </button>
          </div>

          <div className="flex-1 bg-black/50 border border-primary/20 rounded p-4 flex items-center justify-center min-h-[200px]">
            {logoBase64 ? (
              <img src={logoBase64} alt="Logo Preview" className="max-h-[150px] object-contain" />
            ) : (
              <div className="text-center opacity-30">
                <ImageIcon size={48} className="mx-auto mb-2" />
                <p className="text-xs font-mono uppercase">VISTA PREVIA</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
