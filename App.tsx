
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
  Loader2
} from 'lucide-react';
import { AppTab, Devotional, VersePoster as PosterType } from './types';
import { generateDailyDevotional, generateAudioForVerse } from './services/geminiService';
import AudioPlayer from './components/AudioPlayer';
import VersePoster from './components/VersePoster';
import BiblePlan from './components/BiblePlan';
import AdBanner from './components/AdBanner';
import PrayerModal from './components/PrayerModal';

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
        imageUrl: `https://picsum.photos/seed/devotion${Math.floor(Math.random() * 100)}/1200/600`
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

  const NavItem = ({ id, icon: Icon, label }: { id: AppTab, icon: any, label: string }) => (
    <button 
      onClick={() => { setActiveTab(id); setShowSearch(false); }}
      className={`flex flex-col items-center gap-1 transition-all ${activeTab === id ? 'text-amber-600 scale-110' : 'text-gray-400 hover:text-amber-400'}`}
    >
      <Icon className={`w-6 h-6 ${activeTab === id ? 'fill-amber-50' : ''}`} />
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
  );

  const audioList = [
    { title: "Meditação: Confiança", duration: "5:00", icon: Mic2, text: "Confie no Senhor de todo o seu coração e não se estribe no seu próprio entendimento." },
    { title: "Salmo do Dia: Leitura", duration: "2:30", icon: Book, text: "O Senhor é a minha luz e a minha salvação; de quem terei medo?" },
    { title: "Oração Matinal", duration: "3:45", icon: Sparkles, text: "Senhor, obrigado por mais este dia. Guia meus passos em amor e paz." },
  ];

  return (
    <div className="min-h-screen pb-32 max-w-2xl mx-auto bg-[#fdfbf7] relative shadow-2xl overflow-x-hidden selection:bg-amber-100">
      {/* Busca Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[1000] bg-white/98 backdrop-blur-2xl animate-in fade-in duration-300 p-8 flex flex-col items-center">
          <div className="w-full flex justify-end mb-12">
            <button 
              onClick={() => setShowSearch(false)} 
              className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-90 transition-all shadow-sm"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="max-w-md w-full text-center space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold serif text-gray-800">Sua Busca</h2>
              <p className="text-gray-500 font-medium">Encontre conforto em temas específicos.</p>
            </div>
            
            <div className="relative group">
              <input 
                autoFocus
                type="text"
                className="w-full bg-amber-50/50 border-2 border-amber-100 rounded-[2rem] py-6 px-8 text-2xl focus:outline-none focus:border-amber-400 transition-all shadow-inner placeholder:text-gray-300"
                placeholder="Ex: Paciência, Luto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadDevotional(searchQuery)}
              />
              <button 
                onClick={() => loadDevotional(searchQuery)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 text-white p-4 rounded-3xl shadow-xl hover:bg-amber-600 active:scale-95 transition-all"
              >
                <Search className="w-7 h-7" />
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {['Ansiedade', 'Amor', 'Gratidão', 'Família', 'Trabalho'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => { setSearchQuery(tag); loadDevotional(tag); }}
                  className="px-6 py-3 bg-white border border-amber-100 rounded-2xl text-sm font-bold text-amber-800 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPrayerModal && <PrayerModal onClose={() => setShowPrayerModal(false)} />}

      <header className="sticky top-0 z-[50] bg-white/80 backdrop-blur-lg border-b border-amber-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm"><Sparkles className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">Refúgio</h1>
            <p className="text-[10px] text-amber-600 uppercase font-bold tracking-[0.2em] leading-none">de Esperança</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setNotified(!notified)} className={`p-2.5 rounded-xl relative transition-all ${notified ? 'text-amber-500 bg-amber-50 shadow-inner' : 'text-gray-400 bg-gray-50'}`}>
            <Bell className="w-5 h-5" />
            {notified && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-200 to-orange-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-amber-50">
            <img src="https://picsum.photos/seed/user/100/100" alt="User" />
          </div>
        </div>
      </header>

      <main className="px-6 py-10">
        {activeTab === 'home' && (
          <div className="space-y-10">
            <div className="animate-in slide-in-from-left duration-700">
              <h2 className="text-4xl font-bold text-gray-800 serif leading-tight">Bom dia,<br/>querido(a)</h2>
              <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium"><Calendar className="w-4 h-4 text-amber-500" />{devotional?.date || 'Preparando dia...'}</p>
            </div>
            
            <AdBanner />

            <div className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-amber-900/5 border border-amber-50">
              {loading ? (
                <div className="h-[500px] flex flex-col items-center justify-center gap-6 text-amber-600">
                    <div className="relative">
                        <RefreshCw className="w-12 h-12 animate-spin" />
                        <Sparkles className="w-4 h-4 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <p className="font-medium animate-pulse">Buscando alimento para sua alma...</p>
                </div>
              ) : (
                <>
                  <div className="relative h-64 overflow-hidden group">
                    <img src={devotional?.imageUrl} alt="Devotional" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-8 bg-amber-500/90 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black text-white shadow-lg tracking-widest uppercase">
                      Palavra de Hoje
                    </div>
                  </div>
                  <div className="p-10 -mt-10 relative">
                    <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-amber-900/10 mb-8 border border-amber-100/50">
                      <Quote className="w-10 h-10 text-amber-100 mb-4" />
                      <h3 className="text-3xl font-bold text-gray-800 serif mb-6 leading-[1.1]">{devotional?.title}</h3>
                      <p className="text-amber-800 font-semibold italic text-xl leading-relaxed mb-4">"{devotional?.verse}"</p>
                      <p className="text-amber-500 font-black text-xs tracking-[0.2em] uppercase">— {devotional?.reference}</p>
                    </div>
                    <div className="prose prose-amber max-w-none text-gray-600 leading-[1.8] space-y-6 text-lg">
                      {devotional?.content.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AudioPlayer verse={devotional?.verse || "O Senhor é o meu pastor."} reference={devotional?.reference || "Salmos 23:1"} />
              <div 
                onClick={() => setShowPrayerModal(true)}
                className="bg-gradient-to-br from-amber-500 to-orange-400 rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-amber-200 cursor-pointer hover:shadow-2xl transition-all active:scale-[0.98]"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-2">
                    <Heart className="w-6 h-6 fill-white" />
                  </div>
                  <h4 className="font-black text-xl tracking-tight">Crie sua Prece</h4>
                  <p className="text-white/80 text-sm leading-relaxed">Abra seu coração e registre suas conversas com Deus.</p>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-2xl py-3 px-6 text-xs font-black uppercase tracking-widest border border-white/30">
                  Escrever Agora
                </div>
              </div>
            </div>
            
            <AdBanner type="large" />
          </div>
        )}

        {activeTab === 'bible' && <div className="space-y-8 animate-in slide-in-from-right duration-500"><BiblePlan /><AdBanner /></div>}
        {activeTab === 'posters' && (
          <div className="space-y-10 animate-in slide-in-from-bottom duration-500">
             <div className="space-y-2">
                <h2 className="text-4xl font-bold text-gray-800 serif leading-tight">Galeria de Fé</h2>
                <p className="text-gray-500 font-medium">Compartilhe e salve as promessas.</p>
             </div>
            <div className="grid grid-cols-1 gap-10">
              {DEFAULT_POSTERS.slice(0, 2).map(p => <VersePoster key={p.id} poster={p} />)}
              <AdBanner type="large" />
              {DEFAULT_POSTERS.slice(2).map(p => <VersePoster key={p.id} poster={p} />)}
            </div>
          </div>
        )}
        {activeTab === 'audio' && (
          <div className="space-y-10 animate-in zoom-in duration-500">
            <div className="space-y-2">
                <h2 className="text-4xl font-bold text-gray-800 serif leading-tight">Refúgio Sonoro</h2>
                <p className="text-gray-500 font-medium">Pause e ouça a voz da paz.</p>
            </div>
            <AdBanner />
            <div className="grid grid-cols-1 gap-6">
              {audioList.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => handlePlayAudioList(i, item.text)} 
                  className={`bg-white rounded-[2rem] p-6 border-2 flex items-center justify-between shadow-sm transition-all cursor-pointer active:scale-[0.98] ${currentAudioIndex === i ? 'border-amber-400 bg-amber-50 shadow-xl' : 'border-transparent hover:border-amber-100 hover:shadow-md'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${currentAudioIndex === i ? 'bg-amber-500 text-white shadow-lg' : 'bg-amber-50 text-amber-600'}`}>
                        {currentAudioIndex === i && audioLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <item.icon className="w-7 h-7" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-lg leading-tight">{item.title}</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{item.duration} • MP3</p>
                    </div>
                  </div>
                  <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentAudioIndex === i ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600