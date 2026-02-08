import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Book, 
  Mic2, 
  Image as ImageIcon, 
  Bell, 
  Search,
  Heart,
  Calendar,
  Sparkles,
  RefreshCw,
  Quote,
  X,
  Play,
  Pause,
  Loader2,
  ShieldCheck,
  Save,
  Trash2,
  Lock,
  EyeOff,
  ServerOff
} from 'lucide-react';
import { AppTab, Devotional, VersePoster as PosterType } from './types';
import { generateDailyDevotional, generateAudioForVerse } from './services/geminiService';
import AudioPlayer from './components/AudioPlayer';
import VersePoster from './components/VersePoster';
import BiblePlan from './components/BiblePlan';
import AdBanner from './components/AdBanner';

// --- COMPONENTES INTERNOS PARA EVITAR ERROS DE IMPORTAÇÃO ---

const PrayerModalInternal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [prayerText, setPrayerText] = useState('');
  const [savedPrayers, setSavedPrayers] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('user_prayers');
    if (stored) setSavedPrayers(JSON.parse(stored));
  }, []);

  const savePrayer = () => {
    if (!prayerText.trim()) return;
    const newPrayer = {
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
    <div className="fixed inset-0 z-[1000] bg-white animate-in slide-in-from-right duration-500 flex flex-col">
      <header className="p-6 border-b border-amber-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="text-red-500 fill-red-500 w-5 h-5" />
          <h2 className="text-xl font-bold text-gray-800 serif">Minhas Preces</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 shadow-inner">
          <textarea 
            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder:text-amber-900/30 text-lg resize-none min-h-[150px]"
            placeholder="Abra seu coração..."
            value={prayerText}
            onChange={(e) => setPrayerText(e.target.value)}
          />
          <button 
            onClick={savePrayer}
            className="mt-4 w-full bg-amber-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Salvar Oração
          </button>
        </div>
        <div className="space-y-4 pb-20">
          {savedPrayers.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-amber-500">{p.date}</span>
                <button onClick={() => deletePrayer(p.id)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
              <p className="text-gray-600 italic">"{p.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PrivacyModalInternal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-[1000] bg-white animate-in slide-in-from-bottom duration-500 flex flex-col">
    <header className="p-6 border-b border-amber-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-amber-600 w-5 h-5" />
        <h2 className="text-xl font-bold text-gray-800 serif">Privacidade</h2>
      </div>
      <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
    </header>
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="bg-amber-50 p-6 rounded-3xl flex gap-4">
        <Lock className="w-6 h-6 text-amber-600" />
        <p className="text-sm text-amber-900">Suas orações são privadas e ficam apenas no seu aparelho.</p>
      </div>
      <div className="bg-blue-50 p-6 rounded-3xl flex gap-4">
        <EyeOff className="w-6 h-6 text-blue-600" />
        <p className="text-sm text-blue-900">Não rastreamos seus dados pessoais.</p>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">Desenvolvido por HS-Soluções para levar paz e esperança a todos.</p>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

const DEFAULT_POSTERS: PosterType[] = [
  { id: '1', text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1", imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800" },
  { id: '2', text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" },
  { id: '3', text: "O amor é paciente, o amor é bondoso.", reference: "1 Coríntios 13:4", imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=800" },
  { id: '4', text: "Seja forte e corajoso! Não se apavore nem desanime.", reference: "Josué 1:9", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800" },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [notified, setNotified] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    loadDevotional();
  }, []);

  const loadDevotional = async (topic?: string) => {
    setLoading(true);
    setShowSearch(false);
    try {
      const data = await generateDailyDevotional(topic);
      setDevotional({
        ...data,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
        imageUrl: "https://picsum.photos/seed/" + Math.floor(Math.random() * 1000) + "/1200/600"
      });
    } catch (error) {
      console.error("Error loading devotional:", error);
    } finally {
      setLoading(false);
    }
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const handlePlayAudioList = async (index: number, text: string) => {
    if (currentAudioIndex === index) {
      sourceRef.current?.stop();
      setCurrentAudioIndex(null);
      return;
    }
    if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch(e) {}
    }
    setAudioLoading(true);
    setCurrentAudioIndex(index);
    try {
      const base64Audio = await generateAudioForVerse(text);
      if (!base64Audio) throw new Error("Audio generation failed");
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setCurrentAudioIndex(null);
      source.start();
      sourceRef.current = source;
    } catch (error) {
      setCurrentAudioIndex(null);
    } finally {
      setAudioLoading(false);
    }
  };

  const audioList = [
    { title: "Meditação: Confiança", duration: "5:00", icon: Mic2, text: "Confie no Senhor de todo o seu coração e não se estribe no seu próprio entendimento." },
    { title: "Salmo do Dia: Leitura", duration: "2:30", icon: Book, text: "O Senhor é a minha luz e a minha salvação; de quem terei medo?" },
    { title: "Oração Matinal", duration: "3:45", icon: Sparkles, text: "Senhor, obrigado por mais este dia. Guia meus passos em amor e paz." },
  ];

  return (
    <div className="min-h-screen pb-32 max-w-2xl mx-auto bg-[#fdfbf7] relative shadow-2xl overflow-x-hidden">
      {showSearch && (
        <div className="fixed inset-0 z-[1000] bg-white p-8 flex flex-col items-center animate-in fade-in duration-300">
          <div className="w-full flex justify-end mb-12">
            <button onClick={() => setShowSearch(false)} className="p-4 bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-600" /></button>
          </div>
          <div className="max-w-md w-full text-center space-y-10">
            <h2 className="text-4xl font-bold serif text-gray-800">Sua Busca</h2>
            <div className="relative">
              <input 
                autoFocus
                type="text"
                className="w-full bg-amber-50 border-2 border-amber-100 rounded-[2rem] py-6 px-8 text-2xl focus:outline-none focus:border-amber-400"
                placeholder="Ex: Esperança..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadDevotional(searchQuery)}
              />
              <button onClick={() => loadDevotional(searchQuery)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 text-white p-4 rounded-3xl"><Search className="w-7 h-7" /></button>
            </div>
          </div>
        </div>
      )}

      {showPrayerModal && <PrayerModalInternal onClose={() => setShowPrayerModal(false)} />}
      {showPrivacyModal && <PrivacyModalInternal onClose={() => setShowPrivacyModal(false)} />}

      <header className="sticky top-0 z-[50] bg-white/80 backdrop-blur-lg border-b border-amber-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm"><Sparkles className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">Refúgio</h1>
            <p className="text-[10px] text-amber-600 uppercase font-bold tracking-widest">de Esperança</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setNotified(!notified)} className="p-2.5 rounded-xl bg-gray-50 text-gray-400 relative">
            <Bell className="w-5 h-5" />
            {notified && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
          </button>
          <div className="w-10 h-10 rounded-xl bg-amber-200 overflow-hidden border-2 border-white shadow-sm">
            <img src="https://picsum.photos/seed/user/100/100" alt="User" />
          </div>
        </div>
      </header>

      <main className="px-6 py-10">
        {activeTab === 'home' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 serif">Bom dia, querido(a)</h2>
              <p className="text-gray-500 mt-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-500" />{devotional?.date || 'Carregando...'}</p>
            </div>
            
            <AdBanner />

            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-amber-50">
              {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4 text-amber-600">
                    <RefreshCw className="w-10 h-10 animate-spin" />
                    <p className="font-medium">Alimentando sua alma...</p>
                </div>
              ) : (
                <>
                  <div className="relative h-64 overflow-hidden">
                    <img src={devotional?.imageUrl} className="w-full h-full object-cover" alt="Banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                  </div>
                  <div className="p-10 -mt-10 relative">
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl mb-8 border border-amber-100/50">
                      <Quote className="w-8 h-8 text-amber-100 mb-4" />
                      <h3 className="text-3xl font-bold text-gray-800 serif mb-6">{devotional?.title}</h3>
                      <p className="text-amber-800 font-semibold italic text-xl mb-4">"{devotional?.verse}"</p>
                      <p className="text-amber-500 font-black text-xs uppercase">— {devotional?.reference}</p>
                    </div>
                    <div className="prose prose-amber max-w-none text-gray-600 leading-relaxed space-y-6 text-lg">
                      {devotional?.content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AudioPlayer verse={devotional?.verse || ""} reference={devotional?.reference || ""} />
              <div onClick={() => setShowPrayerModal(true)} className="bg-gradient-to-br from-amber-500 to-orange-400 rounded-[2rem] p-8 text-white cursor-pointer hover:shadow-xl transition-all">
                <Heart className="w-8 h-8 fill-white mb-4" />
                <h4 className="font-bold text-xl">Minha Prece</h4>
                <p className="text-white/80 text-sm mt-2">Registre suas conversas com Deus.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bible' && <div className="animate-in slide-in-from-right duration-500"><BiblePlan /></div>}
        
        {activeTab === 'audio' && (
          <div className="space-y-10">
            <h2 className="text-4xl font-bold text-gray-800 serif">Refúgio Sonoro</h2>
            <div className="grid grid-cols-1 gap-6">
              {audioList.map((item, i) => {
                const isCurrent = currentAudioIndex === i;
                return (
                  <div key={i} onClick={() => handlePlayAudioList(i, item.text)} className={"p-6 rounded-[2rem] border-2 flex items-center justify-between cursor-pointer transition-all " + (isCurrent ? "bg-amber-50 border-amber-400" : "bg-white border-transparent shadow-sm")}>
                    <div className="flex items-center gap-4">
                      <div className={"w-14 h-14 rounded-2xl flex items-center justify-center " + (isCurrent ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600")}>
                        {isCurrent && audioLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <item.icon className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{item.title}</h4>
                        <p className="text-xs text-gray-400">{item.duration}</p>
                      </div>
                    </div>
                    <div className={"w-10 h-10 rounded-full flex items-center justify-center " + (isCurrent ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-600")}>
                      {isCurrent ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'posters' && (
          <div className="space-y-10">
            <h2 className="text-4xl font-bold text-gray-800 serif">Galeria de Fé</h2>
            <div className="grid grid-cols-1 gap-10">
              {DEFAULT_POSTERS.map(p => <VersePoster key={p.id} poster={p} />)}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 pb-20 px-10 text-center space-y-6">
        <div className="w-16 h-1 bg-amber-100 mx-auto rounded-full" />
        <div className="space-y-2">
            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Assinatura</h3>
            <p className="text-gray-800 text-base font-semibold">
              Desenvolvido por <span className="text-amber-600">Hélio Soares</span>
            </p>
            <p className="text-amber-500 font-bold text-sm tracking-tighter">@HS-Soluções</p>
            <button onClick={() => setShowPrivacyModal(true)} className="flex items-center gap-1 mx-auto text-[10px] text-gray-400 hover:text-amber-500 uppercase font-bold mt-8">
              <ShieldCheck className="w-3 h-3" /> Política de Privacidade
            </button>
        </div>
      </footer>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-white/95 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] p-4 flex items-center justify-around z-[500]">
        <button onClick={() => setActiveTab('home')} className={"flex flex-col items-center gap-1 " + (activeTab === 'home' ? "text-amber-600" : "text-gray-400")}>
          <Home className="w-6 h-6" /><span className="text-[10px] uppercase font-bold">Início</span>
        </button>
        <button onClick={() => setActiveTab('bible')} className={"flex flex-col items-center gap-1 " + (activeTab === 'bible' ? "text-amber-600" : "text-gray-400")}>
          <Book className="w-6 h-6" /><span className="text-[10px] uppercase font-bold">Bíblia</span>
        </button>
        <div className="relative -top-8">
          <button onClick={() => setShowSearch(true)} className="w-16 h-16 bg-amber-500 rounded-3xl shadow-xl shadow-amber-200 flex items-center justify-center text-white border-4 border-white">
            <Search className="w-7 h-7" />
          </button>
        </div>
        <button onClick={() => setActiveTab('audio')} className={"flex flex-col items-center gap-1 " + (activeTab === 'audio' ? "text-amber-600" : "text-gray-400")}>
          <Mic2 className="w-6 h-6" /><span className="text-[10px] uppercase font-bold">Áudio</span>
        </button>
        <button onClick={() => setActiveTab('posters')} className={"flex flex-col items-center gap-1 " + (activeTab === 'posters' ? "text-amber-600" : "text-gray-400")}>
          <ImageIcon className="w-6 h-6" /><span className="text-[10px] uppercase font-bold">Pôsteres</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
