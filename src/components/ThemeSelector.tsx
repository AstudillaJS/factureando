import React from 'react';
import { Zap, Circle, Square, Waves, Sparkles, Drama, Music, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const themes = [
  { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon and electric vibes', icon: <Zap size={16} className="text-amber-500" /> },
  { id: 'matrix', name: 'Matrix', desc: 'Green screen retro', icon: <Circle size={16} className="text-green-500 fill-green-500" /> },
  { id: 'minimal', name: 'Minimal', desc: 'Clean and simple', icon: <Square size={16} className="text-white" /> },
  { id: 'deep-ocean', name: 'Deep Ocean', desc: 'Underwater serenity', icon: <Waves size={16} className="text-blue-500" /> },
  { id: 'harry-potter', name: 'Harry Potter', desc: 'Magical gold theme', icon: <Sparkles size={16} className="text-yellow-500" /> },
  { id: 'marvel', name: 'Marvel', desc: 'Power and action', icon: <Circle size={16} className="text-red-600 fill-red-600" /> },
  { id: 'loki', name: 'Loki', desc: 'TVA aesthetic', icon: <Drama size={16} className="text-emerald-500" /> },
  { id: 'winamp', name: 'Winamp', desc: 'Retro player classic', icon: <Music size={16} className="text-purple-500" /> },
] as const;

export default function ThemeSelector() {
  const { theme: activeTheme, setTheme } = useTheme();

  return (
    <div className="os-card !p-6 border-primary/40 bg-card-bg/50 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-6 text-primary">
        <Palette size={20} />
        <h2 className="text-lg font-black tracking-[0.2em] uppercase italic">THEME SELECTOR</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 border border-white/10 rounded-sm overflow-hidden mb-6">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`flex flex-col items-center justify-center p-4 border border-white/10 transition-all duration-300 gap-2 min-h-[100px] group ${
              activeTheme === t.id ? 'bg-primary/10 border-primary ring-1 ring-primary/20 scale-100 z-10' : 'bg-white hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {t.icon}
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeTheme === t.id ? 'text-primary' : 'text-black'}`}>
                {t.name}
              </span>
            </div>
            <p className={`text-[8px] text-center leading-tight uppercase font-bold tracking-tighter ${activeTheme === t.id ? 'text-primary/70' : 'text-gray-500'}`}>
              {t.desc}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-primary/50 uppercase tracking-widest font-bold">ACTIVE THEME</span>
        <span className="text-xl font-black text-primary italic uppercase tracking-tighter">
          {themes.find(t => t.id === activeTheme)?.name}
        </span>
      </div>
    </div>
  );
}
