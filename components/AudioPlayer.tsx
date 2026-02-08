
import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { generateAudioForVerse } from '../services/geminiService.ts';

interface AudioPlayerProps {
  verse: string;
  reference: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ verse, reference }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

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

  const handlePlay = async () => {
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    setLoading(true);
    try {
      const base64Audio = await generateAudioForVerse(verse);
      if (!base64Audio) throw new Error("Audio generation failed");

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      
      source.start();
      sourceRef.current = source;
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio playback error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-md border border-amber-100 rounded-2xl p-6 flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-amber-800 font-medium mb-1">{reference}</p>
        <p className="text-gray-600 text-sm italic">Ouça a Palavra</p>
      </div>
      
      <button 
        onClick={handlePlay}
        disabled={loading}
        className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-8 h-8 fill-current" />
        ) : (
          <Play className="w-8 h-8 fill-current ml-1" />
        )}
      </button>

      <div className="flex items-center gap-2 text-amber-900/60">
        <Volume2 className="w-4 h-4" />
        <div className="w-32 h-1 bg-amber-200 rounded-full overflow-hidden">
          <div className={`h-full bg-amber-500 transition-all duration-300 ${isPlaying ? 'w-full' : 'w-0'}`} />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
