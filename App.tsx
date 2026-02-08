
import React, { useState, useEffect } from 'react';
import { 
  Home, Book, Mic2, Image as ImageIcon, Sparkles, 
  RefreshCw, AlertTriangle, Key, Menu, X
} from 'lucide-react';
import { AppTab, Devotional, VersePoster as PosterType } from './types';
import { generateDailyDevotional } from './services/geminiService';
import AudioPlayer from './components/AudioPlayer';
import VersePoster from './components/VersePoster';
import BiblePlan from './components/BiblePlan';
import AdBanner from './components/AdBanner';

const SetupGuide: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center animate-in fade-in duration-700">
    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 shadow-inner">
      <Key className="w-10 h-10" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 serif mb-3">Hélio, quase pronto!</h2>
    <div className="text-gray-600 text-sm mb-8 leading-relaxed">
      <p>O aplicativo não encontrou sua chave de acesso (API_KEY).</p>
      <p className="mt-2">Configure-a no painel do Vercel em:</p>
      <p className="font-bold text-amber-700">Settings &rarr; Environment Variables</p>
    </div>
    <button onClick={onRetry} className="w-full bg-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
      <RefreshCw className="w-5 h-5" /> Tentar Novamente
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateDailyDevotional();
      setDevotional({
        ...data,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
        imageUrl: `https://picsum.photos/seed/spirit${Math.random()}/1200/800`
      });
    } catch (err: any) {
      console.error("App load error:", err);
      if (err.message && (err.message.includes("API_KEY") || err.message.includes("key"))) {
        setError("MISSING_KEY");
      } else {
        setError("GENERIC_ERROR");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="min-h-screen pb-32 max-w-2xl mx-auto bg-[#fdfbf7] shadow-2xl relative overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 serif">Refúgio de Esperança</h1>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-500 hover:bg-amber-50 rounded-lg">
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl p-8 animate-in slide-in-from-right">
            <h3 className="serif text-xl font-bold mb-6">Menu do App</h3>
            <ul className="space-y-4">
              <li onClick={() => {setActiveTab('home'); setIsMenuOpen(false)}} className="flex items-center gap-3 text-gray-600 font-medium cursor-pointer hover:text-amber-500"><Home className="w-5 h-5"/> Início</li>
              <li onClick={() => {setActiveTab('bible'); setIsMenuOpen(false)}} className="flex items-center gap-3 text-gray-600 font-medium cursor-pointer hover:text-amber-500"><Book className="w-5 h-5"/> Bíblia</li>
              <li onClick={() => {setActiveTab('posters'); setIsMenuOpen(false)}} className="flex items-center gap-3 text-gray-600 font-medium cursor-pointer hover:text-amber-500"><ImageIcon className="w-5 h-5"/> Pôsteres</li>
            </ul>
            <div className="mt-20 border-t pt-6">
               <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Suporte</p>
               <p className="text-xs text-gray-400 mt-2">@HS-SOLUÇÕES</p>
            </div>
          </div>
        </div>
      )}

      <main className="p-6">
        {activeTab === 'home' && (
          error === "MISSING_KEY" ? <SetupGuide onRetry={loadData} /> :
          loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-amber-500 animate-pulse">
              <RefreshCw className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium italic">Preparando seu alimento espiritual...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-50 text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
              <h3 className="text-xl font-bold text-gray-800">Ops! Algo deu errado.</h3>
              <p className="text-gray-500 text-sm">Verifique sua conexão ou a chave da API.</p>
              <button onClick={loadData} className="w-full bg-amber-500 text-white font-bold py-4 rounded-2xl">Tentar Novamente</button>
            </div>
          ) : devotional && (
            <div className="animate-in fade-in duration-1000 space-y-8">
              <AdBanner />
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-amber-50">
                <img src={devotional.imageUrl} className="h-64 w-full object-cover" alt="Versículo" />
                <div className="p-8">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 block">{devotional.date}</span>
                  <h2 className="text-3xl font-bold serif text-gray-800 mb-6 leading-tight">{devotional.title}</h2>
                  <div className="bg-amber-50 p-6 rounded-2xl border-l-4 border-amber-400 mb-8">
                    <p className="text-amber-900 italic font-serif text-xl leading-relaxed">"{devotional.verse}"</p>
                    <p className="text-amber-600 font-bold text-xs mt-3 uppercase tracking-widest">— {devotional.reference}</p>
                  </div>
                  <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap space-y-4">
                    {devotional.content}
                  </div>
                </div>
              </div>
              <AudioPlayer verse={devotional.verse} reference={devotional.reference} />
            </div>
          )
        )}

        {activeTab === 'bible' && <BiblePlan />}
        
        {activeTab === 'posters' && (
          <div className="grid gap-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-800 serif">Pôsteres de Fé</h2>
              <p className="text-gray-500 text-sm">Toque para baixar e compartilhar a Palavra.</p>
            </div>
            {DEFAULT_POSTERS.map(p => <VersePoster key={p.id} poster={p} />)}
          </div>
        )}

        {activeTab === 'audio' && (
           <div className="text-center py-24 animate-in fade-in">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-200">
                <Mic2 className="w-12 h-12" />
              </div>
              <p className="text-gray-400 serif text-xl italic">Mais áudios de paz em breve...</p>
           </div>
        )}
      </main>

      <footer className="mt-20 pb-24 text-center space-y-2 opacity-60">
        <p className="text-gray-800 text-sm font-semibold">Assinatura Desenvolvido por <span className="text-amber-600">Hélio Soares</span></p>
        <p className="text-amber-500 font-bold text-[10px] tracking-widest uppercase">@HS-SOLUÇÕES</p>
      </footer>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur-xl border border-amber-50 shadow-2xl rounded-full p-2 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('home')} className={`p-4 rounded-full transition-all ${activeTab === 'home' ? 'bg-amber-500 text-white shadow-lg scale-110' : 'text-gray-400'}`}><Home /></button>
        <button onClick={() => setActiveTab('bible')} className={`p-4 rounded-full transition-all ${activeTab === 'bible' ? 'bg-amber-500 text-white shadow-lg scale-110' : 'text-gray-400'}`}><Book /></button>
        <button onClick={() => setActiveTab('audio')} className={`p-4 rounded-full transition-all ${activeTab === 'audio' ? 'bg-amber-500 text-white shadow-lg scale-110' : 'text-gray-400'}`}><Mic2 /></button>
        <button onClick={() => setActiveTab('posters')} className={`p-4 rounded-full transition-all ${activeTab === 'posters' ? 'bg-amber-500 text-white shadow-lg scale-110' : 'text-gray-400'}`}><ImageIcon /></button>
      </nav>
    </div>
  );
};

export default App;
