import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../../i18n/translations';
import { Play, RotateCcw, Zap, Layers, ToggleLeft, ToggleRight } from 'lucide-react';

interface Chapter1OhmSimProps {
  lang: Language;
}

export const Chapter1OhmSim: React.FC<Chapter1OhmSimProps> = ({ lang }) => {
  const [circuitType, setCircuitType] = useState<'single' | 'series' | 'parallel' | 'closed_cell'>('single');
  const [emf, setEmf] = useState<number>(12); // V_B in Volts
  const [internalR, setInternalR] = useState<number>(1.0); // r in Ohms
  const [r1, setR1] = useState<number>(5.0); // R1 in Ohms
  const [r2, setR2] = useState<number>(10.0); // R2 in Ohms
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Equivalent external resistance R_eq
  let rEquivalent = r1;
  if (circuitType === 'series') {
    rEquivalent = r1 + r2;
  } else if (circuitType === 'parallel') {
    rEquivalent = (r1 * r2) / (r1 + r2);
  }

  // Current calculation
  const totalR = isOpen ? Infinity : rEquivalent + (circuitType === 'closed_cell' ? internalR : 0);
  const current = isOpen ? 0 : emf / totalR;
  const terminalVoltage = isOpen ? emf : circuitType === 'closed_cell' ? emf - current * internalR : emf;
  const v1 = circuitType === 'parallel' ? terminalVoltage : current * r1;
  const v2 = circuitType === 'parallel' ? terminalVoltage : current * r2;

  // Canvas visual schematic
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

    const padX = 50;
    const padY = 40;
    const boxW = width - padX * 2;
    const boxH = height - padY * 2;

    // Draw main loop rectangle
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, padY, boxW, boxH);

    // 1. Battery on bottom wire
    const batX = width / 2;
    const batY = padY + boxH;

    // Cut hole for battery
    ctx.clearRect(batX - 45, batY - 15, 90, 30);

    // Battery long line (+), short line (-)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(batX - 10, batY - 20);
    ctx.lineTo(batX - 10, batY + 20); // Long positive line
    ctx.stroke();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(batX + 10, batY - 12);
    ctx.lineTo(batX + 10, batY + 12); // Short thick negative line
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`V_B = ${emf}V`, batX, batY + 34);

    if (circuitType === 'closed_cell') {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`(r = ${internalR}Ω)`, batX, batY + 48);
    }

    // 2. Switch on left wire
    const swX = padX;
    const swY = padY + boxH / 2;
    ctx.clearRect(swX - 15, swY - 25, 30, 50);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(swX, swY - 15, 4, 0, Math.PI * 2);
    ctx.arc(swX, swY + 15, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isOpen ? '#dc2626' : '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(swX, swY - 15);
    if (isOpen) {
      ctx.lineTo(swX - 18, swY + 8); // open slant
    } else {
      ctx.lineTo(swX, swY + 15); // closed contact
    }
    ctx.stroke();

    ctx.font = '11px "Tajawal", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText(isOpen ? (lang === 'ar' ? 'مفتاح مفتوح (I = 0)' : 'Open Switch') : (lang === 'ar' ? 'مفتاح مغلق' : 'Closed Switch'), swX - 8, swY);

    // 3. Resistors on top wire
    const topY = padY;
    if (circuitType === 'single' || circuitType === 'closed_cell') {
      // Single resistor
      const rX = width / 2;
      ctx.clearRect(rX - 40, topY - 15, 80, 30);
      drawZigZagResistor(ctx, rX - 35, topY, 70, '#0284c7');
      ctx.fillStyle = '#0284c7';
      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`R = ${r1}Ω`, rX, topY - 18);
    } else if (circuitType === 'series') {
      // Series resistors R1 and R2
      const r1X = width / 2 - 60;
      const r2X = width / 2 + 60;
      ctx.clearRect(r1X - 35, topY - 15, 70, 30);
      ctx.clearRect(r2X - 35, topY - 15, 70, 30);
      drawZigZagResistor(ctx, r1X - 30, topY, 60, '#0284c7');
      drawZigZagResistor(ctx, r2X - 30, topY, 60, '#0d9488');

      ctx.fillStyle = '#0284c7';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`R₁ = ${r1}Ω`, r1X, topY - 16);
      ctx.fillStyle = '#0d9488';
      ctx.fillText(`R₂ = ${r2}Ω`, r2X, topY - 16);
    } else if (circuitType === 'parallel') {
      // Parallel branch
      const splitX1 = width / 2 - 70;
      const splitX2 = width / 2 + 70;
      ctx.clearRect(splitX1, topY - 2, 140, 4);

      // Branch 1 (top)
      ctx.beginPath();
      ctx.moveTo(splitX1, topY);
      ctx.lineTo(splitX1, topY - 24);
      ctx.lineTo(splitX2, topY - 24);
      ctx.lineTo(splitX2, topY);
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      // Branch 2 (bottom)
      ctx.beginPath();
      ctx.moveTo(splitX1, topY);
      ctx.lineTo(splitX1, topY + 24);
      ctx.lineTo(splitX2, topY + 24);
      ctx.lineTo(splitX2, topY);
      ctx.stroke();

      // Resistors on branches
      const midX = width / 2;
      ctx.clearRect(midX - 30, topY - 34, 60, 20);
      ctx.clearRect(midX - 30, topY + 14, 60, 20);
      drawZigZagResistor(ctx, midX - 25, topY - 24, 50, '#0284c7');
      drawZigZagResistor(ctx, midX - 25, topY + 24, 50, '#0d9488');

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0284c7';
      ctx.fillText(`R₁ = ${r1}Ω`, midX, topY - 36);
      ctx.fillStyle = '#0d9488';
      ctx.fillText(`R₂ = ${r2}Ω`, midX, topY + 44);
    }

    // 4. Ammeter on right wire
    const amX = padX + boxW;
    const amY = padY + boxH / 2;
    ctx.clearRect(amX - 20, amY - 20, 40, 40);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(amX, amY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0284c7';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', amX, amY);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`I = ${current.toFixed(2)} A`, amX, amY + 28);

    // Current flow arrows if closed
    if (!isOpen && current > 0) {
      drawArrow(ctx, padX + 30, padY + boxH, padX + 50, padY + boxH, '#0284c7');
      drawArrow(ctx, padX + boxW, padY + 30, padX + boxW, padY + 50, '#0284c7');
    }

    ctx.restore();
  }, [circuitType, emf, internalR, r1, r2, isOpen, current, terminalVoltage]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      {/* Circuit Type Segmented Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setCircuitType('single')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              circuitType === 'single' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'قانون أوم البسيط' : 'Simple Ohm’s Law'}
          </button>
          <button
            onClick={() => setCircuitType('series')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              circuitType === 'series' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'توصيل توالي' : 'Series Resistors'}
          </button>
          <button
            onClick={() => setCircuitType('parallel')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              circuitType === 'parallel' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'توصيل توازي' : 'Parallel Resistors'}
          </button>
          <button
            onClick={() => setCircuitType('closed_cell')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              circuitType === 'closed_cell' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'أوم للدائرة المغلقة (V = V_B - Ir)' : 'Closed Circuit (V = V_B - Ir)'}
          </button>
        </div>

        {/* Switch Toggle Button */}
        <button
          onClick={() => setIsOpen((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            isOpen ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          {isOpen ? <ToggleLeft className="w-4 h-4 text-rose-600" /> : <ToggleRight className="w-4 h-4 text-emerald-600" />}
          <span>{isOpen ? (lang === 'ar' ? 'الدائرة مفتوحة (I = 0)' : 'Switch Open') : (lang === 'ar' ? 'الدائرة مغلقة' : 'Switch Closed')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Canvas Schematic */}
        <div className="lg:col-span-7 relative w-full h-[320px] bg-slate-50/70 rounded-xl border border-slate-200/90 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Sliders & Math Calculations */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Telemetry Box */}
          <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-200/80 text-xs space-y-2">
            <span className="font-bold text-sky-950 block">
              {lang === 'ar' ? 'القراءات الحسابية اللحظية للمسألة:' : 'Live Numerical Analysis:'}
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-white p-2 rounded border border-sky-100">
                <span className="text-[10px] text-slate-500 block">المقاومة المكافئة R_eq:</span>
                <strong className="text-slate-900">{rEquivalent.toFixed(2)} Ω</strong>
              </div>
              <div className="bg-white p-2 rounded border border-sky-100">
                <span className="text-[10px] text-slate-500 block">شدة التيار الكلي I:</span>
                <strong className="text-sky-700">{current.toFixed(2)} A</strong>
              </div>
              <div className="bg-white p-2 rounded border border-sky-100">
                <span className="text-[10px] text-slate-500 block">فرق الجهد الطرفي V:</span>
                <strong className="text-purple-700">{terminalVoltage.toFixed(2)} V</strong>
              </div>
              <div className="bg-white p-2 rounded border border-sky-100">
                <span className="text-[10px] text-slate-500 block">الجهد المفقود (I × r):</span>
                <strong className="text-rose-600">{(current * internalR).toFixed(2)} V</strong>
              </div>
            </div>
          </div>

          {/* Slider 1: Emf */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
              <span>{lang === 'ar' ? 'القوة الدافعة الكهربية للبطارية (V_B)' : 'Battery Emf (V_B)'}</span>
              <span className="font-mono text-sky-700 font-semibold">{emf} V</span>
            </div>
            <input
              type="range"
              min="2"
              max="36"
              step="1"
              value={emf}
              onChange={(e) => setEmf(parseInt(e.target.value))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 2: R1 */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
              <span>{lang === 'ar' ? 'المقاومة الخارجية الأولى (R₁)' : 'First Resistor (R₁)'}</span>
              <span className="font-mono text-sky-700 font-semibold">{r1.toFixed(1)} Ω</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="0.5"
              value={r1}
              onChange={(e) => setR1(parseFloat(e.target.value))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 3: R2 if series/parallel */}
          {(circuitType === 'series' || circuitType === 'parallel') && (
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                <span>{lang === 'ar' ? 'المقاومة الخارجية الثانية (R₂)' : 'Second Resistor (R₂)'}</span>
                <span className="font-mono text-emerald-700 font-semibold">{r2.toFixed(1)} Ω</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={r2}
                onChange={(e) => setR2(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Slider 4: Internal Resistance r if closed_cell */}
          {circuitType === 'closed_cell' && (
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                <span>{lang === 'ar' ? 'المقاومة الداخلية للعمود (r)' : 'Internal Resistance (r)'}</span>
                <span className="font-mono text-rose-600 font-semibold">{internalR.toFixed(1)} Ω</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.2"
                value={internalR}
                onChange={(e) => setInternalR(parseFloat(e.target.value))}
                className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function drawZigZagResistor(ctx: CanvasRenderingContext2D, startX: number, y: number, length: number, color: string) {
  const segments = 6;
  const segW = length / segments;
  const amp = 8;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(startX, y);

  for (let i = 0; i < segments; i++) {
    const xMid = startX + segW * (i + 0.5);
    const sign = i % 2 === 0 ? 1 : -1;
    ctx.lineTo(xMid, y + sign * amp);
  }
  ctx.lineTo(startX + length, y);
  ctx.stroke();
}

function drawArrow(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) {
  const headlen = 6;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}
