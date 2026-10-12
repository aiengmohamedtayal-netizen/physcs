import React, { useState, useEffect, useRef } from 'react';
import { FoucaultParams } from '../../types/phenomena';
import { Language } from '../../i18n/translations';
import { Play, Pause, RotateCcw, Compass, MapPin } from 'lucide-react';

interface FoucaultPendulumSimProps {
  lang: Language;
}

const CITY_PRESETS = [
  { nameAr: 'بانثيون باريس (موقع التجربة الأصلي)', nameEn: 'Paris Panthéon (Original)', lat: 48.85, length: 67 },
  { nameAr: 'القطب الشمالي (أقصى دوران)', nameEn: 'North Pole (Max Precession)', lat: 90.0, length: 30 },
  { nameAr: 'مكة المكرمة', nameEn: 'Mecca', lat: 21.42, length: 30 },
  { nameAr: 'خط الاستواء (انعدام الدوران)', nameEn: 'Equator (Zero Precession)', lat: 0.0, length: 30 },
  { nameAr: 'طوكيو', nameEn: 'Tokyo', lat: 35.68, length: 30 },
  { nameAr: 'سيدني (نصف الكرة الجنوبي)', nameEn: 'Sydney (Southern Hemisphere)', lat: -33.87, length: 30 }
];

export const FoucaultPendulumSim: React.FC<FoucaultPendulumSimProps> = ({ lang }) => {
  const [params, setParams] = useState<FoucaultParams>({
    latitudeDeg: 48.85,
    pendulumLength: 67,
    initialAmplitudeDeg: 5
  });

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1000); // Time-lapse acceleration
  const [precessionDeg, setPrecessionDeg] = useState<number>(0);
  const [oscillationPhase, setOscillationPhase] = useState<number>(0);
  const [knockedPegs, setKnockedPegs] = useState<boolean[]>(new Array(36).fill(false));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Earth rotation rate: 360 degrees / 24 hours = 15 deg/hour = 0.004166 deg/sec
  const earthRateDegPerSec = 360 / 86400;
  // Precession rate: Omega = Omega_earth * sin(latitude)
  const precessionRateDegPerSec = earthRateDegPerSec * Math.sin((params.latitudeDeg * Math.PI) / 180);
  // Precession period in hours
  const sinLat = Math.abs(Math.sin((params.latitudeDeg * Math.PI) / 180));
  const periodHours = sinLat > 0.01 ? 24 / sinLat : Infinity;

  // Natural oscillation period of pendulum: T = 2*pi*sqrt(L/g)
  const swingPeriod = 2 * Math.PI * Math.sqrt(params.pendulumLength / 9.807);

  // Reset
  const handleReset = () => {
    setPrecessionDeg(0);
    setOscillationPhase(0);
    setKnockedPegs(new Array(36).fill(false));
  };

  // Animation loop
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (isRunning && dt > 0) {
        // Fast-forwarded time
        const effectiveDt = dt * speedMultiplier;

        // Advance oscillation
        setOscillationPhase((prev) => (prev + (effectiveDt * (2 * Math.PI)) / swingPeriod) % (2 * Math.PI));

        // Advance precession
        setPrecessionDeg((prev) => {
          const next = prev + precessionRateDegPerSec * effectiveDt;

          // Check if any pegs around circumference (36 pegs, every 10 deg) are knocked down
          const normalizedAngle = ((next % 360) + 360) % 360;
          const pegIdx = Math.floor(normalizedAngle / 10) % 36;
          setKnockedPegs((pegs) => {
            if (!pegs[pegIdx]) {
              const updated = [...pegs];
              updated[pegIdx] = true;
              return updated;
            }
            return pegs;
          });

          return next;
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, speedMultiplier, swingPeriod, precessionRateDegPerSec]);

  // Canvas drawing
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

    const centerX = width / 2;
    const centerY = height / 2;
    const dialRadius = Math.min(width, height) * 0.38;

    // 1. Compass dial ring
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, dialRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle coordinate lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - dialRadius - 20, centerY);
    ctx.lineTo(centerX + dialRadius + 20, centerY);
    ctx.moveTo(centerX, centerY - dialRadius - 20);
    ctx.lineTo(centerX, centerY + dialRadius + 20);
    ctx.stroke();

    // Compass headings (N, E, S, W)
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N (0°)', centerX, centerY - dialRadius - 16);
    ctx.fillText('E (90°)', centerX + dialRadius + 24, centerY);
    ctx.fillText('S (180°)', centerX, centerY + dialRadius + 16);
    ctx.fillText('W (270°)', centerX - dialRadius - 24, centerY);

    // 2. Standing & Knocked Pegs around dial
    for (let i = 0; i < 36; i++) {
      const angleRad = ((i * 10 - 90) * Math.PI) / 180;
      const px = centerX + dialRadius * Math.cos(angleRad);
      const py = centerY + dialRadius * Math.sin(angleRad);
      const isKnocked = knockedPegs[i];

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angleRad);

      if (isKnocked) {
        // Knocked down peg (amber/red line fallen flat)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-2, 0, 10, 3);
      } else {
        // Standing wooden peg
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-2, -6, 4, 12);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(-3, -7, 6, 2);
      }
      ctx.restore();
    }

    // 3. Current Precession Oscillation Plane Line
    const precRad = ((precessionDeg - 90) * Math.PI) / 180;
    ctx.save();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX - dialRadius * Math.cos(precRad), centerY - dialRadius * Math.sin(precRad));
    ctx.lineTo(centerX + dialRadius * Math.cos(precRad), centerY + dialRadius * Math.sin(precRad));
    ctx.stroke();
    ctx.restore();

    // 4. Moving Pendulum Bob position
    // Swing displacement from center along the current precession axis
    const maxBobDisplacement = dialRadius * 0.85;
    const currentDisplacement = maxBobDisplacement * Math.sin(oscillationPhase);
    const bobX = centerX + currentDisplacement * Math.cos(precRad);
    const bobY = centerY + currentDisplacement * Math.sin(precRad);

    // Suspension wire projection
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Center pivot indicator
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Brass Bob (28kg spherical bob with pointer)
    const bobRadius = 13;
    const grad = ctx.createRadialGradient(bobX - 3, bobY - 3, 2, bobX, bobY, bobRadius);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#eab308');
    grad.addColorStop(1, '#a16207');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bottom pointer needle
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, [precessionDeg, oscillationPhase, knockedPegs]);

  const knockedCount = knockedPegs.filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      {/* Description header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'ar' ? '1. بندول فوكو ودوران كوكب الأرض (1851م)' : '1. Foucault Pendulum & Earth’s Rotation (1851)'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {lang === 'ar'
              ? 'أثبت العالم الفرنسي ليون فوكو دوران الأرض حول محورها عملياً دون النظر إلى السماء! يتأرجح البندول في مستوى ثابت في الفضاء القصوري، بينما تدور الأرض وقاعة البانثيون أسفله، مسقطة الأوتاد الخشبية تدريجياً بسبب قوة كوريوليس.'
              : 'Léon Foucault demonstrated Earth’s diurnal rotation directly in the Paris Panthéon. The pendulum swings in an inertial frame while the Earth turns underneath, precessing at an angular velocity dependent on latitude.'}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRunning((p) => !p)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-colors ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? (lang === 'ar' ? 'إيقاف' : 'Pause') : (lang === 'ar' ? 'تشغيل' : 'Play')}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Visual Dial Canvas */}
        <div className="lg:col-span-7 relative w-full h-[360px] bg-slate-50/70 rounded-xl border border-slate-200/90 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full" />

          {/* Live Precession Angle Overlay */}
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-slate-500">{lang === 'ar' ? 'زاوية الانحراف:' : 'Precession:'} </span>
            <span className="font-bold text-sky-700">{((precessionDeg % 360 + 360) % 360).toFixed(1)}°</span>
          </div>

          <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-slate-500">{lang === 'ar' ? 'الأوتاد المسقطة:' : 'Fallen Pegs:'} </span>
            <span className="font-bold text-rose-600">{knockedCount} / 36</span>
          </div>
        </div>

        {/* Parameters & Telemetry */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Key Physics Equation */}
          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/70 text-xs">
            <span className="font-semibold text-sky-900 block mb-1">
              {lang === 'ar' ? 'معادلة سرعة الدوران الزاوي للبندول:' : 'Precession Angular Velocity Law:'}
            </span>
            <div className="font-mono text-sky-950 font-bold bg-white p-2 rounded border border-sky-100 text-center text-sm">
              ω_p = 15°/h × sin(φ)
            </div>
            <div className="text-[11px] text-sky-800 mt-1.5">
              {lang === 'ar'
                ? `الزمن الدوري للدورة الكاملة: T_p = 24h / sin(|φ|) = ${isFinite(periodHours) ? periodHours.toFixed(1) + ' ساعة' : 'لا نهائي (صفر دوران)'}`
                : `Full rotation period: T_p = 24h / sin(|φ|) = ${isFinite(periodHours) ? periodHours.toFixed(1) + ' hours' : 'Infinite (no precession)'}`}
            </div>
          </div>

          {/* City Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              {lang === 'ar' ? 'اختر خط عرض / مدينة عالمية:' : 'Select Latitude / World Location:'}
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {CITY_PRESETS.map((city) => (
                <button
                  key={city.nameEn}
                  onClick={() => {
                    setParams((p) => ({ ...p, latitudeDeg: city.lat, pendulumLength: city.length }));
                    handleReset();
                  }}
                  className={`p-2 rounded-lg border text-left rtl:text-right transition-colors ${
                    Math.abs(params.latitudeDeg - city.lat) < 0.1
                      ? 'border-sky-500 bg-sky-50 text-sky-950 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                    <span className="truncate">{lang === 'ar' ? city.nameAr : city.nameEn}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    φ = {city.lat}° ({city.length}m)
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Latitude Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'خط العرض الجغرافي (φ)' : 'Geographic Latitude (φ)'}</span>
              <span className="font-mono text-sky-700 font-semibold">{params.latitudeDeg.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              step="1"
              value={params.latitudeDeg}
              onChange={(e) => setParams((p) => ({ ...p, latitudeDeg: parseFloat(e.target.value) }))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>-90° (الجنوب)</span>
              <span>0° (الاستواء)</span>
              <span>+90° (الشمال)</span>
            </div>
          </div>

          {/* Time Lapse Speed Multiplier */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'تسريع الزمن للمشاهدة السريعة' : 'Time-Lapse Acceleration'}</span>
              <span className="font-mono text-sky-700 font-semibold">{speedMultiplier}×</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {[200, 500, 1000, 3000].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={`flex-1 py-1 rounded-md transition-colors text-center ${
                    speedMultiplier === s ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
