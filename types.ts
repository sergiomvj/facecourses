export type Audience = 'iniciantes' | 'intermediarios' | 'avancados';
export type CourseFormat = 'video' | 'texto' | 'animacao' | 'misto';
export type LessonType = 'video' | 'texto' | 'animacao' | 'audio';

export interface OnboardingData {
  topic: string;
  audience: Audience;
  format: CourseFormat;
  language: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: string; // Could be markdown text, video URL, etc.
  duration?: string;
  videoType?: 'narrative' | 'dialogue';
  isPodcast?: boolean;
  podcastSpeakers?: 'two_men' | 'two_women' | 'man_woman';
  finalOutputs?: {
    prompt?: string;
    script?: string;
    imagePrompt?: string;
    htmlContent?: string;
  }
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface DesignSettings {
  primaryColor: string;
  font: string;
  logoUrl: string;
}

export interface CourseData {
  onboarding: OnboardingData;
  modules: Module[];
  design: DesignSettings;
}

export type AppState = 'login' | 'onboarding' | 'building' | 'published';
