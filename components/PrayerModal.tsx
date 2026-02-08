
import React, { useState, useEffect } from 'react';
import { X, Heart, Save, Trash2, Sparkles } from 'lucide-react';

interface Prayer {
  id: string;
  text: string;
  date: string;
}

interface PrayerModalProps {
  onClose: () => void;
}

const PrayerModal: React.FC<PrayerModalProps> = ({ onClose }) => {
  const [prayerText, setPrayerText] = useState('');
  const [savedPrayers, setSavedPrayers] = useState<Prayer[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('user_prayers');
    if (stored) setSavedPrayers(JSON.parse(stored));
  }, []);

  const savePrayer = () => {
    if (!prayerText.trim()) return;
    const newPrayer: Prayer = {
      id: Date.now().toString(),
      text: prayerText,
      date: new Date().toLocaleDateString('pt-BR')
    };
    const updated = [newPrayer, ...savedPrayers];
    setSavedPrayers(updated);
    localStorage.setItem('user_prayers', JSON.stringify(updated));
    setPrayerText('');
  };

  const deletePrayer = (id: string) => {
    const updated = savedPrayers.filter(p => p.id !== id);
    setSavedPrayers(updated);
    localStorage.setItem('user_prayers', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-right duration-500 flex flex-col">
      <header className="p-6 border-b border-amber-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="text-red-500 fill-red-500 w-5 h-5" />
          <h2 className="text-xl font-bold text-gray-800 serif">Minhas Preces</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-amber-500 w-4 h-4" />
            <h3 className="font-bold text-amber-900 text-sm uppercase tracking-widest">O que está no seu coração?</h3>
          </div>
          <textarea 
            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder:text-amber-900/30 text-lg resize-none min-h-[150px]"
            placeholder="Escreva sua prece aqui..."
            value={prayerText}
            onChange={(e) => setPrayerText(e.target.value)}
          />
          <button 
            onClick={savePrayer}
            disabled={!prayerText.trim()}
            className="mt-4 w-full bg-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Entregar a Deus
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Preces Anteriores</h3>
          {savedPrayers.length === 0 ? (
            <p className="text-center text-gray-400 py-10 italic">Nenhuma prece registrada ainda.</p>
          ) : (
            savedPrayers.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-amber-500">{p.date}</span>
                  <button onClick={() => deletePrayer(p.id)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="text-gray-600 italic">"{p.text}"</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerModal;
