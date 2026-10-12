import React, { useState, useEffect, useRef } from 'react';
import { DoubleSlitParams } from '../../types/phenomena';
import { Language } from '../../i18n/translations';
import { Waves, Sparkles } from 'lucide-react';

interface DoubleSlitSimProps {
  lang: Language;
}

// Convert wavelength in nm to RGB color string
function nmToRGB(wavelength: number): { css: string; hex: string } {
  let r = 0, g = 0, b = 0;
  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0.0;
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelength >= 645 && wavelength <= 750) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }

  const red = Math.round(r * 255);
  const green = Math.round(g * 255);
  const blue = Math.round(b * 255);
  return {
    css: `rgb(${red}, ${green}, ${blue})`,
    hex: `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`
  };
}

export const DoubleSlitSim: React.FC<DoubleSlitSimProps> = ({ lang }) => {
  const [params, setParams] = useState<DoubleSlitParams>({
    wavelengthNm: 632.8, // He-Ne Red Laser
    slitDistanceMm: 0.25, // d in mm
    slitWidthMm: 0.05,   // a in mm
    screenDistanceM: 1.5, // D in meters
    intensity: 100
  });

  const [mode, setMode] = useState<'wave' | 'photons'>('wave');
  const [photonHits, setPhotonHits] = useState<{ x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const laserColor = nmToRGB(params.wavelengthNm);

  // Fringe width calculation: delta y = (lambda * D) / d
  // lambda in meters: lambdaNm * 1e-9
  // d in meters: slitDistanceMm * 1e-3
  const fringeSpacingMm =
    params.slitDistanceMm > 0
      ? (params.wavelengthNm * 1e-6 * params.screenDistanceM) / (params.slitDistanceMm * 1e-3)
      : 0;

  // Clear photon accumulation when parameters change
  useEffect(() => {
    setPhotonHits([]);
  }, [params.wavelengthNm, params.slitDistanceMm, params.screenDistanceM]);

  // Photon simulation loop
  useEffect(() => {
    if (mode !== 'photons') return;

    const interval = setInterval(() => {
      // Monte-Carlo sampling from intensity distribution
      const lambda = params.wavelengthNm * 1e-9;
      const d = params.slitDistanceMm * 1e-3;
      const D = params.screenDistanceM;

      const newHits: { x: number; y: number }[] = [];
      for (let i = 0; i < 6; i++) {
        // Random screen position y between -0.015m and +0.015m
        const y = (Math.random() - 0.5) * 0.03;
        const theta = Math.atan2(y, D);

        // Interference term: cos^2(pi * d * sin(theta) / lambda)
        const alpha = (Math.PI * d * Math.sin(theta)) / lambda;
        const prob = Math.cos(alpha) * Math.cos(alpha);

        if (Math.random() < prob) {
          newHits.push({
            x: y, // position in meters
            y: Math.random() * 80 // vertical detector spread
          });
        }
      }

      setPhotonHits((prev) => [...prev.slice(-800), ...newHits]);
    }, 40);

    return () => clearInterval(interval);
  }, [mode, params]);

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

    const lambda = params.wavelengthNm * 1e-9;
    const d = params.slitDistanceMm * 1e-3;
    const a = params.slitWidthMm * 1e-3;
    const D = params.screenDistanceM;

    // Split Canvas into two sections:
    // Top (60%): Live Intensity Curve I(y)
    // Bottom (40%): Realistic Optical Screen
    const curveH = height * 0.58;
    const screenY = curveH + 10;
    const screenH = height - screenY - 10;

    // Intensity curve baseline
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, curveH);
    ctx.lineTo(width - 30, curveH);
    ctx.stroke();

    const maxScreenRangeM = 0.024; // +/- 24mm from center

    if (mode === 'wave') {
      // 1. Draw smooth analytical intensity curve
      ctx.strokeStyle = laserColor.css;
      ctx.fillStyle = laserColor.css.replace('rgb', 'rgba').replace(')', ', 0.15)');
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      const points: { x: number; y: number }[] = [];

      for (let px = 30; px <= width - 30; px++) {
        const normX = (px - width / 2) / ((width - 60) / 2); // [-1, 1]
        const yPosM = normX * maxScreenRangeM;
        const theta = Math.atan2(yPosM, D);

        // Double slit formula: I = cos^2(alpha) * sinc^2(beta)
        const alpha = (Math.PI * d * Math.sin(theta)) / lambda;
        const beta = (Math.PI * a * Math.sin(theta)) / lambda;

        const sinc = Math.abs(beta) < 0.0001 ? 1 : Math.sin(beta) / beta;
        const intensity = Math.pow(Math.cos(alpha), 2) * Math.pow(sinc, 2);

        const py = curveH - intensity * (curveH - 25);
        points.push({ x: px, y: py });
      }

      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Fill underneath
      ctx.lineTo(points[points.length - 1].x, curveH);
      ctx.lineTo(points[0].x, curveH);
      ctx.closePath();
      ctx.fill();

      // 2. Realistic Optical Screen Bar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(30, screenY, width - 60, screenH);

      // Render vertical interference fringes across screen
      for (let px = 30; px <= width - 30; px++) {
        const normX = (px - width / 2) / ((width - 60) / 2);
        const yPosM = normX * maxScreenRangeM;
        const theta = Math.atan2(yPosM, D);

        const alpha = (Math.PI * d * Math.sin(theta)) / lambda;
        const beta = (Math.PI * a * Math.sin(theta)) / lambda;
        const sinc = Math.abs(beta) < 0.0001 ? 1 : Math.sin(beta) / beta;
        const intensity = Math.pow(Math.cos(alpha), 2) * Math.pow(sinc, 2);

        ctx.fillStyle = laserColor.css.replace('rgb', 'rgba').replace(')', `, ${intensity * 0.95})`);
        ctx.fillRect(px, screenY, 1, screenH);
      }
    } else {
      // PHOTONS MODE (Quantum particle accumulation)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(30, screenY - curveH * 0.5, width - 60, height - (screenY - curveH * 0.5) - 10);

      // Render individual hit spots
      ctx.fillStyle = laserColor.css;
      photonHits.forEach((hit) => {
        const normX = hit.x / maxScreenRangeM; // [-1, 1]
        const px = width / 2 + normX * ((width - 60) / 2);
        const py = screenY - curveH * 0.5 + 15 + (hit.y / 80) * (height - (screenY - curveH * 0.5) - 40);

        if (px >= 30 && px <= width - 30) {
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Overlay photon count
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Photons Detected: ${photonHits.length}`, 40, curveH - 10);
    }

    ctx.restore();
  }, [params, mode, photonHits, laserColor]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'ar' ? '3. تجربة شقي يونغ وتداخل الموجات (1801م)' : '3. Young’s Double-Slit Experiment (1801)'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {lang === 'ar'
              ? 'التجربة التاريخية التي حسمت الطبيعة الموجية للضوء (ثم أسست لثنائية الموجة والجسيم الكمية). يتداخل الضوء القادم من الشقين تداخلاً بناءً ومدمراً لينتج هدب تداخل مضيئة ومظلمة.'
              : 'Thomas Young demonstrated the wave nature of light via constructive and destructive interference fringes. Today, it remains the central mystery of quantum mechanics when tested with single photons.'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setMode('wave')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              mode === 'wave' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'موجة كلاسيكية' : 'Classical Wave'}
          </button>
          <button
            onClick={() => setMode('photons')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              mode === 'photons' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'فوتونات كمية مفردة' : 'Single Photons'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Canvas */}
        <div className="lg:col-span-7 relative w-full h-[320px] bg-slate-50/70 rounded-xl border border-slate-200/90 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full" />

          {/* Wavelength Color Chip */}
          <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: laserColor.hex }} />
            <span>λ = {params.wavelengthNm.toFixed(1)} nm</span>
          </div>
        </div>

        {/* Parameters */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Key Formula */}
          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/70 text-xs space-y-1.5">
            <span className="font-semibold text-sky-900 block">
              {lang === 'ar' ? 'المسافة بين هدب التداخل المتعاقبة:' : 'Interference Fringe Spacing Formula:'}
            </span>
            <div className="font-mono text-center font-bold text-sm bg-white p-2 rounded border border-sky-100 text-sky-950">
              Δy = (λ × D) / d = {fringeSpacingMm.toFixed(2)} mm
            </div>
            <div className="text-[11px] text-sky-800">
              {lang === 'ar'
                ? 'زيادة الطول الموجي λ أو مسافة الشاشة D تزيد المسافة بين الهدب، بينما تقريب الشقين d يباعد الهدب.'
                : 'Longer wavelength λ or larger screen distance D widens fringe separation; smaller slit gap d widens fringes.'}
            </div>
          </div>

          {/* Wavelength Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'الطول الموجي لليزر (λ)' : 'Laser Wavelength (λ)'}</span>
              <span className="font-mono font-semibold" style={{ color: laserColor.hex }}>
                {params.wavelengthNm.toFixed(0)} nm
              </span>
            </div>
            <input
              type="range"
              min="380"
              max="700"
              step="2"
              value={params.wavelengthNm}
              onChange={(e) => setParams((p) => ({ ...p, wavelengthNm: parseFloat(e.target.value) }))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>380 nm (بنفسجي)</span>
              <span>532 nm (أخضر)</span>
              <span>633 nm (أحمر)</span>
            </div>
          </div>

          {/* Slit Distance (d) */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'المسافة بين الشقين (d)' : 'Slit Separation (d)'}</span>
              <span className="font-mono text-sky-700 font-semibold">{params.slitDistanceMm.toFixed(2)} mm</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.60"
              step="0.01"
              value={params.slitDistanceMm}
              onChange={(e) => setParams((p) => ({ ...p, slitDistanceMm: parseFloat(e.target.value) }))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Screen Distance (D) */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'المسافة إلى الشاشة (D)' : 'Distance to Screen (D)'}</span>
              <span className="font-mono text-sky-700 font-semibold">{params.screenDistanceM.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={params.screenDistanceM}
              onChange={(e) => setParams((p) => ({ ...p, screenDistanceM: parseFloat(e.target.value) }))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
