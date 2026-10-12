import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../../i18n/translations';
import { Play, Pause, RotateCcw, Share2, Layers } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface NewtonsCradleSimProps {
  lang: Language;
}

export const NewtonsCradleSim: React.FC<NewtonsCradleSimProps> = ({ lang }) => {
  const [liftedCount, setLiftedCount] = useState<number>(1);
  const [initialAngleDeg, setInitialAngleDeg] = useState<number>(45);
  const [elasticity, setElasticity] = useState<number>(0.995);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // 5 balls state: angle and angular velocity
  // Indices 0, 1, 2, 3, 4
  const [angles, setAngles] = useState<number[]>([
    -(45 * Math.PI) / 180, // ball 0 lifted
    0,
    0,
    0,
    0
  ]);
  const [omegas, setOmegas] = useState<number[]>([0, 0, 0, 0, 0]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const anglesRef = useRef<number[]>([-(45 * Math.PI) / 180, 0, 0, 0, 0]);
  const omegasRef = useRef<number[]>([0, 0, 0, 0, 0]);
  const lastCollisionTimeRef = useRef<number>(0);

  // Reset to initial setup
  const handleReset = (count: number = liftedCount, angleDeg: number = initialAngleDeg) => {
    const rad = -(angleDeg * Math.PI) / 180;
    const newAngles = [0, 0, 0, 0, 0];
    const newOmegas = [0, 0, 0, 0, 0];

    for (let i = 0; i < count; i++) {
      newAngles[i] = rad;
    }

    anglesRef.current = [...newAngles];
    omegasRef.current = [...newOmegas];
    setAngles([...newAngles]);
    setOmegas([...newOmegas]);
  };

  useEffect(() => {
    handleReset(liftedCount, initialAngleDeg);
  }, [liftedCount, initialAngleDeg]);

  // Main physics animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.03, (now - lastTime) / 1000);
      lastTime = now;

      if (isRunning) {
        const g = 9.807;
        const L = 0.35; // 35cm string length
        const substeps = 8;
        const subDt = dt / substeps;

        const curAngles = [...anglesRef.current];
        const curOmegas = [...omegasRef.current];

        for (let step = 0; step < substeps; step++) {
          // 1. Independent pendulum swinging: theta'' = -(g/L) sin(theta) - damping
          for (let i = 0; i < 5; i++) {
            const alpha = -(g / L) * Math.sin(curAngles[i]) - 0.05 * curOmegas[i];
            curOmegas[i] += alpha * subDt;
            curAngles[i] += curOmegas[i] * subDt;
          }

          // 2. Collision resolution between adjacent balls
          // Ball i collides with ball i+1 if angle[i] > angle[i+1]
          let hadCollision = false;
          for (let i = 0; i < 4; i++) {
            if (curAngles[i] > curAngles[i + 1]) {
              // Overlap detected: elastic momentum & kinetic energy exchange
              curAngles[i] = (curAngles[i] + curAngles[i + 1]) / 2;
              curAngles[i + 1] = curAngles[i];

              const v1 = curOmegas[i];
              const v2 = curOmegas[i + 1];

              // Elastic collision between equal masses: velocities swap!
              curOmegas[i] = v2 * elasticity;
              curOmegas[i + 1] = v1 * elasticity;

              hadCollision = true;
            }
          }

          if (hadCollision && now - lastCollisionTimeRef.current > 70) {
            lastCollisionTimeRef.current = now;
            soundManager.playPendulumTick(1100);
          }
        }

        anglesRef.current = curAngles;
        omegasRef.current = curOmegas;
        setAngles([...curAngles]);
        setOmegas([...curOmegas]);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, elasticity]);

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

    const ballRadius = 18;
    const stringLength = 170;
    const ballSpacing = ballRadius * 2;
    const startX = width / 2 - 2 * ballSpacing;
    const pivotY = 55;

    // Top Frame Beam
    ctx.fillStyle = '#334155';
    ctx.fillRect(startX - 50, pivotY - 14, 4 * ballSpacing + 100, 14);

    // Frame Chrome Accents
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(startX - 48, pivotY - 12, 4 * ballSpacing + 96, 2);

    // Render 5 balls
    for (let i = 0; i < 5; i++) {
      const px = startX + i * ballSpacing;
      const angle = angles[i] || 0;

      const bx = px + stringLength * Math.sin(angle);
      const by = pivotY + stringLength * Math.cos(angle);

      // Bifilar V-shaped suspension strings
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(px - 10, pivotY);
      ctx.lineTo(bx, by);
      ctx.moveTo(px + 10, pivotY);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Top suspension bolts
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(px - 10, pivotY, 2.5, 0, Math.PI * 2);
      ctx.arc(px + 10, pivotY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Ball Shadow
      ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.beginPath();
      ctx.arc(bx, height - 20, Math.max(3, ballRadius * 0.7), 0, Math.PI * 2);
      ctx.fill();

      // Polished Chrome Sphere
      const grad = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, ballRadius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#e2e8f0');
      grad.addColorStop(0.7, '#94a3b8');
      grad.addColorStop(1, '#475569');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Specular highlight gleam
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(bx - 5, by - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [angles]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'ar' ? '2. بندول نيوتن وحفظ كمية الحركة والطاقة (Newton’s Cradle)' : '2. Newton’s Cradle & Momentum Conservation'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {lang === 'ar'
              ? 'تطبيق حي لقانوني حفظ كمية الحركة (Σp = ثابت) وحفظ طاقة الحركة (ΣEk = ثابت) في التصادمات المرنة التامة. عند إفلات كرتين، تخرج كرتان متطابقتان من الجانب الآخر بدقة بالغة!'
              : 'Demonstrates conservation of linear momentum and kinetic energy through perfectly elastic collisions. Lifting and releasing N balls always ejects exactly N balls on the opposite side.'}
          </p>
        </div>

        {/* Controls */}
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
            onClick={() => handleReset()}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Canvas */}
        <div className="lg:col-span-7 relative w-full h-[320px] bg-slate-50/70 rounded-xl border border-slate-200/90 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Parameters */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Key Laws */}
          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/70 text-xs space-y-2">
            <span className="font-semibold text-sky-900 block">
              {lang === 'ar' ? 'القوانين الفيزيائية الحاكمة للتصادم:' : 'Governing Conservation Laws:'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-center font-mono font-bold text-xs text-sky-950">
              <div className="bg-white p-2 rounded border border-sky-100">
                m₁v₁ = m₂v₂ (حفظ الزخم)
              </div>
              <div className="bg-white p-2 rounded border border-sky-100">
                ½m₁v₁² = ½m₂v₂² (حفظ الطاقة)
              </div>
            </div>
          </div>

          {/* Lifted Balls Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              {lang === 'ar' ? 'عدد الكرات المرفوعة للإطلاق:' : 'Number of Lifted Balls to Release:'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setLiftedCount(count);
                    handleReset(count, initialAngleDeg);
                  }}
                  className={`py-2 rounded-lg border text-xs font-semibold transition-colors text-center ${
                    liftedCount === count
                      ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {count} {lang === 'ar' ? (count === 1 ? 'كرة' : count === 2 ? 'كرتان' : 'كرات') : (count === 1 ? 'Ball' : 'Balls')}
                </button>
              ))}
            </div>
          </div>

          {/* Release Angle Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'سعة زاوية الرفع الابتدائية' : 'Initial Lift Angle'}</span>
              <span className="font-mono text-sky-700 font-semibold">{initialAngleDeg}°</span>
            </div>
            <input
              type="range"
              min="15"
              max="65"
              step="1"
              value={initialAngleDeg}
              onChange={(e) => {
                const a = parseInt(e.target.value);
                setInitialAngleDeg(a);
                handleReset(liftedCount, a);
              }}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Restitution (Elasticity) */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'معامل المرونة (e)' : 'Restitution Coefficient (e)'}</span>
              <span className="font-mono text-sky-700 font-semibold">{elasticity.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.92"
              max="1.0"
              step="0.005"
              value={elasticity}
              onChange={(e) => setElasticity(parseFloat(e.target.value))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{lang === 'ar' ? 'تصادم غير مرن نسبياً' : 'Inelastic'}</span>
              <span>{lang === 'ar' ? 'مرن تماماً (مثالي)' : '1.0 (Ideal)'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
