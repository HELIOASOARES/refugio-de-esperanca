
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyDevotional = async (topic?: string) => {
  const prompt = topic 
    ? `Crie um devocional cristão curto e inspirador sobre ${topic}. Inclua um título, um versículo chave, a referência bíblica e um texto de reflexão de 3 parágrafos. Foco em esperança e amor.`
    : "Crie um devocional cristão diário inspirador. Inclua um título, um versículo chave, a referência bíblica e um texto de reflexão de 3 parágrafos. Foco em esperança e amor.";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          verse: { type: Type.STRING },
          reference: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["title", "verse", "reference", "content"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateAudioForVerse = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Leia este versículo com calma e paz: ${text}` }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
