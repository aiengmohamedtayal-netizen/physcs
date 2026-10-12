import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../../i18n/translations';
import { Play, RotateCcw, ArrowRight, ArrowLeft, Magnet, Zap } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface Chapter3FaradaySimProps {
  lang: Language;
}

export const Chapter3FaradaySim: React.FC<Chapter3FaradaySimProps> = ({ lang }) => {
  const [turnsN, setTurnsN] = useState<number>(200); // coil turns
  const [magnetSpeed, setMagnetSpeed] = useState<number>(1.0);
  const [magnetPole, setMagnetPole] = useState<'N' | 'S'>('N');
  const [magnetX, setMagnetX] = useState<number>(90); // distance px
  const [needleAngleDeg, setNeedleAngleDeg] = useState<number>(0);
  const [inducedEmf, setInducedEmf] = useState<number>(0);
  const [neonLit, setNeonLit] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevMagnetXRef = useRef<number>(90);

  // Animate moving magnet in and out
  const moveIn = () => {
    setMagnetX(180); // moving closer into coil
  };

  const moveOut = () => {
    setMagnetX(50); // moving away
  };

  const triggerNeonFlash = () => {
    setNeonLit(true);
    soundManager.playPendulumTick(1500);
    setTimeout(() => setNeonLit(false), 250);
  };

  // Physics calculation of flux change and induced emf
  useEffect(() => {
    const dx = magnetX - prevMagnetXRef.current;
    prevMagnetXRef.current = magnetX;

    if (Math.abs(dx) > 0.1) {
      // Relative motion detected
      const poleFactor = magnetPole === 'N' ? 1 : -1;
      const rate = dx * magnetSpeed * poleFactor;
      // Induced emf by Faraday: emf = -N * dPhi/dt
      const emfVal = -(turnsN / 100) * rate * 0.45;
      setInducedEmf(emfVal);

      // Galvanometer needle deflection (degrees)
      const deflection = Math.max(-50, Math.min(50, emfVal * 12));
      setNeedleAngleDeg(deflection);
      soundManager.playPhotogateBeam();
    } else {
      // Magnet at rest -> zero emf
      setInducedEmf(0);
      setNeedleAngleDeg(0);
    }
  }, [magnetX, magnetSpeed, magnetPole, turnsN]);

  // Main Canvas Render
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

    const coilCenterX = width * 0.58;
    const coilCenterY = 130;
    const coilRadius = 45;
    const coilLength = 110;

    // 1. Solenoid Coil Structure
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(coilCenterX - coilLength / 2, coilCenterY - coilRadius, coilLength, coilRadius * 2, 8);
    ctx.fill();
    ctx.stroke();

    // Coil Windings (Copper loops)
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4;
    const loopCount = 9;
    for (let i = 0; i < loopCount; i++) {
      const lx = coilCenterX - coilLength / 2 + 10 + i * 11;
      ctx.beginPath();
      ctx.ellipse(lx, coilCenterY, 5, coilRadius + 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Bar Magnet
    const magW = 100;
    const magH = 34;
    const curMagX = magnetX;
    const curMagY = coilCenterY - magH / 2;

    // North half (Red)
    ctx.fillStyle = magnetPole === 'N' ? '#dc2626' : '#0284c7';
    ctx.fillRect(curMagX, curMagY, magW / 2, magH);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(magnetPole === 'N' ? 'N' : 'S', curMagX + magW / 4, curMagY + magH / 2);

    // South half (Blue)
    ctx.fillStyle = magnetPole === 'N' ? '#0284c7' : '#dc2626';
    ctx.fillRect(curMagX + magW / 2, curMagY, magW / 2, magH);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(magnetPole === 'N' ? 'S' : 'N', curMagX + (3 * magW) / 4, curMagY + magH / 2);

    // Magnet outline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(curMagX, curMagY, magW, magH);

    // Magnetic field lines emerging from front pole
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(curMagX + magW, curMagY + magH / 2);
      ctx.quadraticCurveTo(curMagX + magW + 40, curMagY + magH / 2 + i * 30, curMagX + magW + 80, curMagY + magH / 2 + i * 45);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 3. Lenz Law Induced Pole Label on Coil Face
    if (Math.abs(inducedEmf) > 0.05) {
      const isApproaching = magnetX > prevMagnetXRef.current;
      const inducedPole = isApproaching
        ? (magnetPole === 'N' ? 'N' : 'S') // Repulsion: same pole
        : (magnetPole === 'N' ? 'S' : 'N'); // Attraction: opposite pole

      ctx.fillStyle = inducedPole === 'N' ? '#dc2626' : '#0284c7';
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillText(`قطب مستحث [${inducedPole}]`, coilCenterX - coilLength / 2 - 25, coilCenterY - 35);
    }

    // 4. Connecting Wires to Galvanometer
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(coilCenterX - coilLength / 2 + 10, coilCenterY + coilRadius);
    ctx.lineTo(coilCenterX - coilLength / 2 + 10, height - 50);
    ctx.lineTo(width * 0.58 - 35, height - 50);

    ctx.moveTo(coilCenterX + coilLength / 2 - 10, coilCenterY + coilRadius);
    ctx.lineTo(coilCenterX + coilLength / 2 - 10, height - 50);
    ctx.lineTo(width * 0.58 + 35, height - 50);
    ctx.stroke();

    // 5. Zero-Centered Galvanometer Meter (Bottom Center)
    const galvX = width * 0.58;
    const galvY = height - 50;
    const galvR = 38;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(galvX, galvY, galvR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Galvanometer G letter
    ctx.fillStyle = '#0284c7';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillText('G', galvX, galvY + 18);

    // Scale ticks: -50, 0, +50
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    for (let deg = -40; deg <= 40; deg += 20) {
      const rad = ((deg - 90) * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(galvX + (galvR - 8) * Math.cos(rad), galvY + (galvR - 8) * Math.sin(rad));
      ctx.lineTo(galvX + galvR * Math.cos(rad), galvY + galvR * Math.sin(rad));
      ctx.stroke();
    }

    // Zero mark in the center
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('0', galvX, galvY - galvR + 12);

    // Deflecting Needle
    const needleRad = ((needleAngleDeg - 90) * Math.PI) / 180;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(galvX, galvY);
    ctx.lineTo(galvX + (galvR - 5) * Math.cos(needleRad), galvY + (galvR - 5) * Math.sin(needleRad));
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(galvX, galvY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Neon Flash Lamp indicator on right
    if (neonLit) {
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(width - 45, 60, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }, [magnetX, magnetPole, turnsN, inducedEmf, needleAngleDeg, neonLit]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Magnet className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">
            {lang === 'ar' ? 'محاكي تجربة فاراداي وقاعدة لنز للحث الكهرومغناطيسي' : 'Faraday’s Induction & Lenz’s Law Simulator'}
          </h3>
        </div>

        {/* Action Movement Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={moveIn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{lang === 'ar' ? 'تقريب المغناطيس (ΔΦ > 0)' : 'Push In Magnet'}</span>
          </button>
          <button
            onClick={moveOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{lang === 'ar' ? 'إبعاد المغناطيس (ΔΦ < 0)' : 'Pull Out Magnet'}</span>
          </button>
          <button
            onClick={triggerNeonFlash}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
            title="تجربة مصباح النيون للحث الذاتي"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'وميض النيون (حث ذاتي طردي)' : 'Neon Lamp Spark'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Canvas Apparatus */}
        <div className="lg:col-span-7 relative w-full h-[320px] bg-slate-50/70 rounded-xl border border-slate-200/90 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full" />

          {/* Live EMF Readout */}
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-slate-500">{lang === 'ar' ? 'القوة الدافعة المستحثة (emf):' : 'Induced emf:'} </span>
            <strong className={inducedEmf > 0 ? 'text-emerald-700' : inducedEmf < 0 ? 'text-rose-600' : 'text-slate-700'}>
              {inducedEmf.toFixed(2)} V
            </strong>
          </div>
        </div>

        {/* Parameters & Experiment Sliders */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Faraday & Lenz Law Card */}
          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200/80 text-xs space-y-1.5">
            <span className="font-semibold text-sky-950 block">
              {lang === 'ar' ? 'قانون فاراداي وقاعدة لنز:' : 'Faraday’s Law with Lenz’s Sign:'}
            </span>
            <div className="font-mono text-center font-bold text-sm bg-white p-2 rounded border border-sky-100 text-sky-950">
              emf = -N × (ΔΦ_m / Δt)
            </div>
            <div className="text-[11px] text-sky-800">
              {lang === 'ar'
                ? 'الإشارة السالبة تعبر عن قاعدة لنز: التيار المستحث يولد فيضاً يقاوم حركة المغناطيس (تنافر عند التقريب، وتجاذب عند الابتعاد).'
                : 'The negative sign represents Lenz’s law: the induced current produces a field opposing the flux change.'}
            </div>
          </div>

          {/* Magnet Pole Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              {lang === 'ar' ? 'القطب الموجه نحو الملف:' : 'Facing Magnet Pole:'}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setMagnetPole('N')}
                className={`py-2 rounded-lg border font-bold transition-colors ${
                  magnetPole === 'N' ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {lang === 'ar' ? 'القطب الشمالي (N الأحمر)' : 'North Pole (N)'}
              </button>
              <button
                onClick={() => setMagnetPole('S')}
                className={`py-2 rounded-lg border font-bold transition-colors ${
                  magnetPole === 'S' ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {lang === 'ar' ? 'القطب الجنوبي (S الأزرق)' : 'South Pole (S)'}
              </button>
            </div>
          </div>

          {/* Number of Coil Turns (N) Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
              <span>{lang === 'ar' ? 'عدد لفات الملف (N)' : 'Coil Turns (N)'}</span>
              <span className="font-mono text-sky-700 font-semibold">{turnsN} {lang === 'ar' ? 'لفة' : 'turns'}</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="25"
              value={turnsN}
              onChange={(e) => setTurnsN(parseInt(e.target.value))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Magnet Motion Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
              <span>{lang === 'ar' ? 'موضع المغناطيس اليدوي' : 'Manual Magnet Position'}</span>
              <span className="font-mono text-slate-700 font-semibold">{magnetX} px</span>
            </div>
            <input
              type="range"
              min="30"
              max="210"
              step="2"
              value={magnetX}
              onChange={(e) => setMagnetX(parseInt(e.target.value))}
              className="w-full accent-slate-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
