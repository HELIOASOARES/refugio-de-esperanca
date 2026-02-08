
import React, { useState, useEffect } from 'react';
import { 
  Home, Book, Mic2, Image as ImageIcon, Search, Heart, 
  Calendar, Sparkles, RefreshCw, Quote, X, Key, Volume2, AlertTriangle, Save, Trash2, ShieldCheck
} from 'lucide-react';
import { AppTab, Devotional, VersePoster as PosterType } from './types.ts';
import { generateDailyDevotional } from './services/geminiService.ts';
import AudioPlayer from './components/AudioPlayer.tsx';
import VersePoster from './components/VersePoster.tsx';
import BiblePlan from './components/BiblePlan.tsx';
import AdBanner from './components/AdBanner.tsx';

// Guia visual de configuração caso a chave não exista
const SetupGuide: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center bg-white rounded-[3rem] shadow-xl m-6 border border-amber-100 animate-in fade-in duration-700">
    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6">
      <Key className="w-10 h-10" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 serif mb-3">Hélio, falta a Chave!</h2>
    <p className="text-gray-600 text-sm mb-6">O app precisa da <b>API_KEY</b> no Vercel para gerar as mensagens.</p>
    <button onClick={onRetry} className="w-full bg-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">
      <RefreshCw className="w-5 h-5" /> Tentar Carregar
    </button>
  </div>
);

const DEFAULT_POSTERS: PosterType[] = [
  { id: '1', text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1", imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800" },
  { id: '2', text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateDailyDevotional();
      setDevotional({
        ...data,
        id: '1',
        date: new Date().toLocaleDateString('pt-BR'),
        imageUrl: `https://picsum.photos/seed/church/1200/800`
      });
    } catch (err: any) {
      setError(err.message === "API_KEY_MISSING" ? "MISSING_KEY" : "ERRO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="min-h-screen pb-24 max-w-2xl mx-auto bg-[#fdfbf7] relative">
      <header className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-amber-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white"><Sparkles size={18} /></div>
          <h1 className="text-xl font-bold text-gray-800 serif">Refúgio</h1>
        </div>
      </header>

      <main className="p-6">
        {activeTab === 'home' && (
          error === "MISSING_KEY" ? <SetupGuide onRetry={loadData} /> :
          loading ? <div className="flex flex-col items-center justify-center h-64 text-amber-500"><RefreshCw className="animate-spin mb-4" /> Carregando...</div> :
          devotional && (
            <div className="space-y-6 animate-in fade-in duration-1000">
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-amber-50">
                <img src={devotional.imageUrl} className="h-48 w-full object-cover" />
                <div className="p-8">
                  <h2 className="text-2xl font-bold serif text-gray-800 mb-4">{devotional.title}</h2>
                  <p className="text-amber-700 italic font-medium mb-4">"{devotional.verse}" — {devotional.reference}</p>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">{devotional.content}</div>
                </div>
              </div>
              <AudioPlayer verse={devotional.verse} reference={devotional.reference} />
            </div>
          )
        )}
        {activeTab === 'bible' && <BiblePlan />}
        {activeTab === 'posters' && (
          <div className="grid gap-8">
            {DEFAULT_POSTERS.map(p => <VersePoster key={p.id} poster={p} />)}
          </div>
        )}
      </main>

      <footer className="p-10 text-center text-gray-400 text-xs">
        <p>Assinatura Desenvolvido por <b>Hélio Soares</b></p>
        <p className="text-amber-500 font-bold mt-1">@HS-SOLUÇÕES</p>
      </footer>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur-xl border border-amber-50 shadow-2xl rounded-full p-2 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('home')} className={`p-4 rounded-full ${activeTab === 'home' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}><Home /></button>
        <button onClick={() => setActiveTab('bible')} className={`p-4 rounded-full ${activeTab === 'bible' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}><Book /></button>
        <button onClick={() => setActiveTab('posters')} className={`p-4 rounded-full ${activeTab === 'posters' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}><ImageIcon /></button>
      </nav>
    </div>
  );
};

export default App;
