import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../../i18n/translations';
import { Activity, Radio, Cpu, RefreshCw } from 'lucide-react';

interface Chapter4AcResonanceSimProps {
  lang: Language;
}

export const Chapter4AcResonanceSim: React.FC<Chapter4AcResonanceSimProps> = ({ lang }) => {
  const [resistanceR, setResistanceR] = useState<number>(20); // Ohms
  const [inductanceMh, setInductanceMh] = useState<number>(50); // mH (L)
  const [capacitanceUf, setCapacitanceUf] = useState<number>(20); // microfarads (C)
  const [sourceVoltageV, setSourceVoltageV] = useState<number>(100); // V
  const [sourceFrequencyHz, setSourceFrequencyHz] = useState<number>(159); // Hz

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Exact resonance frequency: f0 = 1 / (2*pi*sqrt(L*C))
  const L_henry = inductanceMh * 1e-3;
  const C_farad = capacitanceUf * 1e-6;
  const resonanceFrequencyHz = 1 / (2 * Math.PI * Math.sqrt(L_henry * C_farad));

  // Reactances at current frequency f
  const f = Math.max(1, sourceFrequencyHz);
  const XL = 2 * Math.PI * f * L_henry;
  const XC = 1 / (2 * Math.PI * f * C_farad);
  const reactanceDiff = XL - XC;
  const impedanceZ = Math.sqrt(resistanceR * resistanceR + reactanceDiff * reactanceDiff);
  const currentI = sourceVoltageV / impedanceZ;
  const phaseAngleDeg = (Math.atan2(reactanceDiff, resistanceR) * 180) / Math.PI;

  const isResonance = Math.abs(f - resonanceFrequencyHz) < 3;

  // Jump to exact resonance frequency button
  const handleSnapToResonance = () => {
    setSourceFrequencyHz(Math.round(resonanceFrequencyHz));
  };

  // Canvas Drawing: RLC Resonance Curve (Current I and Impedance Z vs Frequency f)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const padLeft = 45;
    const padRight = 25;
    const padTop = 25;
    const padBottom = 35;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Gridlines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padTop + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
    }

    // Baseline axis
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + plotH);
    ctx.lineTo(width - padRight, padTop + plotH);
    ctx.stroke();

    // Frequency span: f_min = 20 Hz, f_max = resonanceFreq * 2.5
    const fMin = 20;
    const fMax = Math.max(350, resonanceFrequencyHz * 2.2);

    // Compute peak current at resonance for normalization
    const iPeak = sourceVoltageV / resistanceR;

    // 1. Plot Current Curve I(f)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let px = padLeft; px <= width - padRight; px++) {
      const normX = (px - padLeft) / plotW;
      const freq = fMin + normX * (fMax - fMin);

      const xl = 2 * Math.PI * freq * L_henry;
      const xc = 1 / (2 * Math.PI * freq * C_farad);
      const z = Math.sqrt(resistanceR * resistanceR + Math.pow(xl - xc, 2));
      const iVal = sourceVoltageV / z;

      const py = padTop + plotH - (iVal / (iPeak * 1.1)) * plotH;
      if (px === padLeft) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 2. Plot Resonance Frequency Center Vertical Line (Dashed)
    const resNormX = (resonanceFrequencyHz - fMin) / (fMax - fMin);
    const resPx = padLeft + resNormX * plotW;

    if (resPx >= padLeft && resPx <= width - padRight) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(resPx, padTop);
      ctx.lineTo(resPx, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#10b981';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`f₀ = ${resonanceFrequencyHz.toFixed(1)}Hz`, resPx, padTop + 14);
    }

    // 3. Current Operating Point Marker (Dot)
    const curNormX = (f - fMin) / (fMax - fMin);
    const curPx = padLeft + curNormX * plotW;
    const curPy = padTop + plotH - (currentI / (iPeak * 1.1)) * plotH;

    if (curPx >= padLeft && curPx <= width - padRight) {
      ctx.fillStyle = isResonance ? '#10b981' : '#0284c7';
      ctx.beginPath();
      ctx.arc(curPx, curPy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('I (التيار)', padLeft + 6, padTop + 12);
    ctx.textAlign = 'right';
    ctx.fillText('التردد f (Hz)', width - padRight, padTop + plotH + 20);

    ctx.restore();
  }, [resistanceR, inductanceMh, capacitanceUf, sourceVoltageV, sourceFrequencyHz, resonanceFrequencyHz, currentI, isResonance, f]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">
            {lang === 'ar' ? 'محاكي دوائر التيار المتردد RLC وحالة الرنين' : 'RLC AC Circuit & Resonance Simulator'}
          </h3>
        </div>

        {/* Snap to resonance button */}
        <button
          onClick={handleSnapToResonance}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? `ضبط تلقائي لتردد الرنين (${resonanceFrequencyHz.toFixed(1)} Hz)` : 'Snap to Resonance'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Canvas Resonance Curve */}
        <div className="lg:col-span-7 relative w-full h-[320px] bg-slate-50/70 rounded-xl border border-slate-200/90 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full" />

          {/* Resonance Status Banner */}
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            {isResonance ? (
              <span className="text-emerald-700 font-bold">
                {lang === 'ar' ? '● في حالة رنين تام (X_L = X_C | Z = R | أقصى تيار)' : '● In Perfect Resonance (XL = XC, Z = R)'}
              </span>
            ) : phaseAngleDeg > 0 ? (
              <span className="text-sky-700 font-bold">
                {lang === 'ar' ? '▲ للدائرة خواص حثية (X_L > X_C | الجهد يسبق التيار)' : 'Inductive (XL > XC)'}
              </span>
            ) : (
              <span className="text-amber-700 font-bold">
                {lang === 'ar' ? '▼ للدائرة خواص سعوية (X_C > X_L | التيار يسبق الجهد)' : 'Capacitive (XC > XL)'}
              </span>
            )}
          </div>
        </div>

        {/* Calculations & Sliders */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Values Grid */}
          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200/80 text-xs space-y-1.5">
            <span className="font-semibold text-sky-950 block">
              {lang === 'ar' ? 'حسابات الدائرة اللحظية:' : 'Live Circuit Parameters:'}
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-white p-2 rounded border border-sky-100">
                <span className="text-[10px] text-slate-500 block">المفاعلة الحثية X_L:</span>
                <strong>{XL.toFixed(1)} Ω</strong>
              </div>
              <div className="bg-white p-2 rounded border border-sky-100">
                <span className="text-[10px] text-slate-500 block">المفاعلة السعوية X_C:</span>
                <strong>{XC.toFixed(1)} Ω</strong>
              </div>
              <div className="bg-white p-2 rounded border border-sky-100">
                <span className="text-[10px] text-slate-500 block">المعاوقة الكلية Z:</span>
                <strong className="text-purple-700">{impedanceZ.toFixed(1)} Ω</strong>
              </div>
              <div className="bg-white p-2 rounded border border-sky-100">
                <span className="text-[10px] text-slate-500 block">شدة التيار الفعالة I:</span>
                <strong className="text-emerald-700">{currentI.toFixed(2)} A</strong>
              </div>
              <div className="bg-white p-2 rounded border border-sky-100 col-span-2">
                <span className="text-[10px] text-slate-500 block">زاوية الطور (θ):</span>
                <strong className={isResonance ? 'text-emerald-700' : 'text-slate-800'}>
                  {phaseAngleDeg.toFixed(1)}° {isResonance && '(متفقان في الطور)'}
                </strong>
              </div>
            </div>
          </div>

          {/* Frequency Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
              <span>{lang === 'ar' ? 'تردد المصدر المتردد (f)' : 'Frequency (f)'}</span>
              <span className="font-mono text-sky-700 font-semibold">{sourceFrequencyHz} Hz</span>
            </div>
            <input
              type="range"
              min="20"
              max="400"
              step="1"
              value={sourceFrequencyHz}
              onChange={(e) => setSourceFrequencyHz(parseInt(e.target.value))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Resistance R */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
              <span>{lang === 'ar' ? 'المقاومة الأومية (R)' : 'Resistance (R)'}</span>
              <span className="font-mono text-slate-700 font-semibold">{resistanceR} Ω</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={resistanceR}
              onChange={(e) => setResistanceR(parseInt(e.target.value))}
              className="w-full accent-slate-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Inductance L and Capacitance C */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>{lang === 'ar' ? 'الحث (L)' : 'Inductance'}</span>
                <span className="font-mono">{inductanceMh} mH</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={inductanceMh}
                onChange={(e) => setInductanceMh(parseInt(e.target.value))}
                className="w-full accent-sky-600 h-1 bg-slate-200"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>{lang === 'ar' ? 'السعة (C)' : 'Capacitance'}</span>
                <span className="font-mono">{capacitanceUf} μF</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={capacitanceUf}
                onChange={(e) => setCapacitanceUf(parseInt(e.target.value))}
                className="w-full accent-sky-600 h-1 bg-slate-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
