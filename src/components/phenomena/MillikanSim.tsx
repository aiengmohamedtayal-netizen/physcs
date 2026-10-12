import React, { useState, useEffect, useRef } from 'react';
import { MillikanParams } from '../../types/phenomena';
import { Language } from '../../i18n/translations';
import { Target, Zap, Crosshair, RotateCcw } from 'lucide-react';

interface MillikanSimProps {
  lang: Language;
}

export const MillikanSim: React.FC<MillikanSimProps> = ({ lang }) => {
  const [params, setParams] = useState<MillikanParams>({
    voltageV: 150,
    plateSeparationMm: 5.0, // d = 5mm
    dropRadiusUm: 1.2,      // r = 1.2 micrometers
    excessElectrons: 3,     // n = 3 electrons (q = 3e)
    oilDensityKgM3: 885     // density of oil kg/m^3
  });

  const [dropPosY, setDropPosY] = useState<number>(160); // px in chamber
  const [dropVelocity, setDropVelocity] = useState<number>(0);
  const [isIonizing, setIsIonizing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Elementary charge constant: e = 1.602e-19 C
  const e_charge = 1.602176634e-19;
  const g = 9.807;
  const airViscosity = 1.81e-5; // Pa*s

  // Physical calculations:
  // Droplet volume & mass
  const r_m = params.dropRadiusUm * 1e-6;
  const volume = (4 / 3) * Math.PI * Math.pow(r_m, 3);
  const massKg = volume * params.oilDensityKgM3;
  const gravityForceN = massKg * g;

  // Total droplet charge q = n * e
  const totalChargeC = params.excessElectrons * e_charge;

  // Electric field E = V / d
  const d_m = params.plateSeparationMm * 1e-3;
  const electricFieldV_m = d_m > 0 ? params.voltageV / d_m : 0;
  const electricForceN = totalChargeC * electricFieldV_m;

  // Equilibrium balance voltage where Fe = Fg: V_eq = (m * g * d) / q
  const balanceVoltageV = totalChargeC > 0 ? (massKg * g * d_m) / totalChargeC : 0;

  // Stokes Terminal velocity: v = (Fe - Fg) / (6 * pi * eta * r)
  const netForceN = electricForceN - gravityForceN;
  const stokesFriction = 6 * Math.PI * airViscosity * r_m;
  const terminalVelocityMmPerSec = (netForceN / stokesFriction) * 1e3; // mm/s

  // Physics animation loop for droplet movement
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      // Update position Y (pixels). Screen top is plate (+), bottom is plate (-)
      // If terminalVelocity > 0 (upward), droplet moves towards top (smaller Y)
      // If terminalVelocity < 0 (downward), droplet moves towards bottom (larger Y)
      setDropPosY((prev) => {
        const pixelSpeed = terminalVelocityMmPerSec * 45; // scale mm/s to px/s
        let nextY = prev - pixelSpeed * dt;

        // Bound within plates (80 to 240)
        if (nextY < 80) nextY = 80;
        if (nextY > 240) nextY = 240;
        return nextY;
      });

      setDropVelocity(terminalVelocityMmPerSec);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [terminalVelocityMmPerSec]);

  // Ionize droplet with X-Ray radiation to change charge n
  const handleIonize = () => {
    setIsIonizing(true);
    setTimeout(() => {
      // Pick random number of excess electrons between 1 and 6
      const randomN = Math.floor(Math.random() * 5) + 1;
      setParams((p) => ({ ...p, excessElectrons: randomN }));
      setIsIonizing(false);
    }, 400);
  };

  // Canvas Drawing (Microscope reticle chamber view)
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
    const plateWidth = width - 120;

    // 1. Top Positive Capacitor Plate (+)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(60, 60, plateWidth, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`+ + + Top Plate (+) + + +`, centerX, 71);

    // 2. Bottom Negative Capacitor Plate (-)
    ctx.fillStyle = '#475569';
    ctx.fillRect(60, 245, plateWidth, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`- - - Bottom Plate (-) - - -`, centerX, 256);

    // 3. Microscope Reticle Viewfinder Circle
    const circleRadius = 85;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, 160, circleRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crosshair lines
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(centerX - circleRadius, 160);
    ctx.lineTo(centerX + circleRadius, 160);
    ctx.moveTo(centerX, 160 - circleRadius);
    ctx.lineTo(centerX, 160 + circleRadius);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 4. Ionizing X-Ray beam effect
    if (isIonizing) {
      ctx.save();
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.fillRect(60, 75, plateWidth, 170);
      ctx.restore();
    }

    // 5. Charged Oil Droplet
    const dropX = centerX;
    const dropY = dropPosY;
    const rPx = Math.max(4, Math.min(10, params.dropRadiusUm * 4.5));

    // Droplet amber body
    const grad = ctx.createRadialGradient(dropX - 2, dropY - 2, 1, dropX, dropY, rPx);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.6, '#f59e0b');
    grad.addColorStop(1, '#b45309');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(dropX, dropY, rPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Minus charges label on droplet
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`-${params.excessElectrons}e`, dropX, dropY + 3);

    // 6. Force vector arrows
    // Electric force Fe (Upward arrow in green)
    if (electricForceN > 0) {
      const feLen = Math.min(45, (electricForceN / gravityForceN) * 20);
      drawVectorArrow(ctx, dropX + 16, dropY, dropX + 16, dropY - feLen, '#059669', 'Fe');
    }

    // Gravity force Fg (Downward arrow in amber)
    drawVectorArrow(ctx, dropX - 16, dropY, dropX - 16, dropY + 20, '#d97706', 'Fg');

    ctx.restore();
  }, [params, dropPosY, isIonizing, electricForceN, gravityForceN]);

  const isBalanced = Math.abs(dropVelocity) < 0.05;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'ar' ? '5. تجربة قطرة الزيت لميليكان وتكميم الشحنة (1909م)' : '5. Millikan’s Oil Drop Experiment (1909)'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {lang === 'ar'
              ? 'أثبت روبرت ميليكان أن الشحنة الكهربائية ليست متصلة بل "مكممة" على شكل حزم دقيقة تساوي شحنة الإلكترون (e). اضبط الجهد V لموازنة قطرة الزيت في المجهر واكتشف مضاعفات الشحنة الأولية!'
              : 'Robert Millikan proved electric charge is quantized in integer multiples of fundamental charge e = 1.602 × 10⁻¹⁹ C by balancing charged oil droplets against gravity with an electric field.'}
          </p>
        </div>

        {/* Ionize Button */}
        <button
          onClick={handleIonize}
          disabled={isIonizing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors shrink-0 shadow-xs"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'إطلاق أشعة سينية لتغيير الشحنة (تأيين)' : 'X-Ray Ionize Drop'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Microscope Canvas */}
        <div className="lg:col-span-7 relative w-full h-[320px] bg-slate-50/70 rounded-xl border border-slate-200/90 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full" />

          {/* Balance Status */}
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            {isBalanced ? (
              <span className="text-emerald-700 font-bold">
                {lang === 'ar' ? '● اتزان تام: القطرة معلقة في الهواء (Fe = Fg)' : '● Stationary Balance (Fe = Fg)'}
              </span>
            ) : dropVelocity > 0 ? (
              <span className="text-sky-700 font-bold">
                {lang === 'ar' ? '▲ تصاعد لأعلى (Fe > Fg)' : '▲ Drifting Up (Fe > Fg)'}
              </span>
            ) : (
              <span className="text-amber-700 font-bold">
                {lang === 'ar' ? '▼ سقوط لأسفل (Fg > Fe)' : '▼ Drifting Down (Fg > Fe)'}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Key Formula */}
          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/70 text-xs space-y-1.5">
            <span className="font-semibold text-sky-900 block">
              {lang === 'ar' ? 'شرط الاتزان وتكميم الشحنة:' : 'Quantization & Balance Equation:'}
            </span>
            <div className="font-mono text-center font-bold text-sm bg-white p-2 rounded border border-sky-100 text-sky-950">
              q = n × e = (m × g × d) / V_eq
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-1">
              <div>q = <strong>{params.excessElectrons} × e</strong></div>
              <div>V_balance: <strong className="text-emerald-700">{balanceVoltageV.toFixed(1)} V</strong></div>
              <div>e = <strong>1.602 × 10⁻¹⁹ C</strong></div>
              <div>q_total: <strong>{(params.excessElectrons * 1.602).toFixed(3)} × 10⁻¹⁹ C</strong></div>
            </div>
          </div>

          {/* Voltage Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'جهد اللوحين الكهربائيين (V)' : 'Plate Voltage (V)'}</span>
              <span className="font-mono text-sky-700 font-semibold">{params.voltageV.toFixed(1)} V</span>
            </div>
            <input
              type="range"
              min="0"
              max="400"
              step="1"
              value={params.voltageV}
              onChange={(e) => setParams((p) => ({ ...p, voltageV: parseFloat(e.target.value) }))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 V</span>
              <button
                onClick={() => setParams((p) => ({ ...p, voltageV: balanceVoltageV }))}
                className="text-sky-600 hover:underline font-semibold"
              >
                {lang === 'ar' ? `ضبط تلقائي لجهد الاتزان (${balanceVoltageV.toFixed(1)} V)` : `Auto-balance (${balanceVoltageV.toFixed(1)} V)`}
              </button>
              <span>400 V</span>
            </div>
          </div>

          {/* Number of Excess Electrons */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'عدد الإلكترونات الفائضة على القطرة (n)' : 'Excess Electrons on Drop (n)'}</span>
              <span className="font-mono text-amber-700 font-semibold">n = {params.excessElectrons}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setParams((p) => ({ ...p, excessElectrons: n }))}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors text-center ${
                    params.excessElectrons === n
                      ? 'border-sky-500 bg-sky-50 text-sky-950 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {n}e
                </button>
              ))}
            </div>
          </div>

          {/* Droplet Radius Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
              <span>{lang === 'ar' ? 'نصف قطر قطرة الزيت (r)' : 'Drop Radius (r)'}</span>
              <span className="font-mono text-slate-700 font-semibold">{params.dropRadiusUm.toFixed(2)} μm</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.2"
              step="0.05"
              value={params.dropRadiusUm}
              onChange={(e) => setParams((p) => ({ ...p, dropRadiusUm: parseFloat(e.target.value) }))}
              className="w-full accent-slate-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function drawVectorArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  label: string
) {
  const headLen = 7;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);
  if (length < 3) return;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  ctx.font = '600 10px "JetBrains Mono", monospace';
  ctx.fillText(label, toX + 6 * Math.cos(angle), toY + 6 * Math.sin(angle));
}
