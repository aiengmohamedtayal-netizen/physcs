import React, { useState } from 'react';
import { Language } from '../../i18n/translations';
import { Sparkles, Layers, ArrowDown } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface Chapter6SpectraSimProps {
  lang: Language;
}

interface Transition {
  fromN: number;
  toN: number;
  seriesNameAr: string;
  seriesNameEn: string;
  regionAr: string;
  wavelengthNm: number;
  colorCss: string;
}

const TRANSITIONS: Transition[] = [
  // Lyman (to n=1)
  { fromN: 2, toN: 1, seriesNameAr: 'ليمان', seriesNameEn: 'Lyman', regionAr: 'فوق بنفسجية (UV)', wavelengthNm: 121.6, colorCss: '#8b5cf6' },
  { fromN: 3, toN: 1, seriesNameAr: 'ليمان', seriesNameEn: 'Lyman', regionAr: 'فوق بنفسجية (UV)', wavelengthNm: 102.6, colorCss: '#7c3aed' },
  // Balmer (to n=2, Visible)
  { fromN: 3, toN: 2, seriesNameAr: 'بالمر (H-α)', seriesNameEn: 'Balmer (H-alpha)', regionAr: 'ضوء مرئي (أحمر)', wavelengthNm: 656.3, colorCss: '#ef4444' },
  { fromN: 4, toN: 2, seriesNameAr: 'بالمر (H-β)', seriesNameEn: 'Balmer (H-beta)', regionAr: 'ضوء مرئي (أزرق مخضر)', wavelengthNm: 486.1, colorCss: '#06b6d4' },
  { fromN: 5, toN: 2, seriesNameAr: 'بالمر (H-γ)', seriesNameEn: 'Balmer (H-gamma)', regionAr: 'ضوء مرئي (أزرق)', wavelengthNm: 434.0, colorCss: '#3b82f6' },
  { fromN: 6, toN: 2, seriesNameAr: 'بالمر (H-δ)', seriesNameEn: 'Balmer (H-delta)', regionAr: 'ضوء مرئي (بنفسجي)', wavelengthNm: 410.2, colorCss: '#6366f1' },
  // Paschen (to n=3, IR)
  { fromN: 4, toN: 3, seriesNameAr: 'باشن', seriesNameEn: 'Paschen', regionAr: 'تحت حمراء (IR)', wavelengthNm: 1875.1, colorCss: '#b91c1c' },
  { fromN: 5, toN: 3, seriesNameAr: 'باشن', seriesNameEn: 'Paschen', regionAr: 'تحت حمراء (IR)', wavelengthNm: 1281.8, colorCss: '#991b1b' }
];

export const Chapter6SpectraSim: React.FC<Chapter6SpectraSimProps> = ({ lang }) => {
  const [selectedTransition, setSelectedTransition] = useState<Transition>(TRANSITIONS[2]); // H-alpha by default

  const energyLevelEV = (n: number) => -13.6 / (n * n);
  const deltaE = energyLevelEV(selectedTransition.fromN) - energyLevelEV(selectedTransition.toN);

  const handleSelect = (tr: Transition) => {
    setSelectedTransition(tr);
    soundManager.playPhotogateBeam();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">
            {lang === 'ar' ? 'محاكي طيف ذرة الهيدروجين ومستويات طاقة بور' : 'Bohr Hydrogen Spectral Transitions Simulator'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Visual Energy Levels Diagram */}
        <div className="lg:col-span-7 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
            <span>مستويات الطاقة الرئيسية (n)</span>
            <span>طاقة المستوى E_n (eV)</span>
          </div>

          {/* Energy lines n = 1 to 5 */}
          <div className="space-y-4 font-mono text-xs relative">
            {[5, 4, 3, 2, 1].map((n) => {
              const energy = energyLevelEV(n);
              const isSource = selectedTransition.fromN === n;
              const isTarget = selectedTransition.toN === n;

              return (
                <div key={n} className="flex items-center justify-between relative py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300">n = {n}</span>
                    {isSource && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">إلكترون مثار</span>}
                    {isTarget && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">مستوى الوصول</span>}
                  </div>

                  {/* Horizontal energy line */}
                  <div
                    className={`flex-1 mx-3 h-0.5 ${
                      isSource || isTarget ? 'bg-sky-400' : 'bg-slate-700'
                    }`}
                  />

                  <span className="text-slate-400">{energy.toFixed(2)} eV</span>
                </div>
              );
            })}

            {/* Emitted Photon Beam indicator */}
            <div className="mt-4 p-3 rounded-lg bg-slate-800/90 border border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedTransition.colorCss }} />
                <span>فوتون منبعث: <strong>{selectedTransition.seriesNameAr}</strong></span>
              </div>
              <span className="font-mono text-sky-300 font-bold">λ = {selectedTransition.wavelengthNm.toFixed(1)} nm</span>
            </div>
          </div>
        </div>

        {/* Transition Selector & Formulas */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Transition details */}
          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200/80 text-xs space-y-2">
            <span className="font-semibold text-sky-950 block">
              {lang === 'ar' ? 'معادلة حساب فرق الطاقة والطول الموجي:' : 'Energy & Wavelength Calculation:'}
            </span>
            <div className="font-mono bg-white p-2 rounded border border-sky-100 text-center font-bold text-sm text-sky-950">
              ΔE = E_{selectedTransition.fromN} - E_{selectedTransition.toN} = {deltaE.toFixed(2)} eV
            </div>
            <div className="text-[11px] text-sky-800">
              النطاق الطيفي: <strong>{selectedTransition.regionAr}</strong>
            </div>
          </div>

          {/* Quick Click Transition Buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              {lang === 'ar' ? 'اختر انتقالاً إلكترونياً لمشاهدة الخط الطيفي:' : 'Select Electronic Transition:'}
            </label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-xs">
              {TRANSITIONS.map((tr, i) => {
                const isSelected = tr.fromN === selectedTransition.fromN && tr.toN === selectedTransition.toN;

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(tr)}
                    className={`w-full p-2.5 rounded-lg border text-left rtl:text-right flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 text-sky-950 font-bold shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tr.colorCss }} />
                      <span>{tr.seriesNameAr} (n={tr.fromN} → n={tr.toN})</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">{tr.wavelengthNm} nm</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
