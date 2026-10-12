import React, { useState, useEffect, useRef } from 'react';
import { PhotogateData, StopwatchState } from '../types/physics';
import { Language, translations } from '../i18n/translations';
import { Play, Pause, RotateCcw, Flag, Target, Timer } from 'lucide-react';
import { formatNum } from '../physics/engine';

interface PhotogateStopwatchProps {
  lang: Language;
  photogate: PhotogateData;
  theoreticalPeriodExact: number;
  onResetPhotogate: () => void;
  onTogglePhotogate: () => void;
}

export const PhotogateStopwatch: React.FC<PhotogateStopwatchProps> = ({
  lang,
  photogate,
  theoreticalPeriodExact,
  onResetPhotogate,
  onTogglePhotogate
}) => {
  const t = translations[lang];

  // Manual Stopwatch state
  const [stopwatch, setStopwatch] = useState<StopwatchState>({
    running: false,
    elapsedTime: 0,
    laps: []
  });

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (stopwatch.running) {
      lastTimeRef.current = performance.now();
      const update = () => {
        const now = performance.now();
        if (lastTimeRef.current) {
          const dt = (now - lastTimeRef.current) / 1000;
          setStopwatch((prev) => ({
            ...prev,
            elapsedTime: prev.elapsedTime + dt
          }));
        }
        lastTimeRef.current = now;
        animFrameRef.current = requestAnimationFrame(update);
      };
      animFrameRef.current = requestAnimationFrame(update);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [stopwatch.running]);

  const toggleStopwatch = () => {
    setStopwatch((prev) => ({ ...prev, running: !prev.running }));
  };

  const recordLap = () => {
    if (stopwatch.elapsedTime > 0) {
      setStopwatch((prev) => ({
        ...prev,
        laps: [prev.elapsedTime, ...prev.laps]
      }));
    }
  };

  const resetStopwatch = () => {
    setStopwatch({
      running: false,
      elapsedTime: 0,
      laps: []
    });
  };

  // Format stopwatch time: mm:ss.cc
  const formatStopwatchTime = (timeInSec: number): string => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    const hundredths = Math.floor((timeInSec * 100) % 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths
      .toString()
      .padStart(2, '0')}`;
  };

  // Average photogate period
  const avgPeriod =
    photogate.history.length > 0
      ? photogate.history.reduce((a, b) => a + b, 0) / photogate.history.length
      : null;

  // Percentage difference with theoretical
  const errorPercent =
    avgPeriod && theoreticalPeriodExact > 0
      ? (Math.abs(avgPeriod - theoreticalPeriodExact) / theoreticalPeriodExact) * 100
      : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 1. Laser Photogate Digital Panel */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${photogate.enabled ? (photogate.beamBroken ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500') : 'bg-slate-300'}`}></span>
              <h3 className="text-sm font-semibold text-slate-800">{t.photogateTitle}</h3>
            </div>
            <button
              onClick={onTogglePhotogate}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                photogate.enabled
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {photogate.enabled ? (lang === 'ar' ? 'مفعلة' : 'Active') : (lang === 'ar' ? 'تفعيل' : 'Enable')}
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-4">{t.photogateDesc}</p>

          {/* Primary measurement readout */}
          <div className="bg-slate-900 text-white rounded-lg p-4 font-mono text-center mb-4">
            <div className="text-[11px] text-slate-400 mb-1">{t.measuredPeriod} (T)</div>
            <div className="text-3xl font-semibold tracking-wider text-emerald-400">
              {photogate.measuredPeriod ? `${formatNum(photogate.measuredPeriod, 3)} s` : '--.--- s'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {photogate.oscillationCount} {lang === 'ar' ? 'دورات مكتشفة' : 'cycles detected'}
            </div>
          </div>

          {/* Statistics Comparison */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-slate-500 text-[11px] mb-0.5">{t.periodAverage}</div>
              <div className="font-mono font-semibold text-slate-800">
                {avgPeriod ? `${formatNum(avgPeriod, 3)} s` : '--'}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-slate-500 text-[11px] mb-0.5">{lang === 'ar' ? 'نسبة الخطأ النسبي' : 'Relative Error'}</div>
              <div className="font-mono font-semibold text-sky-700">
                {errorPercent !== null ? `${formatNum(errorPercent, 2)}%` : '--'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onResetPhotogate}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            {lang === 'ar' ? 'إعادة ضبط قياسات البوابة' : 'Reset Photogate Records'}
          </button>
        </div>
      </div>

      {/* 2. Manual Laboratory Stopwatch */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-semibold text-slate-800">{t.stopwatchTitle}</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {lang === 'ar' ? 'لقياس 10 تأرجحات مخبرياً' : 'For multi-cycle manual timing'}
            </span>
          </div>

          {/* Stopwatch Digital Display */}
          <div className="bg-slate-900 text-white rounded-lg p-4 font-mono text-center mb-4">
            <div className="text-3xl font-semibold tracking-wider text-sky-400">
              {formatStopwatchTime(stopwatch.elapsedTime)}
            </div>
          </div>

          {/* Stopwatch Control Buttons */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={toggleStopwatch}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors ${
                stopwatch.running ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              {stopwatch.running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{stopwatch.running ? t.stopStopwatch : t.startStopwatch}</span>
            </button>

            <button
              onClick={recordLap}
              disabled={!stopwatch.running}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-700"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{t.lapStopwatch}</span>
            </button>

            <button
              onClick={resetStopwatch}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
              title={t.clearStopwatch}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Laps List */}
          {stopwatch.laps.length > 0 && (
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-xs">
              {stopwatch.laps.map((lap, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-2.5 py-1 bg-slate-50 rounded text-slate-600 font-mono"
                >
                  <span>#{stopwatch.laps.length - i}</span>
                  <span className="font-semibold text-slate-800">{formatStopwatchTime(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 text-[11px] text-slate-400">
          {lang === 'ar'
            ? 'نصيحة مخبرية: قم بحساب 10 دورات واقسم الزمن على 10 لتقليل نسبة الخطأ البشري!'
            : 'Lab tip: Time 10 complete swings and divide by 10 to minimize reaction time error!'}
        </div>
      </div>
    </div>
  );
};
