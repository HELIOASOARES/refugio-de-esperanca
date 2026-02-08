
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  // Verificação segura para evitar crash em navegadores que não definem 'process'
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDailyDevotional = async (topic?: string) => {
  try {
    const ai = getAI();
    const prompt = topic 
      ? `Crie um devocional cristão curto e inspirador sobre ${topic}. Inclua título, versículo, referência e um texto de reflexão de 3 parágrafos. Foco em esperança e amor.`
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

    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    console.error("Erro no serviço Gemini:", error);
    throw error;
  }
};

export const generateAudioForVerse = async (text: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Leia com voz suave e inspiradora: ${text}` }] }],
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
  } catch (error) {
    console.error("Erro na geração de áudio:", error);
    return null;
  }
};
