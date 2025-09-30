import React, { useState, useCallback } from 'react';
import type { CourseData, Module, Lesson, LessonType } from '../types';
import { getLessonTypeInfo, LESSON_TYPE_OPTIONS } from '../constants';
import { generateAIText } from '../services/geminiService';
import { IconPlus, IconSparkles, IconTrash, IconPencil, IconChevronDown, IconChevronUp, IconClock } from './Icons';

const PODCAST_SPEAKER_OPTIONS = [
    { value: 'man_woman', label: 'Um homem e uma mulher' },
    { value: 'two_men', label: 'Dois homens' },
    { value: 'two_women', label: 'Duas mulheres' },
];

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
    const [finalOutputs, setFinalOutputs] = useState(lesson.finalOutputs || {});
    const [isGeneratingOutput, setIsGeneratingOutput] = useState(false);

    const handleAIGenerate = async (action: 'expandir' | 'condensar' | 'alterar') => {
        setIsGenerating(true);
        let context = `Para um curso sobre "${courseTopic}", na aula "${currentLesson.title}"`;
        let actionDescription = '';
        switch (action) {
            case 'expandir': actionDescription = "expanda o conteúdo a seguir, adicionando mais detalhes, exemplos e profundidade."; break;
            case 'condensar': actionDescription = "condense (resuma) o conteúdo a seguir, focando nos pontos-chave."; break;
            case 'alterar': actionDescription = "altere (revise) o conteúdo a seguir para melhorar a clareza, o tom e o engajamento."; break;
        }
        const prompt = `Você é um especialista em criação de conteúdo para cursos. ${context}. Por favor, ${actionDescription}\n\nTexto original:\n"${currentLesson.content}"`;
        const newContent = await generateAIText(prompt);
        setCurrentLesson(prev => ({ ...prev, content: newContent }));
        setIsGenerating(false);
    };
    
    const handleAIGeneratePlaceholder = async () => {
        setIsGenerating(true);
        let prompt = `Você é um especialista em criação de conteúdo para cursos. Para um curso sobre "${courseTopic}", gere um conteúdo inicial para a aula intitulada "${currentLesson.title}".`;
        if (currentLesson.type === 'texto') prompt += ` O conteúdo deve ser um texto base que o criador do curso possa expandir e refinar.`
        else if (currentLesson.type === 'video' || currentLesson.type === 'audio') {
            const medium = currentLesson.type === 'video' ? 'vídeo' : 'áudio';
            prompt += ` O conteúdo deve ser um roteiro para um ${medium}.`
            if (currentLesson.videoType === 'dialogue') {
                if (currentLesson.isPodcast) {
                    const speakersMap = {'two_men': 'dois homens', 'two_women': 'duas mulheres', 'man_woman': 'um homem e uma mulher'};
                    const speakerText = speakersMap[currentLesson.podcastSpeakers || 'man_woman'];
                    prompt += ` O formato é um podcast de diálogo entre ${speakerText}. O roteiro deve indicar claramente as falas de cada apresentador (ex: Apresentador 1:, Apresentador 2:).`
                } else prompt += ` O formato é um diálogo entre duas pessoas. O roteiro deve indicar as falas de cada pessoa.`
            } else prompt += ` O formato é narrativo, com um único apresentador.`
        }
        const newContent = await generateAIText(prompt);
        setCurrentLesson(prev => ({ ...prev, content: newContent }));
        setIsGenerating(false);
    };

    const handleGenerateOutputs = async () => {
        if (!currentLesson.content) {
            alert("Por favor, gere ou escreva um conteúdo principal primeiro.");
            return;
        }
        setIsGeneratingOutput(true);
        const newOutputs: Lesson['finalOutputs'] = {};

        if (currentLesson.type === 'video') {
            const duration = currentLesson.duration || '';
            const isShortVideo = duration.includes('s') && parseInt(duration) <= 8;
            if (isShortVideo) {
                const prompt = `Crie um prompt curto e visualmente impactante para um vídeo de até 8 segundos (estilo Reels/Shorts) com base no seguinte roteiro: "${currentLesson.content}"`;
                newOutputs.prompt = await generateAIText(prompt);
            } else {
                newOutputs.script = currentLesson.content;
            }
        } else if (currentLesson.type === 'animacao') {
            const prompt = `Você é um diretor de arte para animações. Crie um prompt detalhado para uma animação com base no seguinte conteúdo. O prompt deve descrever claramente as cenas, elementos visuais (como personagens e cenários), transições e qualquer texto que deva aparecer na tela. O objetivo é que um animador possa usar este prompt para criar a animação. Conteúdo base: "${currentLesson.content}"`;
            newOutputs.prompt = await generateAIText(prompt);
        } else if (currentLesson.type === 'texto') {
            const prompt = `Crie um prompt para uma imagem de alta qualidade (foto ou ilustração) que acompanhe o seguinte texto: "${currentLesson.content}"`;
            newOutputs.imagePrompt = await generateAIText(prompt);
            newOutputs.htmlContent = `<p>${currentLesson.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
        }

        setFinalOutputs(newOutputs);
        setIsGeneratingOutput(false);
    };

    const handleSave = () => {
        onSave({ ...currentLesson, finalOutputs });
    };

    const inputClasses = "w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500";
    const aiButtonClasses = "inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 rounded-full hover:bg-primary-200 dark:bg-primary-900/50 dark:text-primary-300 dark:hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Aula: {lesson.title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Inputs de Título, Tipo, Duração */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Aula</label>
                            <input type="text" value={currentLesson.title} onChange={(e) => setCurrentLesson(prev => ({ ...prev, title: e.target.value }))} className={`mt-1 ${inputClasses}`}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Aula</label>
                            <select value={currentLesson.type} onChange={(e) => setCurrentLesson(prev => ({...prev, type: e.target.value as LessonType}))} className={`mt-1 ${inputClasses}`}>
                                {LESSON_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duração</label>
                            <input type="text" placeholder="Ex: 10 min, 8s" value={currentLesson.duration || ''} onChange={(e) => setCurrentLesson(prev => ({ ...prev, duration: e.target.value }))} className={`mt-1 ${inputClasses}`}/>
                        </div>
                    </div>

                    {/* Editor de Conteúdo Principal */}
                    {['texto', 'video', 'audio', 'animacao'].includes(currentLesson.type) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conteúdo Principal / Roteiro</label>
                            <textarea value={currentLesson.content} onChange={(e) => setCurrentLesson(prev => ({ ...prev, content: e.target.value }))} rows={8} placeholder="Clique em 'Gerar Conteúdo' para começar com a ajuda da IA..." className={`w-full ${inputClasses}`}/>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={handleAIGeneratePlaceholder} disabled={isGenerating} className={aiButtonClasses}><IconSparkles className="w-4 h-4"/> Gerar Conteúdo</button>
                                {(['expandir', 'condensar', 'alterar'] as const).map(action => (
                                    <button key={action} onClick={() => handleAIGenerate(action)} disabled={isGenerating || !currentLesson.content.trim()} title={!currentLesson.content.trim() ? "Escreva um conteúdo para habilitar esta ação" : ""} className={aiButtonClasses}>
                                        <IconSparkles className="w-4 h-4"/> {action.charAt(0).toUpperCase() + action.slice(1)}
                                    </button>
                                ))}
                                {isGenerating && <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse self-center">Gerando...</p>}
                            </div>
                        </div>
                    )}
                    
                    {/* Opções de Vídeo/Áudio */}
                    {(currentLesson.type === 'video' || currentLesson.type === 'audio') && (
                        // ... (código de opções de diálogo/podcast existente)
                        <div/>
                    )}

                    {/* Seção de Outputs Finais */}
                    <div className="!mt-6 pt-4 border-t dark:border-gray-700">
                        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Outputs Finais</h4>
                        <button onClick={handleGenerateOutputs} disabled={isGeneratingOutput} className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-primary-300">
                            {isGeneratingOutput ? 'Gerando...' : 'Gerar Outputs'}
                        </button>
                        <div className="mt-4 space-y-4">
                            {finalOutputs.prompt && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prompt Gerado</label>
                                    <textarea readOnly value={finalOutputs.prompt} rows={4} className={`w-full mt-1 bg-gray-50 dark:bg-gray-700 ${inputClasses}`}/>
                                </div>
                            )}
                             {finalOutputs.script && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roteiro Final</label>
                                    <textarea readOnly value={finalOutputs.script} rows={4} className={`w-full mt-1 bg-gray-50 dark:bg-gray-700 ${inputClasses}`}/>
                                </div>
                            )}
                             {finalOutputs.imagePrompt && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prompt de Imagem</label>
                                    <textarea readOnly value={finalOutputs.imagePrompt} rows={2} className={`w-full mt-1 bg-gray-50 dark:bg-gray-700 ${inputClasses}`}/>
                                </div>
                            )}
                             {finalOutputs.htmlContent && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo HTML</label>
                                    <div className={`w-full p-3 h-32 overflow-y-auto border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 mt-1`} dangerouslySetInnerHTML={{__html: finalOutputs.htmlContent}} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">Salvar Alterações</button>
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
  const dragLesson = React.useRef<number | null>(null);
  const dragOverLesson = React.useRef<number | null>(null);


  const steps = ['Estrutura', 'Design', 'Publicar'];
  
  const updateModules = (newModules: Module[]) => {
    setCourseData(prev => ({...prev, modules: newModules}));
  };

  const handleDragSort = (moduleId: string) => {
    const newModules = courseData.modules.map(m => {
        if (m.id === moduleId) {
            const lessonsClone = [...m.lessons];
            const temp = lessonsClone[dragLesson.current!];
            lessonsClone.splice(dragLesson.current!, 1);
            lessonsClone.splice(dragOverLesson.current!, 0, temp);
            return {...m, lessons: lessonsClone};
        }
        return m;
    });
    updateModules(newModules);
    dragLesson.current = null;
    dragOverLesson.current = null;
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
  
  const StructureStep = () => (
    <div className="space-y-4">
        {courseData.modules.map((module) => (
             <div key={module.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setOpenModuleId(openModuleId === module.id ? null : module.id)}>
                    <div className="flex items-center gap-2 flex-grow">
                        <input value={module.title} onChange={e => updateModules(courseData.modules.map(m => m.id === module.id ? {...m, title: e.target.value} : m))} className="font-semibold text-lg p-1 rounded-md w-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 outline-none"/>
                        <button onClick={(e) => {e.stopPropagation(); removeModule(module.id)}} className="p-1 text-red-500 hover:text-red-700"><IconTrash className="w-5 h-5"/></button>
                    </div>
                    {openModuleId === module.id ? <IconChevronUp className="w-5 h-5" /> : <IconChevronDown className="w-5 h-5" />}
                </div>
                {openModuleId === module.id && (
                    <div className="px-4 pb-4 space-y-2 border-t dark:border-gray-700">
                        {module.lessons.map((lesson, index) => (
                            <div key={lesson.id} draggable onDragStart={() => dragLesson.current = index} onDragEnter={() => dragOverLesson.current = index} onDragEnd={() => handleDragSort(module.id)} onDragOver={(e) => e.preventDefault()} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md cursor-grab active:cursor-grabbing">
                                <div className="flex items-center gap-3 flex-grow min-w-0">
                                    {getLessonTypeInfo(lesson.type)?.icon}
                                    <span className="truncate">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                     {lesson.duration && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mr-2">
                                            <IconClock className="w-4 h-4" />
                                            <span>{lesson.duration}</span>
                                        </div>
                                    )}
                                     <button onClick={() => setEditingLesson(lesson)} className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><IconPencil className="w-4 h-4"/></button>
                                     <button onClick={() => removeLesson(module.id, lesson.id)} className="p-1 text-red-500 hover:text-red-700"><IconTrash className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => addLesson(module.id)} className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-semibold p-2 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/50">
                            <IconPlus className="w-4 h-4" /> Adicionar Aula
                        </button>
                    </div>
                )}
             </div>
        ))}
         <button onClick={addModule} className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-semibold p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500">
            <IconPlus className="w-5 h-5" /> Adicionar Módulo
        </button>
    </div>
  );
  
  const DesignStep = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 space-y-4">
        <h3 className="text-xl font-semibold">Design & Branding</h3>
         <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor Principal</label>
            <input type="color" defaultValue="#4F46E5" className="mt-1 w-24 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fonte</label>
            <select className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                <option>Inter</option>
                <option>Roboto</option>
                <option>Lato</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo (URL)</label>
            <input type="text" placeholder="https://exemplo.com/logo.png" className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
        </div>
    </div>
  );

  const PublishStep = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 space-y-6">
        <h3 className="text-xl font-semibold">Publicação</h3>
        <p>Aqui você poderá exportar seus conteúdos e outputs finais para diversas plataformas.</p>
        <button onClick={() => onPublish(courseData)} className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
            Finalizar e Ver Dashboard
        </button>
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
    <div className="p-8">
      {editingLesson && <ContentEditor lesson={editingLesson} onSave={updateLesson} onClose={() => setEditingLesson(null)} courseTopic={courseData.onboarding.topic} />}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Construtor de Tópicos</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Curso sobre: <span className="font-semibold text-primary-700 dark:text-primary-400">{courseData.onboarding.topic}</span></p>

        <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= activeStep ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{index + 1}</div>
                        <span className={`ml-2 font-medium ${index <= activeStep ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>{step}</span>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-grow h-1 mx-4 ${index < activeStep ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
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
                className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
                Anterior
            </button>
             <button 
                onClick={() => setActiveStep(s => Math.min(steps.length - 1, s+1))}
                disabled={activeStep === steps.length - 1}
                className="px-6 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
                Próximo
             </button>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder;
