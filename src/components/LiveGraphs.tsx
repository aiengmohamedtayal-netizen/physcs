import React, { useRef, useEffect, useState } from 'react';
import { DataPoint } from '../types/physics';
import { Language, translations } from '../i18n/translations';
import { Download } from 'lucide-react';

interface LiveGraphsProps {
  lang: Language;
  history: DataPoint[];
  onClearHistory: () => void;
  onExportCSV: () => void;
}

type GraphTab = 'angle' | 'velocity' | 'phase' | 'energy';

export const LiveGraphs: React.FC<LiveGraphsProps> = ({
  lang,
  history,
  onClearHistory,
  onExportCSV
}) => {
  const [activeTab, setActiveTab] = useState<GraphTab>('angle');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const t = translations[lang];

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

    const padLeft = 54;
    const padRight = 20;
    const padTop = 24;
    const padBottom = 32;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    if (history.length < 2) {
      // Empty state prompt
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px "Tajawal", "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        lang === 'ar' ? 'قم بتشغيل المحاكاة لرسم المنحنيات البيانية لحظياً...' : 'Run the simulation to record live graph data...',
        width / 2,
        height / 2
      );
      ctx.restore();
      return;
    }

    // Gridlines background
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padTop + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const x = padLeft + (plotW / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();
    }

    // Recent time window (last 200 data points)
    const points = history.slice(-250);

    if (activeTab === 'angle') {
      // 1. Angle theta(t) vs time
      let maxDeg = 10;
      points.forEach((p) => {
        const deg = Math.abs(p.theta);
        if (deg > maxDeg) maxDeg = deg;
      });
      maxDeg = Math.ceil(maxDeg / 10) * 10 || 10;

      // Zero axis
      const zeroY = padTop + plotH / 2;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padLeft, zeroY);
      ctx.lineTo(width - padRight, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Y-axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`+${maxDeg}°`, padLeft - 6, padTop + 10);
      ctx.fillText(`0°`, padLeft - 6, zeroY + 3);
      ctx.fillText(`-${maxDeg}°`, padLeft - 6, padTop + plotH);

      // Plot curve
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = padLeft + (idx / (points.length - 1)) * plotW;
        const normY = p.theta / maxDeg; // [-1, 1]
        const y = zeroY - normY * (plotH / 2);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

    } else if (activeTab === 'velocity') {
      // 2. Angular velocity omega(t) vs time
      let maxOmega = 1;
      points.forEach((p) => {
        const w = Math.abs(p.omega);
        if (w > maxOmega) maxOmega = w;
      });
      maxOmega = Math.ceil(maxOmega * 1.2) || 1;

      const zeroY = padTop + plotH / 2;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padLeft, zeroY);
      ctx.lineTo(width - padRight, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Y-axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`+${maxOmega.toFixed(1)}`, padLeft - 6, padTop + 10);
      ctx.fillText(`0`, padLeft - 6, zeroY + 3);
      ctx.fillText(`-${maxOmega.toFixed(1)}`, padLeft - 6, padTop + plotH);

      // Plot curve
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = padLeft + (idx / (points.length - 1)) * plotW;
        const normY = p.omega / maxOmega;
        const y = zeroY - normY * (plotH / 2);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

    } else if (activeTab === 'phase') {
      // 3. Phase Space (omega vs theta)
      let maxDeg = 15;
      let maxOmega = 1;
      points.forEach((p) => {
        const d = Math.abs(p.theta);
        const w = Math.abs(p.omega);
        if (d > maxDeg) maxDeg = d;
        if (w > maxOmega) maxOmega = w;
      });
      maxDeg = Math.ceil(maxDeg / 10) * 10;
      maxOmega = Math.ceil(maxOmega * 1.2);

      const centerX = padLeft + plotW / 2;
      const centerY = padTop + plotH / 2;

      // Crosshairs at (0, 0)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padLeft, centerY);
      ctx.lineTo(width - padRight, centerY);
      ctx.moveTo(centerX, padTop);
      ctx.lineTo(centerX, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('θ (°)', width - padRight - 8, centerY - 6);
      ctx.fillText('ω (rad/s)', centerX, padTop + 12);

      // Plot Phase Space loop with gradient color
      ctx.save();
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const x1 = centerX + (p1.theta / maxDeg) * (plotW / 2);
        const y1 = centerY - (p1.omega / maxOmega) * (plotH / 2);
        const x2 = centerX + (p2.theta / maxDeg) * (plotW / 2);
        const y2 = centerY - (p2.omega / maxOmega) * (plotH / 2);

        const alpha = 0.3 + 0.7 * (i / points.length);
        ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

    } else if (activeTab === 'energy') {
      // 4. Energy vs Time
      let maxE = 0.1;
      points.forEach((p) => {
        if (p.totalEnergy > maxE) maxE = p.totalEnergy;
      });
      maxE = maxE * 1.15;

      // Y-axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${maxE.toFixed(1)} J`, padLeft - 6, padTop + 10);
      ctx.fillText(`0 J`, padLeft - 6, padTop + plotH);

      // Total Energy Line (Violet)
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = padLeft + (idx / (points.length - 1)) * plotW;
        const y = padTop + plotH - (p.totalEnergy / maxE) * plotH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Kinetic Energy (Sky blue)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = padLeft + (idx / (points.length - 1)) * plotW;
        const y = padTop + plotH - (p.kineticEnergy / maxE) * plotH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Potential Energy (Amber)
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = padLeft + (idx / (points.length - 1)) * plotW;
        const y = padTop + plotH - (p.potentialEnergy / maxE) * plotH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    ctx.restore();
  }, [history, activeTab, lang]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Segmented graph tab buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('angle')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'angle' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.graphAngle}
          </button>
          <button
            onClick={() => setActiveTab('velocity')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'velocity' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.graphVelocity}
          </button>
          <button
            onClick={() => setActiveTab('phase')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'phase' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.graphPhase}
          </button>
          <button
            onClick={() => setActiveTab('energy')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'energy' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.graphEnergy}
          </button>
        </div>

        {/* Clear & Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors px-2 py-1"
          >
            {lang === 'ar' ? 'مسح الرسم' : 'Clear Graph'}
          </button>
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCSV}</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full h-[220px] bg-slate-50/50 rounded-lg border border-slate-100 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Graph Legend / Explanation */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium pt-1">
        {activeTab === 'energy' ? (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sky-700">
              <span className="w-2.5 h-0.5 bg-sky-600 rounded-sm"></span> {t.kineticEnergy} (Ek)
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-0.5 bg-amber-600 rounded-sm"></span> {t.potentialEnergy} (Ep)
            </span>
            <span className="flex items-center gap-1.5 text-purple-700">
              <span className="w-2.5 h-0.5 border-t border-purple-600 border-dashed"></span> {t.totalEnergy} (Etot)
            </span>
          </div>
        ) : activeTab === 'phase' ? (
          <div>
            <span>{lang === 'ar' ? 'مسار مغلق = حركة توافقية دورية غير مخمدة · حلزون للداخل = تخميد' : 'Closed loop = undamped periodic motion · Inward spiral = damping dissipation'}</span>
          </div>
        ) : (
          <div>
            <span>{lang === 'ar' ? 'تتبع زمني متزامن بدقة خوارزمية رونج-كوتا 4' : 'Continuous time tracking via Runge-Kutta 4th Order'}</span>
          </div>
        )}

        <div className="font-mono text-[11px] text-slate-400">
          {history.length} {lang === 'ar' ? 'نقطة قياس' : 'data points'}
        </div>
      </div>
    </div>
  );
};
