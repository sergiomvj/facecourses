
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CourseData } from '../types';
import { IconCheckCircle } from './Icons';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  courseData: CourseData;
}

const mockAnalyticsData = [
  { name: 'Módulo 1', conclusão: 95 },
  { name: 'Módulo 2', conclusão: 82 },
  { name: 'Módulo 3', conclusione: 75 },
  { name: 'Módulo 4', conclusione: 60 },
];


const Dashboard: React.FC<DashboardProps> = ({ courseData }) => {
  const { theme } = useTheme();
  const shareableLink = `https://face.courses/c/${courseData.onboarding.topic.toLowerCase().replace(/\s+/g, '-')}`;
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const tooltipBackgroundColor = theme === 'dark' ? '#1F2937' : '#FFFFFF';
  const tooltipBorderColor = theme === 'dark' ? '#374151' : '#E5E7EB';

  return (
    <div className="p-4 sm:p-8">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-green-200 dark:border-green-800">
            <IconCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Curso Publicado com Sucesso!</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
                Parabéns! Seu curso sobre <span className="font-semibold text-primary-600 dark:text-primary-400">{courseData.onboarding.topic}</span> está no ar.
            </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
            {/* Share Section */}
            <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
                <h2 className="text-xl font-semibold">Distribuição & Engajamento</h2>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Link Compartilhável</label>
                    <input type="text" readOnly value={shareableLink} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
                </div>
                <div className="flex flex-col space-y-2">
                    <button className="w-full text-sm text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Compartilhar no Facebook</button>
                    <button className="w-full text-sm text-center bg-black text-white py-2 rounded-lg hover:bg-gray-800">Compartilhar no X</button>
                </div>
                 <div>
                    <h3 className="text-md font-semibold mt-4">Exportar</h3>
                    <div className="flex flex-col space-y-2 mt-2">
                        <button className="w-full text-sm text-left bg-gray-100 dark:bg-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Exportar como SCORM/xAPI</button>
                        <button className="w-full text-sm text-left bg-gray-100 dark:bg-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Baixar como PDF/MP4</button>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Painel do Criador (Analytics)</h2>
                 <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">88%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Taxa de Conclusão</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">1,245</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Alunos Inscritos</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">4.8/5</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Avaliação Média</p>
                    </div>
                </div>
                <h3 className="font-semibold text-md mb-2">Conclusão por Módulo</h3>
                <div style={{ width: '100%', height: 250 }}>
                     <ResponsiveContainer>
                        <BarChart data={mockAnalyticsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={axisColor} />
                            <XAxis dataKey="name" fontSize={12} stroke={axisColor} />
                            <YAxis unit="%" fontSize={12} stroke={axisColor} />
                            <Tooltip contentStyle={{ backgroundColor: tooltipBackgroundColor, border: `1px solid ${tooltipBorderColor}` }} />
                            <Bar dataKey="conclusão" fill="#4F46E5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="mt-6 bg-primary-50 dark:bg-primary-900/40 border-l-4 border-primary-500 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-primary-800 dark:text-primary-200">Sugestão da IA</h4>
                    <p className="text-sm text-primary-700 dark:text-primary-300">Seu módulo 4 tem queda de retenção. Que tal dividir em duas aulas menores para facilitar o aprendizado?</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
