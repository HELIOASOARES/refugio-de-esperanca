
import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';

interface AdBannerProps {
  type?: 'inline' | 'large';
}

const AdBanner: React.FC<AdBannerProps> = ({ type = 'inline' }) => {
  return (
    <div className={`relative bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50 overflow-hidden ${type === 'large' ? 'p-8' : 'p-4'}`}>
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold text-amber-800 tracking-tighter uppercase">
        <Tag className="w-2 h-2" /> Patrocinado
      </div>
      
      <div className="flex items-center gap-4">
        <div className={`shrink-0 rounded-xl bg-amber-200 flex items-center justify-center overflow-hidden ${type === 'large' ? 'w-20 h-20' : 'w-12 h-12'}`}>
          <img src="https://picsum.photos/seed/ad/200/200" alt="Sponsor" className="w-full h-full object-cover opacity-80" />
        </div>
        
        <div className="flex-1">
          <h4 className={`font-bold text-amber-900 ${type === 'large' ? 'text-lg' : 'text-sm'}`}>Conheça a Coleção Fé</h4>
          <p className={`text-amber-800/60 leading-tight ${type === 'large' ? 'text-sm mt-1' : 'text-xs'}`}>
            Bíblias de estudo e harpas cristãs com descontos exclusivos para usuários do app.
          </p>
        </div>
        
        <button className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdBanner;
