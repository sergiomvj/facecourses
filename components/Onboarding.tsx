import React, { useState } from 'react';
import type { OnboardingData, Lesson } from '../types';
import { AUDIENCE_OPTIONS, FORMAT_OPTIONS, LANGUAGE_OPTIONS } from '../constants';
import { suggestInitialTopics } from '../services/geminiService';
import { IconSparkles } from './Icons';

interface OnboardingProps {
  onTopicsGenerated: (data: OnboardingData, topics: Lesson[]) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onTopicsGenerated }) => {
  const [data, setData] = useState<OnboardingData>({
    topic: '',
    audience: 'iniciantes',
    format: 'video',
    language: 'pt-BR',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = <T extends keyof OnboardingData,>(
    field: T,
    value: OnboardingData[T]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.topic.trim()) {
      setError('Por favor, preencha o tema do curso.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const topics = await suggestInitialTopics(data);
      onTopicsGenerated(data, topics);
    // FIX: Added curly braces to the catch block to fix syntax error.
    } catch (err) {
      setError('Ocorreu um erro ao gerar os tópicos. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 pt-8">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">
          Crie seu próximo curso
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-3 mb-8">
          Responda algumas perguntas para a IA gerar uma lista de tópicos para seu curso.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Qual é o tema do curso?
            </label>
            <input
              type="text"
              id="topic"
              value={data.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              placeholder="Ex: Marketing Digital para Redes Sociais"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Qual é o público-alvo?
            </label>
            <select
              id="audience"
              value={data.audience}
              onChange={(e) => handleInputChange('audience', e.target.value as OnboardingData['audience'])}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Qual é o formato desejado?
            </label>
            <select
              id="format"
              value={data.format}
              onChange={(e) => handleInputChange('format', e.target.value as OnboardingData['format'])}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
           <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Qual é o idioma inicial?
            </label>
            <select
              id="language"
              value={data.language}
              onChange={(e) => handleInputChange('language', e.target.value as OnboardingData['language'])}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando Tópicos...
              </>
            ) : (
             <>
                <IconSparkles className="w-5 h-5" />
                Gerar Tópicos com IA
             </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;