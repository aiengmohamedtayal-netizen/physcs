import React, { useState } from 'react';
import { PhenomenonId, PhenomenonMeta } from '../../types/phenomena';
import { Language, translations } from '../../i18n/translations';
import { Compass, Share2, Waves, Zap, Target, Globe2 } from 'lucide-react';
import { FoucaultPendulumSim } from './FoucaultPendulumSim';
import { NewtonsCradleSim } from './NewtonsCradleSim';
import { DoubleSlitSim } from './DoubleSlitSim';
import { PhotoelectricSim } from './PhotoelectricSim';
import { MillikanSim } from './MillikanSim';

interface PhenomenaHubProps {
  lang: Language;
}

const PHENOMENA_LIST: PhenomenonMeta[] = [
  {
    id: 'foucault',
    titleAr: 'بندول فوكو ودوران الأرض',
    titleEn: 'Foucault Pendulum',
    scientistAr: 'ليون فوكو (Léon Foucault)',
    scientistEn: 'Léon Foucault',
    year: '1851',
    summaryAr: 'إثبات دوران الأرض حول محورها عملياً عبر ظاهرة دوران مستوى تأرجح البندول',
    summaryEn: 'Experimental proof of Earth’s diurnal rotation via the precession of the oscillation plane',
    keyEquation: 'ω_p = 15°/h × sin(φ)'
  },
  {
    id: 'newton_cradle',
    titleAr: 'بندول نيوتن وحفظ كمية الحركة',
    titleEn: 'Newton’s Cradle',
    scientistAr: 'إسحاق نيوتن & إدم كاريزيه',
    scientistEn: 'Sir Isaac Newton',
    year: '1687 / 1967',
    summaryAr: 'إثبات حفظ كمية الحركة وحفظ الطاقة الميكانيكية في التصادمات المرنة المتتالية',
    summaryEn: 'Demonstration of conservation of momentum and energy via elastic collisions',
    keyEquation: 'Σp_initial = Σp_final'
  },
  {
    id: 'double_slit',
    titleAr: 'تجربة شقي يونغ وتداخل الموجات',
    titleEn: 'Young’s Double-Slit',
    scientistAr: 'توماس يونغ (Thomas Young)',
    scientistEn: 'Thomas Young',
    year: '1801',
    summaryAr: 'إثبات الطبيعة الموجية للضوء عبر التداخل البناء والهدام وظاهرة ثنائية الموجة-الجسيم',
    summaryEn: 'Definitive demonstration of the wave nature of light and quantum wave-particle duality',
    keyEquation: 'Δy = (λ × D) / d'
  },
  {
    id: 'photoelectric',
    titleAr: 'الظاهرة الكهروضوئية وتكميم الضوء',
    titleEn: 'Photoelectric Effect',
    scientistAr: 'ألبرت آينشتاين (Albert Einstein)',
    scientistEn: 'Albert Einstein (Nobel 1921)',
    year: '1905',
    summaryAr: 'إثبات أن الضوء يتألف من فوتونات مكممة تنبعث منها الإلكترونات بتجاوز دالة الشغل',
    summaryEn: 'Discovery of light quanta (photons) ejecting electrons when overcoming the work function',
    keyEquation: 'K_max = hν - Φ = eV₀'
  },
  {
    id: 'millikan',
    titleAr: 'تجربة قطرة الزيت وتكميم الشحنة',
    titleEn: 'Millikan’s Oil Drop',
    scientistAr: 'روبرت ميليكان (Robert Millikan)',
    scientistEn: 'Robert A. Millikan (Nobel 1923)',
    year: '1909',
    summaryAr: 'قياس الشحنة الكهربائية الأولية بدقة وإثبات أن كافة الشحنات مكممة ومضاعفات لـ e',
    summaryEn: 'Direct measurement of the elementary electric charge and proof of charge quantization',
    keyEquation: 'q = n × e = (mgd) / V_eq'
  }
];

export const PhenomenaHub: React.FC<PhenomenaHubProps> = ({ lang }) => {
  const [selectedId, setSelectedId] = useState<PhenomenonId>('foucault');

  const selectedPhenomenon = PHENOMENA_LIST.find((p) => p.id === selectedId) || PHENOMENA_LIST[0];

  const getIcon = (id: PhenomenonId) => {
    switch (id) {
      case 'foucault':
        return <Compass className="w-4 h-4 text-sky-600" />;
      case 'newton_cradle':
        return <Share2 className="w-4 h-4 text-amber-600" />;
      case 'double_slit':
        return <Waves className="w-4 h-4 text-emerald-600" />;
      case 'photoelectric':
        return <Zap className="w-4 h-4 text-purple-600" />;
      case 'millikan':
        return <Target className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {lang === 'ar' ? 'خمس ظواهر فيزيائية عالمية تفاعلية' : 'Five World-Famous Physics Phenomena'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ar'
              ? 'محاكاة رياضية دقيقة لأعظم التجارب التي غيرت مجرى تاريخ الفيزياء والعلوم الطبيعية'
              : 'Interactive simulations of epochal experiments that revolutionized the foundations of physics'}
          </p>
        </div>
      </div>

      {/* Tabs Selector for the 5 Phenomena */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {PHENOMENA_LIST.map((item, idx) => {
          const isSelected = item.id === selectedId;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`p-3.5 rounded-xl border text-left rtl:text-right transition-colors flex flex-col justify-between ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-semibold shadow-xs ring-1 ring-sky-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-mono text-[11px] text-slate-400">0{idx + 1}</span>
                {getIcon(item.id)}
              </div>
              <div className="font-bold text-xs line-clamp-1">
                {lang === 'ar' ? item.titleAr : item.titleEn}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>{item.year}</span>
                <span className="font-mono text-[10px] text-sky-700 font-semibold">{item.keyEquation.split('=')[0]}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Phenomenon Simulation Container */}
      <div className="w-full">
        {selectedId === 'foucault' && <FoucaultPendulumSim lang={lang} />}
        {selectedId === 'newton_cradle' && <NewtonsCradleSim lang={lang} />}
        {selectedId === 'double_slit' && <DoubleSlitSim lang={lang} />}
        {selectedId === 'photoelectric' && <PhotoelectricSim lang={lang} />}
        {selectedId === 'millikan' && <MillikanSim lang={lang} />}
      </div>
    </div>
  );
};
