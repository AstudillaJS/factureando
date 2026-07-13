import React from 'react';
import { Zap, Circle, Square, Waves, Sparkles, Drama, Music, Palette, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const baseThemes = [
  { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon and electric vibes', icon: <Zap size={16} className="text-amber-500" /> },
  { id: 'matrix', name: 'Matrix', desc: 'Green screen retro', icon: <Circle size={16} className="text-green-500 fill-green-500" /> },
  { id: 'minimal', name: 'Minimal', desc: 'Clean and simple', icon: <Square size={16} className="text-white" /> },
  { id: 'light', name: 'Claro', desc: 'Light Minimalist', icon: <Square size={16} className="text-primary" /> },
  { id: 'deep-ocean', name: 'Deep Ocean', desc: 'Underwater serenity', icon: <Waves size={16} className="text-blue-500" /> },
  { id: 'harry-potter', name: 'Harry Potter', desc: 'Magical gold theme', icon: <Sparkles size={16} className="text-yellow-500" /> },
  { id: 'marvel', name: 'Marvel', desc: 'Power and action', icon: <Circle size={16} className="text-red-600 fill-red-600" /> },
  { id: 'loki', name: 'Loki', desc: 'TVA aesthetic', icon: <Drama size={16} className="text-emerald-500" /> },
  { id: 'winamp', name: 'Winamp', desc: 'Retro player classic', icon: <Music size={16} className="text-purple-500" /> },
] as const;

export default function ThemeSelector() {
  const { theme: activeTheme, setTheme, themeColor } = useTheme();

  // Si hay un color de marca configurado, mostrar la opción adicional
  const themes = themeColor 
    ? [
        ...baseThemes, 
        { id: 'brand' as const, name: 'Marca', desc: 'Personalizado con tu logo', icon: <Palette size={16} style={{ color: themeColor }} /> }
      ]
    : baseThemes;

  const handleSetTheme = async (themeId: typeof themes[number]['id']) => {
    setTheme(themeId);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeId })
      });
    } catch (e) {
      console.error('Error saving theme preference:', e);
    }
  };

  return (
    <div className="os-card !p-6 border-primary/40 bg-card-bg/50 backdrop-blur-md relative z-20">
      <div className="flex items-center gap-2 mb-6 text-primary">
        <Palette size={20} />
        <h2 className="text-lg font-black tracking-[0.2em] uppercase italic">SELECTOR DE TEMA</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 border border-white/10 rounded-xl overflow-hidden mb-6">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSetTheme(t.id)}
            className={`flex flex-col items-center justify-center p-4 border border-white/10 transition-all duration-300 gap-2 min-h-[100px] group ${
              activeTheme === t.id ? 'bg-primary/10 border-primary ring-1 ring-primary/20 scale-100 z-10' : 'bg-card-bg/40 hover:bg-primary/5'
            }`}
          >
            <div className="flex items-center gap-1">
              {t.icon}
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeTheme === t.id ? 'text-primary' : 'text-white'}`}>
                {t.name}
              </span>
            </div>
            <p className={`text-[8px] text-center leading-tight uppercase font-bold tracking-tighter ${activeTheme === t.id ? 'text-primary/70' : 'text-gray-400'}`}>
              {t.desc}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-primary/50 uppercase tracking-widest font-bold">TEMA ACTIVO</span>
        <span className="text-xl font-black text-primary italic uppercase tracking-tighter">
          {themes.find(t => t.id === activeTheme)?.name}
        </span>
      </div>
    </div>
  );
}
