
import React, { useState, useRef } from 'react';
import { Download, Share2, Heart, Check, Loader2 } from 'lucide-react';
import { VersePoster as PosterType } from '../types';
import ShareMenu from './ShareMenu';

interface VersePosterProps {
  poster: PosterType;
}

const VersePoster: React.FC<VersePosterProps> = ({ poster }) => {
  const [liked, setLiked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = poster.imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height * 0.4);
      gradient.addColorStop(0, 'rgba(0,0,0,0.85)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'white';
      const padding = canvas.width * 0.08;
      const maxWidth = canvas.width - (padding * 2);
      const fontSize = Math.floor(canvas.width * 0.06);
      ctx.font = `italic bold ${fontSize}px serif`;
      
      const words = `"${poster.text}"`.split(' ');
      let line = '';
      let y = canvas.height - (padding * 2.5);
      const lineHeight = fontSize * 1.3;
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      for (let i = lines.length - 1; i >= 0; i--) {
        ctx.fillText(lines[i], padding, y);
        y -= lineHeight;
      }

      ctx.font = `bold ${Math.floor(fontSize * 0.5)}px sans-serif`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(poster.reference.toUpperCase(), padding, canvas.height - padding);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `versiculo-${poster.id}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
        <div className="aspect-[4/5] relative overflow-hidden">
          <img 
            src={poster.imageUrl} 
            alt="Poster" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
            <h3 className="serif text-white text-2xl md:text-3xl leading-snug mb-4 drop-shadow-md">
              "{poster.text}"
            </h3>
            <p className="text-amber-200 font-medium tracking-widest uppercase text-xs">
              {poster.reference}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 bg-white">
          <button 
            onClick={() => setLiked(!liked)}
            className={`transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </button>
          <div className="flex gap-4">
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setShowShareMenu(true)}
              className="text-gray-400 hover:text-amber-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      {showShareMenu && (
        <ShareMenu 
          onClose={() => setShowShareMenu(false)}
          text={`"${poster.text}" — ${poster.reference}`}
          url={window.location.href}
        />
      )}
    </>
  );
};

export default VersePoster;
