
import React, { useState } from 'react';
import type { AppState, CourseData, OnboardingData, TemplateSuggestion } from './types';
import Onboarding from './components/Onboarding';
import CourseBuilder from './components/CourseBuilder';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [templateSuggestions, setTemplateSuggestions] = useState<TemplateSuggestion[]>([]);

  const handleTemplatesGenerated = (onboardingData: OnboardingData, templates: TemplateSuggestion[]) => {
    setCourseData({
      onboarding: onboardingData,
      modules: [], // Will be set when a template is chosen
      design: {
        primaryColor: '#4F46E5',
        font: 'Inter',
        logoUrl: '',
      },
    });
    setTemplateSuggestions(templates);
  };
  
  const handleTemplateSelect = (template: TemplateSuggestion) => {
    if (courseData) {
        setCourseData(prev => ({...prev!, modules: template.structure}));
        setAppState('building');
    }
  };

  const handlePublish = (finalData: CourseData) => {
    setCourseData(finalData);
    setAppState('published');
  };

  const renderTemplateSelection = () => (
     <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold">Estruturas Sugeridas pela IA</h1>
            <p className="text-gray-600 mt-2 mb-8">
                Baseado nas suas respostas, aqui estão alguns pontos de partida. Escolha um para começar.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
                {templateSuggestions.map((template, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-lg border-2 border-transparent hover:border-primary-500 cursor-pointer transition flex flex-col text-left" onClick={() => handleTemplateSelect(template)}>
                        <h3 className="text-xl font-semibold text-primary-700">{template.name}</h3>
                        <p className="text-gray-600 mt-2 flex-grow">{template.description}</p>
                        <button className="w-full mt-4 bg-primary-100 text-primary-700 font-semibold py-2 rounded-lg hover:bg-primary-200">
                           Usar este Template
                        </button>
                    </div>
                ))}
            </div>
        </div>
     </div>
  );


  const renderContent = () => {
    switch (appState) {
      case 'onboarding':
        if(templateSuggestions.length > 0){
          return renderTemplateSelection();
        }
        return <Onboarding onTemplatesGenerated={handleTemplatesGenerated} />;
      case 'building':
        if (courseData) {
          return <CourseBuilder initialData={courseData} onPublish={handlePublish} />;
        }
        // Fallback to onboarding if data is missing
        setAppState('onboarding');
        return null;
      case 'published':
        if (courseData) {
          return <Dashboard courseData={courseData} />;
        }
        // Fallback to onboarding if data is missing
        setAppState('onboarding');
        return null;
      default:
        return <div>Error: Unknown application state.</div>;
    }
  };

  return <div className="font-sans">{renderContent()}</div>;
};

export default App;
