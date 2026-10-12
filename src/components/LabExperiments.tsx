import React, { useState } from 'react';
import { LAB_EXPERIMENTS } from '../data/experimentsData';
import { LabExperiment, SimplePendulumParams } from '../types/physics';
import { Language, translations } from '../i18n/translations';
import { BookOpen, CheckCircle2, XCircle, ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface LabExperimentsProps {
  lang: Language;
  onApplyExperiment: (expId: string, params: LabExperiment['params']) => void;
}

export const LabExperiments: React.FC<LabExperimentsProps> = ({
  lang,
  onApplyExperiment
}) => {
  const [selectedExpId, setSelectedExpId] = useState<string>(LAB_EXPERIMENTS[0].id);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

  const t = translations[lang];

  const currentExp = LAB_EXPERIMENTS.find((e) => e.id === selectedExpId) || LAB_EXPERIMENTS[0];

  const handleSelectOption = (index: number) => {
    setUserAnswers((prev) => ({ ...prev, [currentExp.id]: index }));
    setSubmittedAnswers((prev) => ({ ...prev, [currentExp.id]: false }));
  };

  const handleCheckAnswer = () => {
    setSubmittedAnswers((prev) => ({ ...prev, [currentExp.id]: true }));
    const selected = userAnswers[currentExp.id];
    if (selected === currentExp.correctIndex) {
      soundManager.playSuccessChime();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-bold text-slate-800">{t.experimentsTitle}</h2>
        </div>
        <p className="text-xs text-slate-500">{t.experimentsSubtitle}</p>
      </div>

      {/* Experiment Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {LAB_EXPERIMENTS.map((exp, idx) => {
          const isSelected = exp.id === selectedExpId;
          const isAnswered = submittedAnswers[exp.id] && userAnswers[exp.id] === exp.correctIndex;

          return (
            <button
              key={exp.id}
              onClick={() => setSelectedExpId(exp.id)}
              className={`p-3 rounded-lg border text-xs text-left rtl:text-right transition-colors flex flex-col justify-between ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-semibold shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 w-full">
                <span className="font-mono text-[11px] text-slate-400">#{idx + 1}</span>
                {isAnswered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="line-clamp-2 leading-relaxed">
                {lang === 'ar' ? exp.titleAr.split(':')[0] : exp.titleEn.split(':')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Experiment Detail Card */}
      <div className="bg-slate-50/70 rounded-xl border border-slate-200/90 p-5 flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {lang === 'ar' ? currentExp.titleAr : currentExp.titleEn}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {lang === 'ar' ? currentExp.descriptionAr : currentExp.descriptionEn}
            </p>
          </div>

          <button
            onClick={() => onApplyExperiment(currentExp.id, currentExp.params)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{t.applyExperiment}</span>
          </button>
        </div>

        {/* Experiment Objective */}
        <div className="p-3 bg-white rounded-lg border border-slate-200/80 text-xs">
          <span className="font-semibold text-slate-800 ml-1.5 rtl:ml-0 rtl:mr-1.5">
            {lang === 'ar' ? 'الهدف التعليمي:' : 'Objective:'}
          </span>
          <span className="text-slate-600">
            {lang === 'ar' ? currentExp.objectiveAr : currentExp.objectiveEn}
          </span>
        </div>

        {/* Interactive Inquiry Question */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-4">
          <div className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.testUnderstanding}</span>
          </div>

          <p className="text-xs font-medium text-slate-700 mb-3 leading-relaxed">
            {lang === 'ar' ? currentExp.questionAr : currentExp.questionEn}
          </p>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {(lang === 'ar' ? currentExp.optionsAr : currentExp.optionsEn).map((opt, i) => {
              const isChosen = userAnswers[currentExp.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  className={`w-full text-left rtl:text-right p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                    isChosen
                      ? 'border-sky-500 bg-sky-50 text-sky-900 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{opt}</span>
                  <span className="w-3 h-3 rounded-full border border-slate-300 flex items-center justify-center shrink-0 ml-2 rtl:ml-0 rtl:mr-2">
                    {isChosen && <span className="w-1.5 h-1.5 bg-sky-600 rounded-full" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Verify Answer CTA */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleCheckAnswer}
              disabled={userAnswers[currentExp.id] === undefined}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              {t.submitAnswer}
            </button>

            {submittedAnswers[currentExp.id] && (
              <div className="flex items-center gap-2 text-xs font-medium">
                {userAnswers[currentExp.id] === currentExp.correctIndex ? (
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t.correctAnswer}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>{t.tryAgain}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Explanation if submitted */}
          {submittedAnswers[currentExp.id] && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900 block mb-1">
                {lang === 'ar' ? 'التفسير الفيزيائي:' : 'Physical Explanation:'}
              </span>
              {lang === 'ar' ? currentExp.explanationAr : currentExp.explanationEn}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
