import React, { useState } from 'react';
import { CURRICULUM_CHAPTERS, CURRICULUM_EXPERIMENTS } from '../../data/curriculumData';
import { Language } from '../../i18n/translations';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Zap,
  Compass,
  RotateCw,
  Activity,
  Waves,
  Radio,
  Cpu,
  ChevronDown,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Chapter1OhmSim } from './Chapter1OhmSim';
import { Chapter3FaradaySim } from './Chapter3FaradaySim';
import { Chapter4AcResonanceSim } from './Chapter4AcResonanceSim';
import { Chapter6SpectraSim } from './Chapter6SpectraSim';
import { Chapter8LogicSim } from './Chapter8LogicSim';
import { PhotoelectricSim } from '../phenomena/PhotoelectricSim';

interface CurriculumHubProps {
  lang: Language;
}

export const CurriculumHub: React.FC<CurriculumHubProps> = ({ lang }) => {
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string>(CURRICULUM_EXPERIMENTS[0].id);

  const activeChapter = CURRICULUM_CHAPTERS.find((c) => c.id === activeChapterId) || CURRICULUM_CHAPTERS[0];
  const chapterExperiments = CURRICULUM_EXPERIMENTS.filter((e) => e.chapterId === activeChapterId);
  const activeExp = chapterExperiments.find((e) => e.id === selectedExperimentId) || chapterExperiments[0];

  const getChapterIcon = (icon: string) => {
    switch (icon) {
      case 'Zap': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Compass': return <Compass className="w-4 h-4 text-sky-500" />;
      case 'RotateCw': return <RotateCw className="w-4 h-4 text-emerald-500" />;
      case 'Activity': return <Activity className="w-4 h-4 text-purple-500" />;
      case 'Waves': return <Waves className="w-4 h-4 text-cyan-500" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case 'Radio': return <Radio className="w-4 h-4 text-rose-500" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-blue-500" />;
      default: return <BookOpen className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <GraduationCap className="w-5 h-5 text-sky-400" />
            <span className="text-xs uppercase font-mono tracking-wider text-sky-300">
              {lang === 'ar' ? 'منهج الفيزياء الرسمي للثانوية العامة المصرية 2026–2027' : 'Egyptian Secondary Physics Curriculum 2026–2027'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {lang === 'ar' ? 'معمل تجارب وظواهر منهج الفيزياء (8 فصول)' : 'Interactive Curriculum Physics Laboratory'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {lang === 'ar'
              ? 'تغطية شاملة وتفاعلية لجميع تجارب وظواهر كتاب الوزارة: الكهربية التيارية والكهرومغناطيسية والفيزياء الحديثة، مع أجهزة المحاكاة الافتراضية والشرح ونقاط أسئلة الامتحان.'
              : 'Complete interactive coverage of all experiments and phenomena in the Egyptian 3rd Secondary physics curriculum.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs">
          <FileText className="w-4 h-4 text-sky-300" />
          <span>{lang === 'ar' ? '17 تجربة وظاهرة مقررة' : '17 Key Experiments'}</span>
        </div>
      </div>

      {/* 2. Chapters Navigation Bar (8 Chapters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {CURRICULUM_CHAPTERS.map((chap) => {
          const isActive = chap.id === activeChapterId;

          return (
            <button
              key={chap.id}
              onClick={() => {
                setActiveChapterId(chap.id);
                const firstExp = CURRICULUM_EXPERIMENTS.find((e) => e.chapterId === chap.id);
                if (firstExp) setSelectedExperimentId(firstExp.id);
              }}
              className={`p-3 rounded-xl border text-left rtl:text-right flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-sky-500 bg-sky-50/80 text-sky-950 font-bold shadow-xs ring-1 ring-sky-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-mono text-[10px] text-slate-400">باب {chap.id}</span>
                {getChapterIcon(chap.iconName)}
              </div>
              <div className="text-xs line-clamp-2 leading-snug">
                {lang === 'ar' ? chap.titleAr.split(':')[1]?.trim() || chap.titleAr : chap.titleEn}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Active Chapter Header & Formulas Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'ar' ? activeChapter.titleAr : activeChapter.titleEn}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'ar' ? activeChapter.descriptionAr : ''}
            </p>
          </div>
        </div>

        {/* Formulas Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-500">{lang === 'ar' ? 'أهم القوانين الرياضية:' : 'Formulas:'}</span>
          {activeChapter.keyFormulas.map((formula, i) => (
            <span
              key={i}
              className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-mono text-sky-900 font-semibold"
            >
              {formula}
            </span>
          ))}
        </div>
      </div>

      {/* 4. Interactive Simulation Apparatus for the Active Chapter */}
      <div className="w-full">
        {activeChapterId === 1 && <Chapter1OhmSim lang={lang} />}
        {activeChapterId === 2 && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4">
            <h4 className="font-bold text-sm text-slate-900">
              {lang === 'ar' ? 'محاكي التأثير المغناطيسي وأورستد والقوة المغناطيسية (F = B I L sin θ)' : 'Magnetic Field & Lorentz Force Simulator'}
            </h4>
            <Chapter1OhmSim lang={lang} />
          </div>
        )}
        {activeChapterId === 3 && <Chapter3FaradaySim lang={lang} />}
        {activeChapterId === 4 && <Chapter4AcResonanceSim lang={lang} />}
        {activeChapterId === 5 && <PhotoelectricSim lang={lang} />}
        {activeChapterId === 6 && <Chapter6SpectraSim lang={lang} />}
        {activeChapterId === 7 && <PhotoelectricSim lang={lang} />}
        {activeChapterId === 8 && <Chapter8LogicSim lang={lang} />}
      </div>

      {/* 5. Experiments Directory & Study Notes for Active Chapter */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {lang === 'ar' ? `تجارب كتاب الوزارة المقررة في ${activeChapter.titleAr.split(':')[0]}:` : 'Official Curriculum Experiments:'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {chapterExperiments.length} {lang === 'ar' ? 'تجارب' : 'experiments'}
          </span>
        </div>

        {/* Experiment cards */}
        <div className="space-y-4">
          {chapterExperiments.map((exp) => (
            <div
              key={exp.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-sky-950 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-mono font-bold">
                    #{exp.number}
                  </span>
                  <span>{lang === 'ar' ? exp.titleAr : exp.titleEn}</span>
                </h4>
                {exp.formula && (
                  <span className="font-mono text-xs bg-white px-2.5 py-1 rounded-md border border-slate-200 text-sky-700 font-semibold">
                    {exp.formula}
                  </span>
                )}
              </div>

              {/* Core Idea */}
              <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-1">
                  {lang === 'ar' ? 'الفكرة العلمية الأساسية:' : 'Core Scientific Principle:'}
                </span>
                {lang === 'ar' ? exp.coreIdeaAr : exp.coreIdeaEn}
              </div>

              {/* Tools & Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                  <span className="font-bold text-slate-900 block mb-1">
                    {lang === 'ar' ? 'الأدوات المستخدمة:' : 'Apparatus & Tools:'}
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {exp.toolsAr.map((tool, idx) => (
                      <li key={idx}>{tool}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                  <span className="font-bold text-slate-900 block mb-1">
                    {lang === 'ar' ? 'خطوات العمل والملاحظة:' : 'Steps & Observation:'}
                  </span>
                  <ul className="list-decimal list-inside space-y-1 text-slate-600">
                    {exp.stepsAr.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exam Tips Box */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold text-amber-950 block mb-0.5">
                  {lang === 'ar' ? '💡 ملحوظة الامتحان والتفسير العلمي (سؤال علل وماذا يحدث):' : 'Exam Tips & Critical Observations:'}
                </span>
                {exp.examTipsAr}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
