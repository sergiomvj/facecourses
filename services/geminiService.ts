
import { GoogleGenAI, Type } from "@google/genai";
import type { OnboardingData, TemplateSuggestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const suggestCourseTemplates = async (data: OnboardingData): Promise<TemplateSuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Você é um especialista em design instrucional. Baseado no tema "${data.topic}", para um público de "${data.audience}" que prefere o formato "${data.format}", sugira 3 templates de estrutura de curso. Para cada template, forneça um nome (ex: "Mini Curso em 5 Lições"), uma breve descrição, e uma estrutura inicial com módulos e aulas (incluindo uma duração estimada para cada aula, ex: "10 min"). Retorne a resposta como um JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              structure: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    lessons: {
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
                }
              }
            }
          }
        }
      }
    });

    const jsonString = response.text.trim();
    const suggestions = JSON.parse(jsonString);
    return suggestions;
  } catch (error) {
    console.error("Error fetching course templates:", error);
    // Return a fallback structure in case of API error
    return [
      {
        name: "Exemplo: Curso Rápido",
        description: "Um curso compacto com 3 módulos para aprendizado rápido.",
        structure: [
          { id: 'm1', title: 'Módulo 1: Introdução', lessons: [
            { id: 'l1', title: 'Aula 1: Bem-vindo ao Curso', type: 'video', content: '', duration: '5 min' },
            { id: 'l2', title: 'Aula 2: Conceitos Fundamentais', type: 'texto', content: '', duration: '15 min' },
          ]},
          { id: 'm2', title: 'Módulo 2: Aprofundamento', lessons: [
            { id: 'l3', title: 'Aula 3: Tópico Avançado', type: 'video', content: '', duration: '20 min' },
          ]},
        ]
      }
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