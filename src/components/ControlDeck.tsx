import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Volume2,
  VolumeX,
  Compass,
  Grid,
  Zap,
  Activity,
  Layers,
  ChevronDown,
  RotateCw
} from 'lucide-react';
import {
  SimulationMode,
  SimplePendulumParams,
  DoublePendulumParams,
  GravityPreset
} from '../types/physics';
import { GRAVITY_PRESETS } from '../physics/engine';
import { Language, translations } from '../i18n/translations';

interface ControlDeckProps {
  lang: Language;
  mode: SimulationMode;
  onModeChange: (mode: SimulationMode) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  params: SimplePendulumParams;
  onParamsChange: (newParams: Partial<SimplePendulumParams>) => void;
  doubleParams: DoublePendulumParams;
  onDoubleParamsChange: (newParams: Partial<DoublePendulumParams>) => void;
  currentGravityPreset: GravityPreset;
  onGravityPresetSelect: (preset: GravityPreset) => void;
  initialAngleDeg: number;
  onInitialAngleChange: (deg: number) => void;
  showVectors: boolean;
  onToggleVectors: () => void;
  showVelocity: boolean;
  onToggleVelocity: () => void;
  showTrail: boolean;
  onToggleTrail: () => void;
  showProtractor: boolean;
  onToggleProtractor: () => void;
  showRuler: boolean;
  onToggleRuler: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  photogateEnabled: boolean;
  onTogglePhotogate: () => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  lang,
  mode,
  onModeChange,
  isRunning,
  onTogglePlay,
  onStepForward,
  onReset,
  playbackSpeed,
  onSpeedChange,
  params,
  onParamsChange,
  doubleParams,
  onDoubleParamsChange,
  currentGravityPreset,
  onGravityPresetSelect,
  initialAngleDeg,
  onInitialAngleChange,
  showVectors,
  onToggleVectors,
  showVelocity,
  onToggleVelocity,
  showTrail,
  onToggleTrail,
  showProtractor,
  onToggleProtractor,
  showRuler,
  onToggleRuler,
  isMuted,
  onToggleMute,
  photogateEnabled,
  onTogglePhotogate
}) => {
  const t = translations[lang];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-6">
      {/* 1. Playback Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Main Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors text-white ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? t.pause : t.play}</span>
          </button>

          {/* Step Forward */}
          <button
            onClick={onStepForward}
            disabled={isRunning}
            title={t.step}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <StepForward className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            title={t.reset}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            title={t.soundToggle}
            className={`p-2.5 rounded-lg border transition-colors ${
              isMuted
                ? 'border-slate-200 text-slate-400 hover:bg-slate-50'
                : 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Speed Selector Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          {[0.25, 0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => onSpeedChange(spd)}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                playbackSpeed === spd
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {spd}×
            </button>
          ))}
        </div>
      </div>

      {/* 2. Simulation Modes Segmented Control */}
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-2">
          {lang === 'ar' ? 'نمط المحاكاة الفيزيائية' : 'Simulation Mode'}
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => onModeChange('simple')}
            className={`py-2 px-3 rounded-md transition-colors text-center whitespace-nowrap ${
              mode === 'simple'
                ? 'bg-white text-sky-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.modeSimple}
          </button>
          <button
            onClick={() => onModeChange('double')}
            className={`py-2 px-3 rounded-md transition-colors text-center whitespace-nowrap ${
              mode === 'double'
                ? 'bg-white text-sky-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.modeDouble}
          </button>
          <button
            onClick={() => onModeChange('comparison')}
            className={`py-2 px-3 rounded-md transition-colors text-center whitespace-nowrap ${
              mode === 'comparison'
                ? 'bg-white text-sky-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.modeComparison}
          </button>
        </div>
      </div>

      {/* 3. Parameter Controls */}
      <div className="space-y-4">
        {mode === 'double' ? (
          /* Double Pendulum Parameters */
          <div className="space-y-4">
            {/* L1 and L2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                  <span>{t.length1}</span>
                  <span className="font-mono text-sky-700 font-semibold">{doubleParams.length1.toFixed(2)} {t.meters}</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.0"
                  step="0.05"
                  value={doubleParams.length1}
                  onChange={(e) => onDoubleParamsChange({ length1: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                  <span>{t.length2}</span>
                  <span className="font-mono text-amber-700 font-semibold">{doubleParams.length2.toFixed(2)} {t.meters}</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.0"
                  step="0.05"
                  value={doubleParams.length2}
                  onChange={(e) => onDoubleParamsChange({ length2: parseFloat(e.target.value) })}
                  className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* m1 and m2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                  <span>{t.mass1}</span>
                  <span className="font-mono text-sky-700 font-semibold">{doubleParams.mass1.toFixed(2)} {t.kilograms}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={doubleParams.mass1}
                  onChange={(e) => onDoubleParamsChange({ mass1: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                  <span>{t.mass2}</span>
                  <span className="font-mono text-amber-700 font-semibold">{doubleParams.mass2.toFixed(2)} {t.kilograms}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={doubleParams.mass2}
                  onChange={(e) => onDoubleParamsChange({ mass2: parseFloat(e.target.value) })}
                  className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Simple Pendulum Parameters */
          <div className="space-y-4">
            {/* Length (L) Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                <span>{t.length}</span>
                <span className="font-mono text-sky-700 font-semibold">{params.length.toFixed(2)} {t.meters}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.5"
                step="0.05"
                value={params.length}
                onChange={(e) => onParamsChange({ length: parseFloat(e.target.value) })}
                className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0.20 م</span>
                <span>1.00 م</span>
                <span>2.00 م</span>
                <span>3.50 م</span>
              </div>
            </div>

            {/* Mass (m) Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                <span>{t.mass}</span>
                <span className="font-mono text-sky-700 font-semibold">{params.mass.toFixed(2)} {t.kilograms}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={params.mass}
                onChange={(e) => onParamsChange({ mass: parseFloat(e.target.value) })}
                className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0.10 كجم</span>
                <span>1.00 كجم</span>
                <span>2.50 كجم</span>
                <span>5.00 كجم</span>
              </div>
            </div>

            {/* Initial Release Angle Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                <span>{t.initialAngle}</span>
                <span className="font-mono text-sky-700 font-semibold">{initialAngleDeg.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="-170"
                max="170"
                step="1"
                value={initialAngleDeg}
                onChange={(e) => onInitialAngleChange(parseFloat(e.target.value))}
                className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>-170°</span>
                <span>-90°</span>
                <span>0°</span>
                <span>+90°</span>
                <span>+170°</span>
              </div>
            </div>

            {/* Air Damping / Friction */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                <span>{t.damping}</span>
                <span className="font-mono text-sky-700 font-semibold">{params.damping.toFixed(3)} N·s/m</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.30"
                step="0.005"
                value={params.damping}
                onChange={(e) => onParamsChange({ damping: parseFloat(e.target.value) })}
                className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>{lang === 'ar' ? 'فراغ مثالي (0)' : 'Vacuum (0)'}</span>
                <span>{lang === 'ar' ? 'هواء خفيف' : 'Light air'}</span>
                <span>{lang === 'ar' ? 'تخميد عالي' : 'High drag'}</span>
              </div>
            </div>

            {/* Periodic Driving Force (Forced Resonance) Accordion/Inputs */}
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg">
              <div className="flex items-center justify-between text-xs font-medium text-slate-800 mb-2">
                <span>{t.drivingForce} & {t.drivingFrequency}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {params.drivingForce > 0 ? `${params.drivingForce.toFixed(1)} N @ ${params.drivingFrequency.toFixed(2)} rad/s` : (lang === 'ar' ? 'معطل' : 'Off')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">{t.drivingForce}</label>
                  <input
                    type="range"
                    min="0"
                    max="3.0"
                    step="0.1"
                    value={params.drivingForce}
                    onChange={(e) => onParamsChange({ drivingForce: parseFloat(e.target.value) })}
                    className="w-full accent-sky-600 h-1 bg-slate-200 rounded-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">{t.drivingFrequency}</label>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={params.drivingFrequency}
                    onChange={(e) => onParamsChange({ drivingFrequency: parseFloat(e.target.value) })}
                    className="w-full accent-sky-600 h-1 bg-slate-200 rounded-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Gravity Presets Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-2">{t.gravityPresets}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GRAVITY_PRESETS.map((p) => {
              const active = currentGravityPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onGravityPresetSelect(p.id)}
                  className={`flex flex-col text-left rtl:text-right p-2 rounded-lg border text-xs transition-colors ${
                    active
                      ? 'border-sky-500 bg-sky-50/70 text-sky-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{lang === 'ar' ? p.nameAr : p.nameEn}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.iconColor }}></span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 mt-0.5">{p.value.toFixed(2)} م/ث²</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Visual Overlays Toolbar */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-2">
            {lang === 'ar' ? 'أدوات العرض والقياس البصري' : 'Visual Measurement Tools'}
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={onToggleVectors}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showVectors ? 'bg-sky-50 border-sky-300 text-sky-800 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t.showVectors}</span>
            </button>

            <button
              onClick={onToggleVelocity}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showVelocity ? 'bg-sky-50 border-sky-300 text-sky-800 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{t.showVelocity}</span>
            </button>

            <button
              onClick={onToggleTrail}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showTrail ? 'bg-sky-50 border-sky-300 text-sky-800 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.showTrail}</span>
            </button>

            <button
              onClick={onToggleProtractor}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showProtractor ? 'bg-sky-50 border-sky-300 text-sky-800 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.showProtractor}</span>
            </button>

            <button
              onClick={onToggleRuler}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showRuler ? 'bg-sky-50 border-sky-300 text-sky-800 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{t.showRuler}</span>
            </button>

            <button
              onClick={onTogglePhotogate}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                photogateEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${photogateEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              <span>{t.photogateTitle}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
