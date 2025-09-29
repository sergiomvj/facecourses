import React, { useState, useCallback } from 'react';
import type { CourseData, Module, Lesson, TemplateSuggestion, LessonType } from '../types';
import { getLessonTypeInfo, LESSON_TYPE_OPTIONS } from '../constants';
import { generateAIText } from '../services/geminiService';
import { IconPlus, IconSparkles, IconTrash, IconPencil, IconChevronDown, IconChevronUp, IconClock } from './Icons';

const PODCAST_SPEAKER_OPTIONS = [
    { value: 'man_woman', label: 'Um homem e uma mulher' },
    { value: 'two_men', label: 'Dois homens' },
    { value: 'two_women', label: 'Duas mulheres' },
];

// Sub-component for content editing, defined outside to avoid re-renders
const ContentEditor = ({
    lesson,
    onSave,
    onClose,
    courseTopic
}: {
    lesson: Lesson;
    onSave: (updatedLesson: Lesson) => void;
    onClose: () => void;
    courseTopic: string;
}) => {
    const [currentLesson, setCurrentLesson] = useState(lesson);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAIGenerate = async (action: 'expandir' | 'revisar' | 'sumarizar') => {
        setIsGenerating(true);
        let context = `Para um curso sobre "${courseTopic}", na aula "${currentLesson.title}"`;
        if (currentLesson.type === 'video') {
            context += ", que é um roteiro de vídeo";
        } else if (currentLesson.type === 'audio') {
            context += ", que é um roteiro de áudio";
        }

        let actionDescription;
        switch (action) {
            case 'expandir':
                actionDescription = "elabore o texto a seguir, tornando-o mais detalhado e abrangente para um contexto educacional. Adicione mais explicações, exemplos e profundidade ao conteúdo existente.";
                break;
            case 'revisar':
                actionDescription = "revise o texto a seguir para corrigir erros gramaticais e de ortografia, melhorar a clareza e o estilo, e garantir que seja envolvente para os alunos.";
                break;
            case 'sumarizar':
                actionDescription = "resuma o texto a seguir, extraindo os pontos mais importantes e criando uma versão concisa e clara.";
                break;
        }

        const prompt = `Você é um especialista em criação de conteúdo para cursos. ${context}, por favor, ${actionDescription}\n\nTexto original:\n"${currentLesson.content}"`;
        const newContent = await generateAIText(prompt);
        setCurrentLesson(prev => ({ ...prev, content: newContent }));
        setIsGenerating(false);
    };

    const handleAIGeneratePlaceholder = async () => {
        setIsGenerating(true);
        let prompt = `Você é um especialista em criação de conteúdo para cursos. Para um curso sobre "${courseTopic}", gere um conteúdo inicial para a aula intitulada "${currentLesson.title}".`;

        if (currentLesson.type === 'texto') {
            prompt += ` O conteúdo deve ser um texto base que o criador do curso possa expandir e refinar.`
        } else if (currentLesson.type === 'video' || currentLesson.type === 'audio') {
            const medium = currentLesson.type === 'video' ? 'vídeo' : 'áudio';
            prompt += ` O conteúdo deve ser um roteiro para um ${medium}.`
            
            if (currentLesson.type === 'video' && currentLesson.videoType === 'dialogue') {
                if (currentLesson.isPodcast) {
                    const speakersMap = {
                        'two_men': 'dois homens',
                        'two_women': 'duas mulheres',
                        'man_woman': 'um homem e uma mulher'
                    };
                    const speakerText = speakersMap[currentLesson.podcastSpeakers || 'man_woman'];
                    prompt += ` O formato é um podcast de diálogo entre ${speakerText}. O roteiro deve indicar claramente as falas de cada apresentador (ex: Apresentador 1:, Apresentador 2:).`
                } else {
                    prompt += ` O formato é um diálogo entre duas pessoas. O roteiro deve indicar as falas de cada pessoa.`
                }
            } else { // narrative for video, or any audio
                prompt += ` O formato é narrativo, com um único apresentador.`
            }
        }
        const newContent = await generateAIText(prompt);
        setCurrentLesson(prev => ({ ...prev, content: newContent }));
        setIsGenerating(false);
    };

    const handleVideoTypeChange = (type: 'narrative' | 'dialogue') => {
        setCurrentLesson(prev => {
            if (type === 'narrative') {
                const { isPodcast, podcastSpeakers, ...rest } = prev;
                return { ...rest, videoType: 'narrative' };
            }
            return { ...prev, videoType: 'dialogue' };
        });
    };

    const handlePodcastToggle = (isChecked: boolean) => {
        setCurrentLesson(prev => {
            if (!isChecked) {
                const { podcastSpeakers, ...rest } = prev;
                return { ...rest, isPodcast: false };
            }
            return { ...prev, isPodcast: true, podcastSpeakers: prev.podcastSpeakers || 'man_woman' };
        });
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Editar Aula: {lesson.title}</h3>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título da Aula</label>
                        <input
                            type="text"
                            value={currentLesson.title}
                            onChange={(e) => setCurrentLesson(prev => ({ ...prev, title: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Aula</label>
                         <select
                            value={currentLesson.type}
                            onChange={(e) => setCurrentLesson(prev => ({...prev, type: e.target.value as LessonType}))}
                            className="mt-1 w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        >
                            {LESSON_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Duração (opcional)</label>
                        <input
                            type="text"
                            placeholder="Ex: 10 min"
                            value={currentLesson.duration || ''}
                            onChange={(e) => setCurrentLesson(prev => ({ ...prev, duration: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    {['texto', 'video', 'audio'].includes(currentLesson.type) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {currentLesson.type === 'texto' ? 'Conteúdo do Texto' : 'Roteiro / Conteúdo'}
                            </label>
                            <textarea
                                value={currentLesson.content}
                                onChange={(e) => setCurrentLesson(prev => ({ ...prev, content: e.target.value }))}
                                rows={10}
                                placeholder="Clique em 'Gerar Conteúdo' para começar com a ajuda da IA..."
                                className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={handleAIGeneratePlaceholder} disabled={isGenerating} className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full hover:bg-primary-200 disabled:opacity-50 flex items-center gap-1">
                                    <IconSparkles className="w-3 h-3"/> Gerar Conteúdo
                                </button>
                                {currentLesson.type === 'texto' && (['expandir', 'revisar', 'sumarizar'] as const).map(action => (
                                    <button key={action} onClick={() => handleAIGenerate(action)} disabled={isGenerating || !currentLesson.content.trim()} title={!currentLesson.content.trim() ? "Escreva um conteúdo para habilitar esta ação" : ""} className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full hover:bg-primary-200 disabled:opacity-50 flex items-center gap-1">
                                        <IconSparkles className="w-3 h-3"/> {action.charAt(0).toUpperCase() + action.slice(1)}
                                    </button>
                                ))}
                                {(currentLesson.type === 'video' || currentLesson.type === 'audio') && (
                                    <button onClick={() => handleAIGenerate('expandir')} disabled={isGenerating || !currentLesson.content.trim()} title={!currentLesson.content.trim() ? "Escreva um conteúdo para habilitar esta ação" : ""} className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full hover:bg-primary-200 disabled:opacity-50 flex items-center gap-1">
                                        <IconSparkles className="w-3 h-3"/> Expandir Conteúdo
                                    </button>
                                )}
                                {isGenerating && <p className="text-xs text-gray-500 animate-pulse">Gerando...</p>}
                            </div>
                        </div>
                    )}
                    
                    {currentLesson.type === 'video' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Vídeo</label>
                                <div className="mt-2 flex gap-4">
                                    <label className="flex items-center">
                                        <input type="radio" name="videoType" value="narrative" checked={currentLesson.videoType === 'narrative' || !currentLesson.videoType} onChange={() => handleVideoTypeChange('narrative')} className="form-radio text-primary-600 h-4 w-4"/>
                                        <span className="ml-2 text-sm text-gray-700">Narrativo</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="videoType" value="dialogue" checked={currentLesson.videoType === 'dialogue'} onChange={() => handleVideoTypeChange('dialogue')} className="form-radio text-primary-600 h-4 w-4"/>
                                        <span className="ml-2 text-sm text-gray-700">Diálogo</span>
                                    </label>
                                </div>
                            </div>

                            {currentLesson.videoType === 'dialogue' && (
                                <div className="pl-4 border-l-2 border-gray-200 mt-4 space-y-4">
                                    <div>
                                        <label className="flex items-center">
                                            <input type="checkbox" checked={!!currentLesson.isPodcast} onChange={(e) => handlePodcastToggle(e.target.checked)} className="form-checkbox text-primary-600 rounded h-4 w-4"/>
                                            <span className="ml-2 text-sm font-medium text-gray-700">Formato Podcast</span>
                                        </label>
                                    </div>

                                    {currentLesson.isPodcast && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Apresentadores</label>
                                            <div className="mt-2 flex flex-col sm:flex-row sm:gap-4">
                                                {PODCAST_SPEAKER_OPTIONS.map(opt => (
                                                    <label key={opt.value} className="flex items-center">
                                                        <input type="radio" name="podcastSpeakers" value={opt.value} checked={currentLesson.podcastSpeakers === opt.value} onChange={() => setCurrentLesson(prev => ({...prev, podcastSpeakers: opt.value as Lesson['podcastSpeakers']}))} className="form-radio text-primary-600 h-4 w-4"/>
                                                        <span className="ml-2 text-sm text-gray-700">{opt.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">URL do Vídeo ou Upload</label>
                                <input type="file" className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button onClick={() => onSave(currentLesson)} className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};


interface CourseBuilderProps {
  initialData: CourseData;
  onPublish: (finalData: CourseData) => void;
}

const CourseBuilder: React.FC<CourseBuilderProps> = ({ initialData, onPublish }) => {
  const [courseData, setCourseData] = useState<CourseData>(initialData);
  const [activeStep, setActiveStep] = useState(0);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [openModuleId, setOpenModuleId] = useState<string | null>(initialData.modules[0]?.id || null);

  const steps = ['Estrutura', 'Design', 'Publicar'];
  
  const updateModules = (newModules: Module[]) => {
    setCourseData(prev => ({...prev, modules: newModules}));
  };

  const addModule = () => {
    const newModule: Module = { id: `m${Date.now()}`, title: 'Novo Módulo', lessons: [] };
    updateModules([...courseData.modules, newModule]);
  };

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = { id: `l${Date.now()}`, title: 'Nova Aula', type: 'video', content: '', duration: '', videoType: 'narrative' };
    const newModules = courseData.modules.map(m => m.id === moduleId ? {...m, lessons: [...m.lessons, newLesson]} : m);
    updateModules(newModules);
  };

  const updateLesson = (updatedLesson: Lesson) => {
    const newModules = courseData.modules.map(m => ({
        ...m,
        lessons: m.lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l)
    }));
    updateModules(newModules);
    setEditingLesson(null);
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
     const newModules = courseData.modules.map(m => m.id === moduleId ? {...m, lessons: m.lessons.filter(l => l.id !== lessonId)} : m);
     updateModules(newModules);
  }

  const removeModule = (moduleId: string) => {
    updateModules(courseData.modules.filter(m => m.id !== moduleId));
  }
  
  const handleAIGenerateTitle = async (type: 'module' | 'lesson', id: string, context?: string) => {
    const prompt = type === 'module'
      ? `Sugira um título de módulo para um curso sobre "${courseData.onboarding.topic}".`
      : `Sugira um título de aula para o módulo "${context}" de um curso sobre "${courseData.onboarding.topic}".`;
    const newTitle = await generateAIText(prompt);

    const newModules = courseData.modules.map(m => {
        if(type === 'module' && m.id === id) return {...m, title: newTitle.replace(/"/g, '')};
        return {
            ...m,
            lessons: m.lessons.map(l => l.id === id ? {...l, title: newTitle.replace(/"/g, '')} : l)
        }
    });
    updateModules(newModules);
  };
  

  const StructureStep = () => (
    <div className="space-y-4">
        {courseData.modules.map((module) => (
             <div key={module.id} className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setOpenModuleId(openModuleId === module.id ? null : module.id)}>
                    <div className="flex items-center gap-2 flex-grow">
                        <input value={module.title} onChange={e => updateModules(courseData.modules.map(m => m.id === module.id ? {...m, title: e.target.value} : m))} className="font-semibold text-lg p-1 rounded-md w-full hover:bg-gray-100 focus:bg-gray-100 outline-none"/>
                        <button onClick={(e) => {e.stopPropagation(); handleAIGenerateTitle('module', module.id)}} className="p-1 text-primary-600 hover:text-primary-800"><IconSparkles className="w-5 h-5"/></button>
                        <button onClick={(e) => {e.stopPropagation(); removeModule(module.id)}} className="p-1 text-red-500 hover:text-red-700"><IconTrash className="w-5 h-5"/></button>
                    </div>
                    {openModuleId === module.id ? <IconChevronUp className="w-5 h-5" /> : <IconChevronDown className="w-5 h-5" />}
                </div>
                {openModuleId === module.id && (
                    <div className="px-4 pb-4 space-y-2 border-t">
                        {module.lessons.map(lesson => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center gap-3 flex-grow min-w-0">
                                    {getLessonTypeInfo(lesson.type)?.icon}
                                    <span className="truncate">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                     {lesson.duration && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mr-2">
                                            <IconClock className="w-4 h-4" />
                                            <span>{lesson.duration}</span>
                                        </div>
                                    )}
                                     <button onClick={() => handleAIGenerateTitle('lesson', lesson.id, module.title)} className="p-1 text-primary-600 hover:text-primary-800"><IconSparkles className="w-4 h-4"/></button>
                                     <button onClick={() => setEditingLesson(lesson)} className="p-1 text-gray-500 hover:text-gray-800"><IconPencil className="w-4 h-4"/></button>
                                     <button onClick={() => removeLesson(module.id, lesson.id)} className="p-1 text-red-500 hover:text-red-700"><IconTrash className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => addLesson(module.id)} className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-primary-600 font-semibold p-2 rounded-md hover:bg-primary-50">
                            <IconPlus className="w-4 h-4" /> Adicionar Aula
                        </button>
                    </div>
                )}
             </div>
        ))}
         <button onClick={addModule} className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 font-semibold p-3 border-2 border-dashed rounded-lg hover:bg-gray-100 hover:border-gray-400">
            <IconPlus className="w-5 h-5" /> Adicionar Módulo
        </button>
    </div>
  );
  
  const DesignStep = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <h3 className="text-xl font-semibold">Design & Branding</h3>
         <div>
            <label className="block text-sm font-medium text-gray-700">Cor Principal</label>
            <input type="color" defaultValue="#4F46E5" className="mt-1 w-24 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Fonte</label>
            <select className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                <option>Inter</option>
                <option>Roboto</option>
                <option>Lato</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Logo (URL)</label>
            <input type="text" placeholder="https://exemplo.com/logo.png" className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
        </div>
    </div>
  );

  const PublishStep = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <h3 className="text-xl font-semibold">Publicação</h3>
        <div>
            <h4 className="font-medium text-gray-800">Visibilidade do Curso</h4>
            <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2"><input type="radio" name="visibility" className="form-radio text-primary-600" defaultChecked /> Público</label>
                <label className="flex items-center gap-2"><input type="radio" name="visibility" className="form-radio text-primary-600" /> Restrito</label>
                <label className="flex items-center gap-2"><input type="radio" name="visibility" className="form-radio text-primary-600" /> Pago</label>
            </div>
        </div>
        <div>
            <h4 className="font-medium text-gray-800">Recursos Adicionais</h4>
            <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox text-primary-600 rounded" /> Legendas Automáticas</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox text-primary-600 rounded" /> Certificado de Conclusão</label>
            </div>
        </div>
    </div>
  );

  const renderStepContent = () => {
    switch(activeStep) {
        case 0: return <StructureStep />;
        case 1: return <DesignStep />;
        case 2: return <PublishStep />;
        default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {editingLesson && <ContentEditor lesson={editingLesson} onSave={updateLesson} onClose={() => setEditingLesson(null)} courseTopic={courseData.onboarding.topic} />}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Criador de Cursos</h1>
        <p className="text-gray-600 mb-6">Curso sobre: <span className="font-semibold text-primary-700">{courseData.onboarding.topic}</span></p>

        <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= activeStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{index + 1}</div>
                        <span className={`ml-2 font-medium ${index <= activeStep ? 'text-primary-700' : 'text-gray-500'}`}>{step}</span>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-grow h-1 mx-4 ${index < activeStep ? 'bg-primary-500' : 'bg-gray-200'}`}></div>}
                </React.Fragment>
            ))}
        </div>
        
        <div className="my-8">
            {renderStepContent()}
        </div>

        <div className="flex justify-between">
            <button 
                onClick={() => setActiveStep(s => Math.max(0, s-1))} 
                disabled={activeStep === 0}
                className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
                Anterior
            </button>
            {activeStep === steps.length - 1 ? (
                 <button onClick={() => onPublish(courseData)} className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                    Publicar Curso
                 </button>
            ): (
                 <button 
                    onClick={() => setActiveStep(s => Math.min(steps.length - 1, s+1))}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                >
                    Próximo
                 </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder;