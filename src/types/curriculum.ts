/**
 * Types and interfaces for the Egyptian 3rd Secondary Physics Curriculum (2026-2027)
 */

export interface CurriculumChapter {
  id: number;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  descriptionAr: string;
  experimentsCount: number;
  iconName: string;
  keyFormulas: string[];
}

export interface CurriculumExperiment {
  id: string;
  chapterId: number;
  number: number;
  titleAr: string;
  titleEn: string;
  coreIdeaAr: string;
  coreIdeaEn: string;
  toolsAr: string[];
  stepsAr: string[];
  conclusionAr: string;
  examTipsAr: string;
  formula?: string;
  graphDescriptionAr?: string;
}
