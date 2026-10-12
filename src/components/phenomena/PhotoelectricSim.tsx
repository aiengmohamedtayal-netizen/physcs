import React, { useState, useEffect, useRef } from 'react';
import { TargetMetal, PhotoelectricParams } from '../../types/phenomena';
import { Language } from '../../i18n/translations';
import { Zap, Sun, ShieldAlert } from 'lucide-react';

interface PhotoelectricSimProps {
  lang: Language;
}

const TARGET_METALS: TargetMetal[] = [
  { id: 'cesium', nameAr: 'السيزيوم (Cs)', nameEn: 'Cesium (Cs)', workFunctionEV: 2.14, colorHex: '#cbd5e1' },
  { id: 'potassium', nameAr: 'البوتاسيوم (K)', nameEn: 'Potassium (K)', workFunctionEV: 2.30, colorHex: '#94a3b8' },
  { id: 'sodium', nameAr: 'الصوديوم (Na)', nameEn: 'Sodium (Na)', workFunctionEV: 2.36, colorHex: '#cbd5e1' },
  { id: 'copper', nameAr: 'النحاس (Cu)', nameEn: 'Copper (Cu)', workFunctionEV: 4.70, colorHex: '#d97706' },
  { id: 'platinum', nameAr: 'البلاتين (Pt)', nameEn: 'Platinum (Pt)', workFunctionEV: 5.65, colorHex: '#64748b' }
];

export const PhotoelectricSim: React.FC<PhotoelectricSimProps> = ({ lang }) => {
  const [params, setParams] = useState<PhotoelectricParams>({
    targetMetalId: 'cesium',
    wavelengthNm: 450, // blue light
    lightIntensityPct: 80,
    stoppingVoltageV: 0.0
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const electronsRef = useRef<{ x: number; y: number; vx: number; vy: number; alive: boolean }[]>([]);

  const selectedMetal = TARGET_METALS.find((m) => m.id === params.targetMetalId) || TARGET_METALS[0];

  // Constants: hc in eV*nm = 1239.84
  const hc_eV_nm = 1239.84;
  const photonEnergyEV = hc_eV_nm / params.wavelengthNm;
  const maxKineticEnergyEV = Math.max(0, photonEnergyEV - selectedMetal.workFunctionEV);
  const stoppingPotentialV = maxKineticEnergyEV; // in Volts
  const canEmit = photonEnergyEV >= selectedMetal.workFunctionEV;
  const cutoffWavelengthNm = hc_eV_nm / selectedMetal.workFunctionEV;

  // Electrons movement and emission loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      // Spawn new photoelectrons if photon energy > work function and intensity > 0
      if (canEmit && params.lightIntensityPct > 0) {
        // Rate based on intensity
        if (Math.random() < (params.lightIntensityPct / 100) * 0.45) {
          // Initial velocity proportional to sqrt(K_max)
          const baseSpeed = Math.sqrt(maxKineticEnergyEV) * 3.5 + 0.8;
          electronsRef.current.push({
            x: 90, // Cathode plate position
            y: 110 + (Math.random() - 0.5) * 80,
            vx: baseSpeed * (0.85 + Math.random() * 0.3),
            vy: (Math.random() - 0.5) * 0.8,
            alive: true
          });
        }
      }

      // Update positions with electric field deceleration / acceleration
      // E field force: ax = -stoppingVoltage * factor
      const plateDist = 220;
      const accelX = -params.stoppingVoltageV * 2.2;

      electronsRef.current.forEach((el) => {
        el.vx += accelX * 0.016;
        el.x += el.vx;
        el.y += el.vy;

        // Turned back or reached anode plate (x >= 310)
        if (el.x >= 310 || el.x < 85 || el.y < 50 || el.y > 230) {
          el.alive = false;
        }
      });

      // Filter dead electrons
      electronsRef.current = electronsRef.current.filter((e) => e.alive);

      // Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
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

          // 1. Vacuum Glass Tube Envelope
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
          ctx.beginPath();
          ctx.roundRect(60, 45, width - 120, height - 90, 40);
          ctx.fill();
          ctx.stroke();

          // 2. Cathode Target Metal Plate (Left)
          ctx.fillStyle = selectedMetal.colorHex;
          ctx.fillRect(80, 80, 14, 120);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(80, 80, 14, 120);

          // Cathode Label
          ctx.fillStyle = '#475569';
          ctx.font = '600 11px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('Cathode (-)', 87, 70);

          // 3. Anode Collector Plate (Right)
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(width - 94, 80, 14, 120);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(width - 94, 80, 14, 120);

          ctx.fillText('Anode (+)', width - 87, 70);

          // 4. Incident Monochromatic Light Beam (coming from top-left)
          if (params.lightIntensityPct > 0) {
            ctx.save();
            const beamGrad = ctx.createLinearGradient(30, 30, 85, 130);
            beamGrad.addColorStop(0, `rgba(14, 165, 233, ${(params.lightIntensityPct / 100) * 0.7})`);
            beamGrad.addColorStop(1, `rgba(14, 165, 233, ${(params.lightIntensityPct / 100) * 0.2})`);

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(30, 40);
            ctx.lineTo(82, 90);
            ctx.lineTo(82, 170);
            ctx.lineTo(10, 80);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // 5. Render Ejected Photoelectrons (blue glowing particles)
          electronsRef.current.forEach((el) => {
            ctx.beginPath();
            ctx.arc(el.x, el.y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#0284c7';
            ctx.fill();

            // Specular glow
            ctx.beginPath();
            ctx.arc(el.x, el.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#e0f2fe';
            ctx.fill();
          });

          // 6. External Circuit Wires & Voltmeter Indicator at bottom
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(87, 200);
          ctx.lineTo(87, height - 25);
          ctx.lineTo(width / 2 - 35, height - 25);
          ctx.moveTo(width / 2 + 35, height - 25);
          ctx.lineTo(width - 87, height - 25);
          ctx.lineTo(width - 87, 200);
          ctx.stroke();

          // Variable Voltage Source Meter Box
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.fillRect(width / 2 - 35, height - 38, 70, 26);
          ctx.strokeRect(width / 2 - 35, height - 38, 70, 26);

          ctx.fillStyle = '#0369a1';
          ctx.font = '600 11px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`V = ${params.stoppingVoltageV.toFixed(2)}V`, width / 2, height - 21);

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [canEmit, maxKineticEnergyEV, params, selectedMetal]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'ar' ? '4. الظاهرة الكهروضوئية وتفسير آينشتاين الكمي (1905م)' : '4. Einstein’s Photoelectric Effect (1905)'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {lang === 'ar'
              ? 'حصل آينشتاين على جائزة نوبل لتفسيره انبعاث الإلكترونات عند سقوط الفوتونات الضوئية. لا تنبعث الإلكترونات إلا إذا تجاوزت طاقة الفوتون (E = hν) دالة الشغل للمعدن (Φ)، بصرف النظر عن شدة الضوء!'
              : 'Albert Einstein proved light consists of discrete energy packets (photons). Photoelectrons are only ejected if photon energy hν exceeds the metal’s work function Φ, regardless of light intensity.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Canvas Tube */}
        <div className="lg:col-span-7 relative w-full h-[320px] bg-slate-50/70 rounded-xl border border-slate-200/90 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            {canEmit ? (
              <span className="text-emerald-700 font-bold">
                {params.stoppingVoltageV >= stoppingPotentialV
                  ? (lang === 'ar' ? 'انقطاع التيار (جهد الإيقاف V₀)' : 'Cutoff (Stopping Voltage Reached)')
                  : (lang === 'ar' ? 'انبعاث كهرضوئي نشط' : 'Active Photoemission')}
              </span>
            ) : (
              <span className="text-rose-600 font-bold">
                {lang === 'ar' ? 'لا يوجد انبعاث (hν < Φ)' : 'No Emission (hν < Φ)'}
              </span>
            )}
          </div>
        </div>

        {/* Parameters */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Key Formula */}
          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/70 text-xs space-y-1.5">
            <span className="font-semibold text-sky-900 block">
              {lang === 'ar' ? 'معادلة آينشتاين الكهروضوئية:' : 'Einstein’s Photoelectric Equation:'}
            </span>
            <div className="font-mono text-center font-bold text-sm bg-white p-2 rounded border border-sky-100 text-sky-950">
              K_max = hν - Φ = e × V₀
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-1">
              <div>E_photon: <strong>{photonEnergyEV.toFixed(2)} eV</strong></div>
              <div>Φ_metal: <strong>{selectedMetal.workFunctionEV.toFixed(2)} eV</strong></div>
              <div>K_max: <strong className="text-emerald-700">{maxKineticEnergyEV.toFixed(2)} eV</strong></div>
              <div>V_stopping: <strong className="text-purple-700">{stoppingPotentialV.toFixed(2)} V</strong></div>
            </div>
          </div>

          {/* Target Metal Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              {lang === 'ar' ? 'معدن المهبط (دالة الشغل Φ):' : 'Cathode Metal Target (Work Function Φ):'}
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {TARGET_METALS.map((metal) => (
                <button
                  key={metal.id}
                  onClick={() => setParams((p) => ({ ...p, targetMetalId: metal.id }))}
                  className={`p-2 rounded-lg border text-left rtl:text-right transition-colors ${
                    params.targetMetalId === metal.id
                      ? 'border-sky-500 bg-sky-50 text-sky-950 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="truncate font-medium">{lang === 'ar' ? metal.nameAr : metal.nameEn}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{metal.workFunctionEV} eV</div>
                </button>
              ))}
            </div>
          </div>

          {/* Light Wavelength Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'الطول الموجي للضوء الساقط (λ)' : 'Incident Light Wavelength (λ)'}</span>
              <span className="font-mono text-sky-700 font-semibold">{params.wavelengthNm} nm</span>
            </div>
            <input
              type="range"
              min="200"
              max="700"
              step="5"
              value={params.wavelengthNm}
              onChange={(e) => setParams((p) => ({ ...p, wavelengthNm: parseFloat(e.target.value) }))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>200 nm (فوق بنفسجي)</span>
              <span>450 nm (أزرق)</span>
              <span>700 nm (أحمر)</span>
            </div>
          </div>

          {/* Stopping Voltage Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'جهد الإيقاف العكسي (V)' : 'Reverse Stopping Voltage (V)'}</span>
              <span className="font-mono text-purple-700 font-semibold">{params.stoppingVoltageV.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="0"
              max="4.0"
              step="0.05"
              value={params.stoppingVoltageV}
              onChange={(e) => setParams((p) => ({ ...p, stoppingVoltageV: parseFloat(e.target.value) }))}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.0 V (دون إعاقة)</span>
              <span>{stoppingPotentialV.toFixed(2)} V (حد إيقاف التيار)</span>
              <span>4.0 V</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
