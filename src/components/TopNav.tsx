import React from 'react';
import { Language, translations } from '../i18n/translations';
import { Languages, BookOpen } from 'lucide-react';

interface TopNavProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenFormulas: () => void;
  activeSection: string;
  onNavigateSection: (section: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  lang,
  onToggleLang,
  onOpenFormulas,
  activeSection,
  onNavigateSection
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element, no subtitle pill) */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            g
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            {t.appTitle}
          </span>
        </div>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigateSection('curriculum')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeSection === 'curriculum' ? 'text-sky-600 font-semibold' : ''
            }`}
          >
            {t.navCurriculum}
          </button>
          <button
            onClick={() => onNavigateSection('simulation')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeSection === 'simulation' ? 'text-sky-600 font-semibold' : ''
            }`}
          >
            {t.navSimulation}
          </button>
          <button
            onClick={() => onNavigateSection('phenomena')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeSection === 'phenomena' ? 'text-sky-600 font-semibold' : ''
            }`}
          >
            {t.navPhenomena}
          </button>
          <button
            onClick={() => onNavigateSection('graphs')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeSection === 'graphs' ? 'text-sky-600 font-semibold' : ''
            }`}
          >
            {t.navGraphs}
          </button>
          <button
            onClick={() => onNavigateSection('experiments')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeSection === 'experiments' ? 'text-sky-600 font-semibold' : ''
            }`}
          >
            {t.navExperiments}
          </button>
          <button
            onClick={() => onNavigateSection('photogate')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              activeSection === 'photogate' ? 'text-sky-600 font-semibold' : ''
            }`}
          >
            {t.navPhotogate}
          </button>
          <button
            onClick={onOpenFormulas}
            className="transition-colors whitespace-nowrap hover:text-slate-900 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.navTheory}</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Language switch button) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap"
          >
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
