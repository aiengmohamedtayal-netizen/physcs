import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  SimulationMode,
  SimplePendulumParams,
  PendulumDynamicState,
  DoublePendulumParams,
  DoublePendulumState,
  DynamicCalculations
} from '../types/physics';
import { radToDeg, degToRad } from '../physics/engine';
import { Language, translations } from '../i18n/translations';

interface PendulumCanvasProps {
  mode: SimulationMode;
  lang: Language;
  params: SimplePendulumParams;
  state: PendulumDynamicState;
  comparisonParams?: SimplePendulumParams;
  comparisonState?: PendulumDynamicState;
  doubleParams: DoublePendulumParams;
  doubleState: DoublePendulumState;
  calculations: DynamicCalculations;
  showVectors: boolean;
  showVelocity: boolean;
  showTrail: boolean;
  showProtractor: boolean;
  showRuler: boolean;
  photogateActive: boolean;
  photogateTriggered: boolean;
  isRunning: boolean;
  onDragStart: () => void;
  onDragUpdate: (newTheta: number) => void;
  onDragEnd: (releasedTheta: number) => void;
}

export const PendulumCanvas: React.FC<PendulumCanvasProps> = ({
  mode,
  lang,
  params,
  state,
  comparisonParams,
  comparisonState,
  doubleParams,
  doubleState,
  calculations,
  showVectors,
  showVelocity,
  showTrail,
  showProtractor,
  showRuler,
  photogateActive,
  photogateTriggered,
  isRunning,
  onDragStart,
  onDragUpdate,
  onDragEnd
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragAngleDeg, setDragAngleDeg] = useState(0);

  // Trails history
  const trailRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const doubleTrail1Ref = useRef<{ x: number; y: number }[]>([]);
  const doubleTrail2Ref = useRef<{ x: number; y: number }[]>([]);

  const t = translations[lang];

  // Clear trails on mode switch or reset
  useEffect(() => {
    trailRef.current = [];
    doubleTrail1Ref.current = [];
    doubleTrail2Ref.current = [];
  }, [mode, params.length]);

  // Handle Drag logic
  const getMouseAngle = useCallback((clientX: number, clientY: number): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const pivotX = canvas.width / 2;
    const pivotY = 70;

    const dx = x - pivotX;
    const dy = y - pivotY;

    // Angle theta from bottom (0 = straight down, positive = counterclockwise / to right)
    let theta = Math.atan2(dx, dy);
    // Limit to [-170 deg, +170 deg]
    const maxAngle = degToRad(170);
    if (theta > maxAngle) theta = maxAngle;
    if (theta < -maxAngle) theta = -maxAngle;
    return theta;
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === 'double') return; // Dragging double pendulum is non-trivial, allow for simple & comparison

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pivotX = canvas.width / 2;
    const pivotY = 70;
    const scale = (canvas.height - 140) / 4.0;
    const pixelLength = params.length * scale;

    const bobX = pivotX + pixelLength * Math.sin(state.theta);
    const bobY = pivotY + pixelLength * Math.cos(state.theta);

    const dist = Math.hypot(x - bobX, y - bobY);
    // Touch tolerance or mouse click within 40px of bob
    if (dist < 45) {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      onDragStart();
      const currentDeg = radToDeg(state.theta);
      setDragAngleDeg(currentDeg);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const theta = getMouseAngle(e.clientX, e.clientY);
    if (theta !== null) {
      setDragAngleDeg(radToDeg(theta));
      onDragUpdate(theta);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    const theta = getMouseAngle(e.clientX, e.clientY);
    if (theta !== null) {
      onDragEnd(theta);
    }
  };

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas based on client display
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // 1. Grid / Ruler Background if enabled
    if (showRuler) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    const pivotX = width / 2;
    const pivotY = 70;
    // Scale factor: 4.0 meters maps to roughly canvas.height - 160
    const scale = (height - 150) / 4.0;

    // 2. Ceiling support structure
    ctx.fillStyle = '#334155';
    ctx.fillRect(pivotX - 120, pivotY - 14, 240, 14);

    // Metallic screws / bolts
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(pivotX - 90, pivotY - 7, 3, 0, Math.PI * 2);
    ctx.arc(pivotX + 90, pivotY - 7, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pivot mount bracket
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(pivotX - 16, pivotY - 2);
    ctx.lineTo(pivotX + 16, pivotY - 2);
    ctx.lineTo(pivotX + 8, pivotY + 12);
    ctx.lineTo(pivotX - 8, pivotY + 12);
    ctx.closePath();
    ctx.fill();

    // 3. Protractor arc
    if (showProtractor && mode !== 'double') {
      const arcRadius = Math.min(180, scale * 1.6);
      ctx.save();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, arcRadius, degToRad(90 - 75), degToRad(90 + 75));
      ctx.stroke();

      // Degree tick marks
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let deg = -75; deg <= 75; deg += 15) {
        const rad = degToRad(deg);
        const innerR = deg % 30 === 0 ? arcRadius - 12 : arcRadius - 6;
        const outerR = arcRadius;
        const textR = arcRadius + 14;

        const x1 = pivotX + innerR * Math.sin(rad);
        const y1 = pivotY + innerR * Math.cos(rad);
        const x2 = pivotX + outerR * Math.sin(rad);
        const y2 = pivotY + outerR * Math.cos(rad);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = deg === 0 ? '#0284c7' : '#94a3b8';
        ctx.lineWidth = deg === 0 ? 2 : 1;
        ctx.stroke();

        if (deg % 30 === 0) {
          const tx = pivotX + textR * Math.sin(rad);
          const ty = pivotY + textR * Math.cos(rad);
          ctx.fillText(`${Math.abs(deg)}°`, tx, ty);
        }
      }

      // Vertical equilibrium guide line
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, height - 30);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 4. Photogate Sensor visual at bottom
    if (photogateActive && mode === 'simple') {
      const photogateY = pivotY + params.length * scale;
      const gateWidth = 46;

      ctx.save();
      // Laser posts
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(pivotX - gateWidth / 2 - 8, photogateY - 14, 8, 28);
      ctx.fillRect(pivotX + gateWidth / 2, photogateY - 14, 8, 28);

      // Optical beam
      ctx.beginPath();
      ctx.moveTo(pivotX - gateWidth / 2, photogateY);
      ctx.lineTo(pivotX + gateWidth / 2, photogateY);
      ctx.lineWidth = photogateTriggered ? 3 : 1.5;
      ctx.strokeStyle = photogateTriggered ? '#10b981' : '#ef4444';
      ctx.stroke();

      // Beam status glow
      if (photogateTriggered) {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(pivotX, photogateY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 5. Render depending on Mode
    if (mode === 'double') {
      // DOUBLE PENDULUM MODE
      const { length1: L1, length2: L2, mass1: m1, mass2: m2 } = doubleParams;
      const { theta1, theta2 } = doubleState;

      const p1Len = L1 * scale;
      const p2Len = L2 * scale;

      const x1 = pivotX + p1Len * Math.sin(theta1);
      const y1 = pivotY + p1Len * Math.cos(theta1);

      const x2 = x1 + p2Len * Math.sin(theta2);
      const y2 = y1 + p2Len * Math.cos(theta2);

      // Record trail for bob 2 (the chaotic tip)
      if (isRunning) {
        doubleTrail2Ref.current.push({ x: x2, y: y2 });
        if (doubleTrail2Ref.current.length > 250) {
          doubleTrail2Ref.current.shift();
        }
      }

      // Draw chaotic ribbon trail
      if (showTrail && doubleTrail2Ref.current.length > 1) {
        ctx.save();
        for (let i = 1; i < doubleTrail2Ref.current.length; i++) {
          const pt1 = doubleTrail2Ref.current[i - 1];
          const pt2 = doubleTrail2Ref.current[i];
          const alpha = i / doubleTrail2Ref.current.length;

          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.strokeStyle = `rgba(14, 165, 233, ${alpha * 0.8})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Rod 1
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Bob 1
      const r1 = Math.max(10, Math.min(22, 10 + m1 * 4));
      const grad1 = ctx.createRadialGradient(x1 - 3, y1 - 3, 2, x1, y1, r1);
      grad1.addColorStop(0, '#38bdf8');
      grad1.addColorStop(1, '#0369a1');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(x1, y1, r1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rod 2
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Bob 2 (Chaotic Tip)
      const r2 = Math.max(10, Math.min(22, 10 + m2 * 4));
      const grad2 = ctx.createRadialGradient(x2 - 3, y2 - 3, 2, x2, y2, r2);
      grad2.addColorStop(0, '#f59e0b');
      grad2.addColorStop(1, '#b45309');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(x2, y2, r2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

    } else {
      // SIMPLE PENDULUM OR COMPARISON MODE
      const pixelLength = params.length * scale;
      const bobX = pivotX + pixelLength * Math.sin(state.theta);
      const bobY = pivotY + pixelLength * Math.cos(state.theta);

      // Trajectory record
      if (isRunning && !isDragging) {
        trailRef.current.push({ x: bobX, y: bobY, time: Date.now() });
        if (trailRef.current.length > 140) {
          trailRef.current.shift();
        }
      }

      // Draw Trajectory Trail
      if (showTrail && trailRef.current.length > 1) {
        ctx.save();
        for (let i = 1; i < trailRef.current.length; i++) {
          const pt1 = trailRef.current[i - 1];
          const pt2 = trailRef.current[i];
          const alpha = i / trailRef.current.length;

          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 0.7})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Secondary pendulum if in comparison mode
      if (mode === 'comparison' && comparisonParams && comparisonState) {
        const compPixelLength = comparisonParams.length * scale;
        const compX = pivotX + compPixelLength * Math.sin(comparisonState.theta);
        const compY = pivotY + compPixelLength * Math.cos(comparisonState.theta);

        // String 2 (dashed ruby line)
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(compX, compY);
        ctx.stroke();

        // Bob 2
        const compRadius = Math.max(12, Math.min(26, 12 + comparisonParams.mass * 3.5));
        const compGrad = ctx.createRadialGradient(compX - 3, compY - 3, 2, compX, compY, compRadius);
        compGrad.addColorStop(0, '#fb7185');
        compGrad.addColorStop(1, '#be123c');
        ctx.fillStyle = compGrad;
        ctx.beginPath();
        ctx.arc(compX, compY, compRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // Primary String
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.stroke();

      // String highlights / texture
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Vectors visualization
      if (showVectors || showVelocity) {
        const theta = state.theta;
        const omega = state.omega;
        const v = params.length * omega;

        ctx.save();

        // 1. Tension vector T (Green arrow pointing along string toward pivot)
        if (showVectors) {
          const tensionMag = Math.min(100, calculations.tension * 4);
          const tEndX = bobX - tensionMag * Math.sin(theta);
          const tEndY = bobY - tensionMag * Math.cos(theta);

          drawVectorArrow(ctx, bobX, bobY, tEndX, tEndY, '#059669', 'T');
        }

        // 2. Gravitational force Fg (Amber arrow pointing straight down)
        if (showVectors) {
          const fgMag = Math.min(100, params.mass * params.gravity * 4);
          const fgEndX = bobX;
          const fgEndY = bobY + fgMag;

          drawVectorArrow(ctx, bobX, bobY, fgEndX, fgEndY, '#d97706', 'mg');
        }

        // 3. Velocity vector v (Blue arrow tangential to path)
        if (showVelocity) {
          const vScale = 22; // px per m/s
          const vLen = v * vScale;
          const vEndX = bobX + vLen * Math.cos(theta);
          const vEndY = bobY - vLen * Math.sin(theta);

          drawVectorArrow(ctx, bobX, bobY, vEndX, vEndY, '#0284c7', 'v');
        }

        ctx.restore();
      }

      // Primary Bob
      const bobRadius = Math.max(14, Math.min(28, 12 + params.mass * 3.5));

      // Bob shadow
      ctx.beginPath();
      ctx.arc(bobX, height - 16, Math.max(4, bobRadius * (1 - (height - 16 - bobY) / height)), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.fill();

      // Metallic Bob Body
      const bobGrad = ctx.createRadialGradient(bobX - 4, bobY - 4, 3, bobX, bobY, bobRadius);
      bobGrad.addColorStop(0, '#f8fafc');
      bobGrad.addColorStop(0.3, '#38bdf8');
      bobGrad.addColorStop(0.8, '#0284c7');
      bobGrad.addColorStop(1, '#075985');

      ctx.fillStyle = bobGrad;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bob rim & border
      ctx.strokeStyle = isDragging ? '#0284c7' : '#0369a1';
      ctx.lineWidth = isDragging ? 3 : 2;
      ctx.stroke();

      // Top loop connector
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(bobX, bobY - bobRadius, 4, 0, Math.PI * 2);
      ctx.fill();

      // Center pivot pin at top
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Dragging indicator angle arc
      if (isDragging) {
        ctx.save();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        ctx.fillStyle = '#0284c7';
        ctx.font = '600 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`θ = ${dragAngleDeg.toFixed(1)}°`, bobX, bobY + bobRadius + 22);
        ctx.restore();
      }
    }

    ctx.restore();
  }, [
    mode,
    params,
    state,
    comparisonParams,
    comparisonState,
    doubleParams,
    doubleState,
    calculations,
    showVectors,
    showVelocity,
    showTrail,
    showProtractor,
    showRuler,
    photogateActive,
    photogateTriggered,
    isRunning,
    isDragging,
    dragAngleDeg
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] lg:min-h-[540px] bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center overflow-hidden touch-none"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-full cursor-grab active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : ''}`}
      />

      {/* Floating Interactive Release Hint */}
      <div className="absolute top-3 inset-x-3 pointer-events-none flex items-center justify-between text-xs text-slate-500">
        <span className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200/80 font-medium">
          {isDragging
            ? `${t.releasingAt} ${dragAngleDeg.toFixed(1)}°`
            : mode === 'double'
              ? t.doublePendulumNote.slice(0, 52) + '...'
              : t.dragHint}
        </span>

        {/* Legend for Vectors */}
        {(showVectors || showVelocity) && mode === 'simple' && (
          <div className="hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-md border border-slate-200/80 text-[11px] font-mono">
            {showVectors && (
              <>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-0.5 bg-emerald-600 rounded-sm"></span> T ({t.stringTension})
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <span className="w-2.5 h-0.5 bg-amber-600 rounded-sm"></span> mg ({t.gravity})
                </span>
              </>
            )}
            {showVelocity && (
              <span className="flex items-center gap-1 text-sky-700 font-semibold">
                <span className="w-2.5 h-0.5 bg-sky-600 rounded-sm"></span> v ({t.linearVelocity})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Helper to draw crisp vector arrows on Canvas
 */
function drawVectorArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  label: string
) {
  const headLen = 9;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);

  if (length < 4) return;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  // Label text
  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillText(label, toX + 8 * Math.cos(angle), toY + 8 * Math.sin(angle));
}
