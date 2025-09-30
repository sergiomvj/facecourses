import React, { useState } from 'react';
import type { AppState, CourseData, OnboardingData, Lesson } from './types';
import Onboarding from './components/Onboarding';
import CourseBuilder from './components/CourseBuilder';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Header from './components/Header';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [courseData, setCourseData] = useState<CourseData | null>(null);

  const handleLogin = () => {
    setAppState('onboarding');
  };

  const handleLogout = () => {
    setCourseData(null);
    setAppState('login');
  };

  const handleTopicsGenerated = (onboardingData: OnboardingData, topics: Lesson[]) => {
    setCourseData({
      onboarding: onboardingData,
      modules: [{
        id: `m${Date.now()}`,
        title: `Módulo Principal: ${onboardingData.topic}`,
        lessons: topics,
      }],
      design: {
        primaryColor: '#4F46E5',
        font: 'Inter',
        logoUrl: '',
      },
    });
    setAppState('building');
  };
  
  const handlePublish = (finalData: CourseData) => {
    setCourseData(finalData);
    setAppState('published');
  };

  if (appState === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="font-sans min-h-screen">
      <Header onLogout={handleLogout} />
      <main>
        {appState === 'onboarding' && <Onboarding onTopicsGenerated={handleTopicsGenerated} />}
        {appState === 'building' && courseData && <CourseBuilder initialData={courseData} onPublish={handlePublish} />}
        {appState === 'published' && courseData && <Dashboard courseData={courseData} />}
      </main>
    </div>
  );
};

export default App;
