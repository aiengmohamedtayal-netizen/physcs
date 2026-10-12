import React, { useState } from 'react';
import { Language } from '../../i18n/translations';
import { Cpu, Lightbulb, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface Chapter8LogicSimProps {
  lang: Language;
}

type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR';

export const Chapter8LogicSim: React.FC<Chapter8LogicSimProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'gates' | 'diode'>('gates');

  // Logic gates state
  const [gate, setGate] = useState<GateType>('AND');
  const [inputA, setInputA] = useState<number>(0);
  const [inputB, setInputB] = useState<number>(0);

  // Diode bias state
  const [biasMode, setBiasMode] = useState<'forward' | 'reverse'>('forward');

  // Calculate logic gate output
  let outputY = 0;
  if (gate === 'NOT') {
    outputY = inputA === 0 ? 1 : 0;
  } else if (gate === 'AND') {
    outputY = inputA === 1 && inputB === 1 ? 1 : 0;
  } else if (gate === 'OR') {
    outputY = inputA === 1 || inputB === 1 ? 1 : 0;
  } else if (gate === 'NAND') {
    outputY = !(inputA === 1 && inputB === 1) ? 1 : 0;
  } else if (gate === 'NOR') {
    outputY = !(inputA === 1 || inputB === 1) ? 1 : 0;
  }

  const toggleA = () => {
    setInputA((p) => (p === 0 ? 1 : 0));
    soundManager.playPendulumTick(800);
  };

  const toggleB = () => {
    setInputB((p) => (p === 0 ? 1 : 0));
    soundManager.playPendulumTick(800);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      {/* Sub-tab selection */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('gates')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'gates' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'البوابات المنطقية وجداول الحقيقة' : 'Logic Gates & Truth Tables'}
          </button>
          <button
            onClick={() => setActiveTab('diode')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'diode' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'الوصلة الثنائية (الدايود) والانحياز' : 'p-n Diode Biasing'}
          </button>
        </div>
      </div>

      {activeTab === 'gates' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Visual Gate Stage */}
          <div className="lg:col-span-7 bg-slate-50/80 rounded-xl border border-slate-200 p-5 flex flex-col justify-between min-h-[300px]">
            {/* Gate selector */}
            <div className="flex flex-wrap gap-2 text-xs font-mono font-bold mb-4">
              {(['AND', 'OR', 'NOT', 'NAND', 'NOR'] as GateType[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGate(g)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    gate === g
                      ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Circuit Inputs and Outputs Visual */}
            <div className="flex items-center justify-around py-6">
              {/* Inputs */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-600">المدخل A:</span>
                  <button
                    onClick={toggleA}
                    className={`w-10 h-10 rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-all ${
                      inputA === 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {inputA}
                  </button>
                </div>

                {gate !== 'NOT' && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600">المدخل B:</span>
                    <button
                      onClick={toggleB}
                      className={`w-10 h-10 rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-all ${
                        inputB === 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {inputB}
                    </button>
                  </div>
                )}
              </div>

              {/* Gate Icon Center */}
              <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shadow-md font-mono font-bold text-sm">
                <span>{gate}</span>
                <span className="text-[10px] text-slate-400 mt-1">بوابة</span>
              </div>

              {/* Output & Lamp */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    outputY === 1
                      ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/50 animate-pulse'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Lightbulb className="w-7 h-7" />
                </div>
                <div className="font-mono text-xs font-bold">
                  المخرج Y = <strong className={outputY === 1 ? 'text-amber-600' : 'text-slate-500'}>{outputY}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Truth Table */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-2">
                جدول الحقيقة (Truth Table) لبوابة {gate}:
              </span>
              <table className="w-full text-center border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 text-[11px]">
                    <th className="p-1.5 border border-slate-300">A</th>
                    {gate !== 'NOT' && <th className="p-1.5 border border-slate-300">B</th>}
                    <th className="p-1.5 border border-slate-300">الخرج Y</th>
                  </tr>
                </thead>
                <tbody>
                  {gate === 'NOT' ? (
                    <>
                      <tr className={inputA === 0 ? 'bg-sky-100 font-bold' : ''}>
                        <td className="p-1.5 border border-slate-200">0</td>
                        <td className="p-1.5 border border-slate-200 text-emerald-700">1</td>
                      </tr>
                      <tr className={inputA === 1 ? 'bg-sky-100 font-bold' : ''}>
                        <td className="p-1.5 border border-slate-200">1</td>
                        <td className="p-1.5 border border-slate-200 text-slate-600">0</td>
                      </tr>
                    </>
                  ) : (
                    [
                      [0, 0],
                      [0, 1],
                      [1, 0],
                      [1, 1]
                    ].map(([a, b], idx) => {
                      let out = 0;
                      if (gate === 'AND') out = a === 1 && b === 1 ? 1 : 0;
                      if (gate === 'OR') out = a === 1 || b === 1 ? 1 : 0;
                      if (gate === 'NAND') out = !(a === 1 && b === 1) ? 1 : 0;
                      if (gate === 'NOR') out = !(a === 1 || b === 1) ? 1 : 0;

                      const isCurrentRow = inputA === a && inputB === b;

                      return (
                        <tr key={idx} className={isCurrentRow ? 'bg-sky-100 font-bold' : ''}>
                          <td className="p-1.5 border border-slate-200">{a}</td>
                          <td className="p-1.5 border border-slate-200">{b}</td>
                          <td className={`p-1.5 border border-slate-200 ${out === 1 ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {out}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Diode Biasing */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">سلوك الوصلة الثنائية p-n (الدايود):</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBiasMode('forward')}
                className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${
                  biasMode === 'forward' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                انحياز أمامي (Forward Bias)
              </button>
              <button
                onClick={() => setBiasMode('reverse')}
                className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${
                  biasMode === 'reverse' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                انحياز عكسي (Reverse Bias)
              </button>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-slate-700 leading-relaxed">
              {biasMode === 'forward' ? (
                <>
                  <div className="font-bold text-emerald-800">● الانحياز الأمامي:</div>
                  <div>- توصيل البلورة الموجبة p بالقطب الموجب للبطارية، والبلورة السالبة n بالقطب السالب.</div>
                  <div>- يتنافر الناقلان فـ <strong>تضيق المنطقة القاحلة</strong> ويقل الجهد الحاجز (0.7V للسيليكون).</div>
                  <div>- تصبح المقاومة صغيرة جداً، ويمر تيار كهربي وتضيء الدائرة.</div>
                </>
              ) : (
                <>
                  <div className="font-bold text-rose-800">● الانحياز العكسي:</div>
                  <div>- توصيل البلورة الموجبة p بالقطب السالب للبطارية، والبلورة السالبة n بالقطب الموجب.</div>
                  <div>- ينجذب الناقلان بعيداً عن الوصلة فـ <strong>تتسع المنطقة القاحلة</strong> ويزداد الجهد الحاجز.</div>
                  <div>- تصبح مقاومة الوصلة شبه لا نهائية، وينعدم مرور التيار تماماً (مفتاح مفتوح).</div>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                biasMode === 'forward' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 animate-pulse' : 'bg-slate-800 text-slate-600'
              }`}
            >
              <Lightbulb className="w-8 h-8" />
            </div>
            <span className="font-bold text-sm">
              {biasMode === 'forward' ? 'المصباح يضيء (تيار كهربي مار)' : 'المصباح مطفأ (لا يمر تيار)'}
            </span>
            <span className="text-xs text-slate-400 font-mono mt-1">
              {biasMode === 'forward' ? 'R_diode ≈ 0 Ω | I > 0' : 'R_diode → ∞ Ω | I = 0'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
