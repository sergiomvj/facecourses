import type { ReactNode } from 'react';
import { Audience, CourseFormat, LessonType } from './types';
import { IconBook, IconFilm, IconGraphic, IconHeadphones, IconPlus, IconSparkles, IconTrash, IconPencil, IconChevronDown, IconChevronUp, IconCheckCircle } from './components/Icons';


export const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: 'iniciantes', label: 'Iniciantes' },
  { value: 'intermediarios', label: 'Intermediários' },
  { value: 'avancados', label: 'Avançados' },
];

export const FORMAT_OPTIONS: { value: CourseFormat; label: string }[] = [
  { value: 'video', label: 'Vídeo' },
  { value: 'texto', label: 'Texto' },
  { value: 'animacao', label: 'Animação' },
  { value: 'misto', label: 'Misto' },
];

export const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'Inglês (EUA)' },
    { value: 'es-ES', label: 'Espanhol (Espanha)' },
];

export const LESSON_TYPE_OPTIONS: { value: LessonType; label: string; icon: ReactNode }[] = [
    { value: 'video', label: 'Vídeo', icon: <IconFilm className="w-5 h-5" /> },
    { value: 'texto', label: 'Texto/Artigo', icon: <IconBook className="w-5 h-5" /> },
    { value: 'animacao', label: 'Animação/Infográfico', icon: <IconGraphic className="w-5 h-5" /> },
    { value: 'audio', label: 'Podcast/Áudio', icon: <IconHeadphones className="w-5 h-5" /> },
];

export const getLessonTypeInfo = (type: LessonType) => {
    return LESSON_TYPE_OPTIONS.find(option => option.value === type);
};