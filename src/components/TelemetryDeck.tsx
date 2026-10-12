import React from 'react';
import {
  DynamicCalculations,
  EnergyBreakdown,
  PendulumDynamicState
} from '../types/physics';
import { radToDeg, formatNum } from '../physics/engine';
import { Language, translations } from '../i18n/translations';

interface TelemetryDeckProps {
  lang: Language;
  state: PendulumDynamicState;
  calculations: DynamicCalculations;
  energy: EnergyBreakdown;
}

export const TelemetryDeck: React.FC<TelemetryDeckProps> = ({
  lang,
  state,
  calculations,
  energy
}) => {
  const t = translations[lang];

  const currentDeg = radToDeg(state.theta);
  const totalE = energy.total || 0.001;
  const kineticPercent = Math.min(100, Math.max(0, (energy.kinetic / totalE) * 100));
  const potentialPercent = Math.min(100, Math.max(0, (energy.potential / totalE) * 100));

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-5">
      {/* 1. Header & Live Energy Conservation Meter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">{t.energyTitle}</h3>
          <span className="text-xs font-mono text-slate-500 font-medium">
            {formatNum(energy.total, 2)} {t.joules}
          </span>
        </div>

        {/* Stacked Energy Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-sky-500 transition-all duration-75"
            style={{ width: `${kineticPercent}%` }}
            title={`Kinetic: ${formatNum(energy.kinetic, 2)} J`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-75"
            style={{ width: `${potentialPercent}%` }}
            title={`Potential: ${formatNum(energy.potential, 2)} J`}
          />
        </div>

        {/* Energy breakdown labels */}
        <div className="flex items-center justify-between mt-2 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-sky-700">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500"></span>
            <span>{t.kineticEnergy}:</span>
            <span className="font-mono font-semibold">{formatNum(energy.kinetic, 2)} J</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
            <span>{t.potentialEnergy}:</span>
            <span className="font-mono font-semibold">{formatNum(energy.potential, 2)} J</span>
          </div>
        </div>

        {energy.dissipated > 0.01 && (
          <div className="mt-1.5 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>{t.dissipatedEnergy}:</span>
            <span className="text-rose-600 font-medium">{formatNum(energy.dissipated, 2)} J</span>
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100" />

      {/* 2. Instantaneous Physical Telemetry Grid */}
      <div>
        <h3 className="text-xs font-semibold text-slate-600 mb-3">{t.telemetryTitle}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Current Angle */}
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 mb-1">{t.currentAngle}</div>
            <div className="font-mono text-base font-semibold text-slate-800">
              {formatNum(currentDeg, 1)}°
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              {formatNum(state.theta, 2)} rad
            </div>
          </div>

          {/* Angular Velocity */}
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 mb-1">{t.angularVelocity}</div>
            <div className="font-mono text-base font-semibold text-slate-800">
              {formatNum(state.omega, 2)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">rad/s</div>
          </div>

          {/* Linear Velocity */}
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 mb-1">{t.linearVelocity}</div>
            <div className="font-mono text-base font-semibold text-sky-700">
              {formatNum(Math.abs(calculations.velocity), 2)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">م/ث (m/s)</div>
          </div>

          {/* String Tension */}
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 mb-1">{t.stringTension}</div>
            <div className="font-mono text-base font-semibold text-emerald-700">
              {formatNum(calculations.tension, 1)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">نيوتن (N)</div>
          </div>

          {/* Theoretical Period (Small-angle) */}
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 mb-1">{t.periodSmall}</div>
            <div className="font-mono text-base font-semibold text-slate-800">
              {formatNum(calculations.theoreticalPeriodSmall, 2)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">{t.seconds}</div>
          </div>

          {/* Exact Non-Linear Period */}
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 mb-1">{t.periodExact}</div>
            <div className="font-mono text-base font-semibold text-purple-700">
              {formatNum(calculations.theoreticalPeriodExact, 2)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">{t.seconds}</div>
          </div>

          {/* Frequency */}
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 mb-1">{t.frequency}</div>
            <div className="font-mono text-base font-semibold text-slate-800">
              {formatNum(calculations.frequency, 2)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">{t.hertz}</div>
          </div>

          {/* Centripetal Acceleration */}
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 mb-1">{t.centripetalAccel}</div>
            <div className="font-mono text-base font-semibold text-slate-800">
              {formatNum(calculations.centripetalAccel, 1)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">م/ث²</div>
          </div>
        </div>
      </div>
    </div>
  );
};
