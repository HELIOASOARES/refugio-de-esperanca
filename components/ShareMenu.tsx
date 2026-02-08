
import React from 'react';
import { X, Mail, MessageSquare, Send, Globe, Copy } from 'lucide-react';

interface ShareMenuProps {
  onClose: () => void;
  text: string;
  url: string;
}

const ShareMenu: React.FC<ShareMenuProps> = ({ onClose, text, url }) => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  const platforms = [
    { name: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500', href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}` },
    { name: 'Telegram', icon: Send, color: 'bg-blue-400', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { name: 'Email', icon: Mail, color: 'bg-red-400', href: `mailto:?subject=Refúgio de Esperança&body=${encodedText}%20${encodedUrl}` },
    { name: 'Discord', icon: Globe, color: 'bg-indigo-500', href: `https://discord.com/channels/@me` },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${text}\n\n${url}`);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="bg-white w-full max-w-2xl rounded-t-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500 relative z-[301]">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 serif">Compartilhar</h3>
            <p className="text-sm text-gray-400 font-medium">Leve esperança para alguém hoje.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-6 mb-10">
          {platforms.map((p) => (
            <a 
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 group"
            >
              <div className={`${p.color} text-white p-5 rounded-3xl shadow-lg group-hover:scale-110 group-active:scale-95 transition-all`}>
                <p.icon className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{p.name}</span>
            </a>
          ))}
          <button 
            onClick={copyToClipboard}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="bg-gray-800 text-white p-5 rounded-3xl shadow-lg group-hover:scale-110 group-active:scale-95 transition-all">
              <Copy className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Copiar</span>
          </button>
        </div>
        
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
          <p className="text-[10px] text-amber-600 font-bold mb-3 uppercase tracking-[0.2em]">Visualização da Mensagem</p>
          <p className="text-gray-700 italic leading-relaxed">"{text}"</p>
        </div>
      </div>
    </div>
  );
};

export default ShareMenu;
