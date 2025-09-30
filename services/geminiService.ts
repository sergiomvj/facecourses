import { GoogleGenAI, Type } from "@google/genai";
import type { OnboardingData, Lesson } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const suggestInitialTopics = async (data: OnboardingData): Promise<Lesson[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Você é um especialista em design instrucional. Baseado no tema "${data.topic}", para um público de "${data.audience}" que prefere o formato "${data.format}" no idioma "${data.language}", sugira uma lista de 8 a 12 tópicos de aulas essenciais para cobrir o assunto. Para cada aula, forneça um título, um tipo ('video', 'texto', 'animacao', 'audio') e uma duração estimada (ex: "10 min" ou "30s"). Retorne a resposta como um JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['video', 'texto', 'animacao', 'audio'] },
              content: { type: Type.STRING },
              duration: { type: Type.STRING },
            }
          }
        }
      }
    });

    const jsonString = response.text.trim();
    const topics = JSON.parse(jsonString);
    // Ensure content is initialized as an empty string for all generated topics
    return topics.map((topic: Partial<Lesson>) => ({
        ...topic,
        id: topic.id || `l${Date.now()}${Math.random()}`,
        content: '',
        videoType: 'narrative',
    })) as Lesson[];
  } catch (error) {
    console.error("Error fetching initial topics:", error);
    // Return a fallback structure in case of API error
    return [
      { id: 'l1', title: 'Aula 1: Bem-vindo ao Curso', type: 'video', content: '', duration: '5 min', videoType: 'narrative' },
      { id: 'l2', title: 'Aula 2: Conceitos Fundamentais', type: 'texto', content: '', duration: '15 min', videoType: 'narrative' },
      { id: 'l3', title: 'Aula 3: Tópico Avançado', type: 'video', content: '', duration: '20 min', videoType: 'narrative' },
    ];
  }
};

export const generateAIText = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating AI text:", error);
        return "Desculpe, não foi possível gerar o conteúdo. Tente novamente.";
    }
};