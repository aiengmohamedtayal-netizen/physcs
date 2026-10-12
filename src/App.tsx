/**
 * Main Application Component for Interactive Physics Pendulum Lab
 * Full-featured physics laboratory simulation with RK4 integration, live graphs, photogate, and guided experiments.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SimulationMode,
  SimplePendulumParams,
  PendulumDynamicState,
  DoublePendulumParams,
  DoublePendulumState,
  GravityPreset,
  DataPoint,
  PhotogateData,
  DynamicCalculations,
  EnergyBreakdown,
  LabExperiment
} from './types/physics';
import {
  stepSimplePendulumRK4,
  stepDoublePendulumRK4,
  calculateEnergy,
  calculateDynamicValues,
  GRAVITY_PRESETS,
  radToDeg,
  degToRad,
  formatNum
} from './physics/engine';
import { Language, translations } from './i18n/translations';
import { TopNav } from './components/TopNav';
import { PendulumCanvas } from './components/PendulumCanvas';
import { ControlDeck } from './components/ControlDeck';
import { TelemetryDeck } from './components/TelemetryDeck';
import { LiveGraphs } from './components/LiveGraphs';
import { PhotogateStopwatch } from './components/PhotogateStopwatch';
import { LabExperiments } from './components/LabExperiments';
import { PhysicsFormulasModal } from './components/PhysicsFormulasModal';
import { soundManager } from './utils/sound';
import { PhenomenaHub } from './components/phenomena/PhenomenaHub';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [activeSection, setActiveSection] = useState<string>('simulation');
  const [showFormulasModal, setShowFormulasModal] = useState<boolean>(false);

  // Simulation mode
  const [mode, setMode] = useState<SimulationMode>('simple');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Visual toggles
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showVelocity, setShowVelocity] = useState<boolean>(true);
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [showProtractor, setShowProtractor] = useState<boolean>(true);
  const [showRuler, setShowRuler] = useState<boolean>(false);

  // Gravity
  const [currentGravityPreset, setCurrentGravityPreset] = useState<GravityPreset>('earth');

  // Simple Pendulum parameters
  const [params, setParams] = useState<SimplePendulumParams>({
    length: 1.0,
    mass: 1.0,
    gravity: 9.807,
    damping: 0.015,
    drivingForce: 0,
    drivingFrequency: 3.13
  });

  // Simple Pendulum dynamic state
  const [state, setState] = useState<PendulumDynamicState>({
    theta: degToRad(35),
    omega: 0,
    alpha: 0,
    time: 0,
    initialTheta: degToRad(35)
  });

  // Comparison Pendulum state & parameters (for dual comparison mode)
  const [comparisonParams, setComparisonParams] = useState<SimplePendulumParams>({
    length: 1.8,
    mass: 1.5,
    gravity: 9.807,
    damping: 0.015,
    drivingForce: 0,
    drivingFrequency: 3.13
  });

  const [comparisonState, setComparisonState] = useState<PendulumDynamicState>({
    theta: degToRad(35),
    omega: 0,
    alpha: 0,
    time: 0,
    initialTheta: degToRad(35)
  });

  // Double Pendulum parameters & state
  const [doubleParams, setDoubleParams] = useState<DoublePendulumParams>({
    length1: 1.0,
    length2: 0.9,
    mass1: 1.2,
    mass2: 1.0,
    gravity: 9.807,
    damping: 0.002
  });

  const [doubleState, setDoubleState] = useState<DoublePendulumState>({
    theta1: degToRad(85),
    theta2: degToRad(90),
    omega1: 0,
    omega2: 0,
    time: 0
  });

  // Energy & Telemetry state
  const [energy, setEnergy] = useState<EnergyBreakdown>({
    kinetic: 0,
    potential: 0,
    total: 0,
    dissipated: 0
  });

  const [calculations, setCalculations] = useState<DynamicCalculations>({
    tension: 0,
    velocity: 0,
    centripetalAccel: 0,
    tangentialAccel: 0,
    theoreticalPeriodSmall: 2.006,
    theoreticalPeriodExact: 2.05,
    frequency: 0.498,
    restoringForce: 0
  });

  // Photogate state
  const [photogate, setPhotogate] = useState<PhotogateData>({
    enabled: true,
    beamBroken: false,
    lastCrossingTime: null,
    currentHalfPeriod: null,
    measuredPeriod: null,
    oscillationCount: 0,
    history: []
  });

  // History buffer for graphing & CSV
  const [history, setHistory] = useState<DataPoint[]>([]);
  const accumulatedDissipatedRef = useRef<number>(0);
  const previousThetaRef = useRef<number>(degToRad(35));
  const crossingTimesRef = useRef<number[]>([]);
  const lastCrossingInstantRef = useRef<number>(0);

  // Synchronize document direction with language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Audio mute sync
  useEffect(() => {
    soundManager.setMuted(isMuted);
  }, [isMuted]);

  // Handle Gravity Preset Select
  const handleGravityPresetSelect = (presetId: GravityPreset) => {
    setCurrentGravityPreset(presetId);
    const found = GRAVITY_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setParams((prev) => ({ ...prev, gravity: found.value }));
      setComparisonParams((prev) => ({ ...prev, gravity: found.value }));
      setDoubleParams((prev) => ({ ...prev, gravity: found.value }));
    }
  };

  // Reset Simulation
  const handleReset = useCallback(() => {
    const initRad = state.initialTheta;
    setState({
      theta: initRad,
      omega: 0,
      alpha: 0,
      time: 0,
      initialTheta: initRad
    });
    setComparisonState({
      theta: initRad,
      omega: 0,
      alpha: 0,
      time: 0,
      initialTheta: initRad
    });
    setDoubleState({
      theta1: degToRad(85),
      theta2: degToRad(90),
      omega1: 0,
      omega2: 0,
      time: 0
    });
    accumulatedDissipatedRef.current = 0;
    previousThetaRef.current = initRad;
    crossingTimesRef.current = [];
    setPhotogate((prev) => ({
      ...prev,
      beamBroken: false,
      lastCrossingTime: null,
      currentHalfPeriod: null,
      measuredPeriod: null,
      oscillationCount: 0,
      history: []
    }));
    setHistory([]);
  }, [state.initialTheta]);

  // Handle Initial Angle slider change
  const handleInitialAngleChange = (deg: number) => {
    const rad = degToRad(deg);
    setState({
      theta: rad,
      omega: 0,
      alpha: 0,
      time: 0,
      initialTheta: rad
    });
    setComparisonState((prev) => ({
      ...prev,
      theta: rad,
      omega: 0,
      alpha: 0,
      time: 0,
      initialTheta: rad
    }));
    accumulatedDissipatedRef.current = 0;
    previousThetaRef.current = rad;
  };

  // Handle direct Canvas dragging
  const handleDragStart = () => {
    setIsRunning(false);
  };

  const handleDragUpdate = (newTheta: number) => {
    setState((prev) => ({
      ...prev,
      theta: newTheta,
      omega: 0,
      alpha: 0,
      initialTheta: newTheta
    }));
  };

  const handleDragEnd = (releasedTheta: number) => {
    setState({
      theta: releasedTheta,
      omega: 0,
      alpha: 0,
      time: 0,
      initialTheta: releasedTheta
    });
    accumulatedDissipatedRef.current = 0;
    previousThetaRef.current = releasedTheta;
    setIsRunning(true);
  };

  // Apply Guided Experiment preset
  const handleApplyExperiment = (expId: string, expParams: LabExperiment['params']) => {
    setParams((prev) => ({
      ...prev,
      length: expParams.length,
      mass: expParams.mass,
      gravity: expParams.gravity,
      damping: expParams.damping,
      drivingForce: expParams.drivingForce || 0,
      drivingFrequency: expParams.drivingFrequency || 3.13
    }));

    if (expId === 'exp_chaos') {
      setMode('double');
    } else {
      setMode('simple');
    }

    const rad = degToRad(expParams.initialThetaDeg);
    setState({
      theta: rad,
      omega: 0,
      alpha: 0,
      time: 0,
      initialTheta: rad
    });
    accumulatedDissipatedRef.current = 0;
    previousThetaRef.current = rad;
    setIsRunning(true);

    // Scroll smoothly to simulation stage
    const simElem = document.getElementById('simulation-section');
    if (simElem) {
      simElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Export Recorded CSV Data
  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Time (s)', 'Angle (deg)', 'Angular Velocity (rad/s)', 'Kinetic Energy (J)', 'Potential Energy (J)', 'Total Energy (J)', 'Tension (N)'];
    const rows = history.map((p) => [
      p.time.toFixed(3),
      p.theta.toFixed(2),
      p.omega.toFixed(3),
      p.kineticEnergy.toFixed(3),
      p.potentialEnergy.toFixed(3),
      p.totalEnergy.toFixed(3),
      p.tension.toFixed(2)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pendulum_experiment_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Main Simulation Physics Loop via requestAnimationFrame
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const wallDt = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      // Cap dt to avoid numerical explosion on frame drops
      const safeDt = Math.min(0.05, Math.max(0.001, wallDt)) * playbackSpeed;

      if (isRunning) {
        // Multi-substepping (5 substeps per frame) for rock-solid RK4 stability
        const substeps = 5;
        const subDt = safeDt / substeps;

        let curState = { ...state };
        let curCompState = { ...comparisonState };
        let curDoubleState = { ...doubleState };

        for (let i = 0; i < substeps; i++) {
          if (mode === 'double') {
            curDoubleState = stepDoublePendulumRK4(curDoubleState, doubleParams, subDt);
          } else {
            curState = stepSimplePendulumRK4(curState, params, subDt);
            if (mode === 'comparison') {
              curCompState = stepSimplePendulumRK4(curCompState, comparisonParams, subDt);
            }
          }
        }

        // Detect equilibrium crossing (theta = 0) for photogate timing and acoustic click
        const prevTheta = previousThetaRef.current;
        const currentTheta = curState.theta;
        const hasCrossedZero = (prevTheta < 0 && currentTheta >= 0) || (prevTheta > 0 && currentTheta <= 0);

        if (hasCrossedZero && mode === 'simple') {
          soundManager.playPendulumTick();

          if (photogate.enabled) {
            const nowTime = curState.time;
            const crossings = crossingTimesRef.current;
            crossings.push(nowTime);
            if (crossings.length > 20) crossings.shift();

            // A full period comprises two consecutive crossings (moving in the same direction)
            let measured = null;
            if (crossings.length >= 3) {
              const twoCrossingsAgo = crossings[crossings.length - 3];
              measured = nowTime - twoCrossingsAgo;
            }

            setPhotogate((prev) => ({
              ...prev,
              beamBroken: true,
              lastCrossingTime: nowTime,
              measuredPeriod: measured || prev.measuredPeriod,
              oscillationCount: prev.oscillationCount + 1,
              history: measured ? [...prev.history.slice(-15), measured] : prev.history
            }));

            // Reset beam broken visual indicator after 150ms
            setTimeout(() => {
              setPhotogate((prev) => ({ ...prev, beamBroken: false }));
            }, 150);
          }
        }
        previousThetaRef.current = currentTheta;

        // Compute instantaneous telemetry
        const curCalcs = calculateDynamicValues(curState, params);
        const curEnergy = calculateEnergy(
          curState,
          params,
          accumulatedDissipatedRef.current,
          safeDt
        );
        accumulatedDissipatedRef.current = curEnergy.dissipated;

        setState(curState);
        setComparisonState(curCompState);
        setDoubleState(curDoubleState);
        setCalculations(curCalcs);
        setEnergy(curEnergy);

        // Record history at ~30Hz sample rate for smooth charting
        if (Math.random() < 0.6) {
          setHistory((prev) => {
            const nextPoint: DataPoint = {
              time: curState.time,
              theta: radToDeg(curState.theta),
              omega: curState.omega,
              kineticEnergy: curEnergy.kinetic,
              potentialEnergy: curEnergy.potential,
              totalEnergy: curEnergy.total,
              tension: curCalcs.tension
            };
            const updated = [...prev, nextPoint];
            return updated.length > 300 ? updated.slice(-300) : updated;
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isRunning,
    playbackSpeed,
    mode,
    params,
    comparisonParams,
    doubleParams,
    state,
    comparisonState,
    doubleState,
    photogate.enabled
  ]);

  // Step single frame forward
  const handleStepForward = () => {
    setIsRunning(false);
    const dt = 0.02;
    if (mode === 'double') {
      setDoubleState((prev) => stepDoublePendulumRK4(prev, doubleParams, dt));
    } else {
      const nextState = stepSimplePendulumRK4(state, params, dt);
      const curCalcs = calculateDynamicValues(nextState, params);
      const curEnergy = calculateEnergy(nextState, params, accumulatedDissipatedRef.current, dt);
      setState(nextState);
      setCalculations(curCalcs);
      setEnergy(curEnergy);
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Standard Top Bar Contract */}
      <TopNav
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
        onOpenFormulas={() => setShowFormulasModal(true)}
        activeSection={activeSection}
        onNavigateSection={(sec) => {
          setActiveSection(sec);
          const el = document.getElementById(`${sec}-section`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Main Laboratory Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-8">
        {/* Section 1: Interactive Physics Stage & Control Deck */}
        <section id="simulation-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {t.appTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t.appSubtitle}
              </p>
            </div>

            {/* Mode & Period Indicator */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs font-mono">
                <span className="text-slate-500">{t.periodExact}:</span>
                <span className="font-semibold text-purple-700">{formatNum(calculations.theoreticalPeriodExact, 2)} s</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs font-mono">
                <span className="text-slate-500">{t.frequency}:</span>
                <span className="font-semibold text-sky-700">{formatNum(calculations.frequency, 2)} Hz</span>
              </div>
            </div>
          </div>

          {/* Two-Zone Laboratory Sandbox Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Zone (60%): Interactive Canvas + Live Telemetry */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <PendulumCanvas
                mode={mode}
                lang={lang}
                params={params}
                state={state}
                comparisonParams={comparisonParams}
                comparisonState={comparisonState}
                doubleParams={doubleParams}
                doubleState={doubleState}
                calculations={calculations}
                showVectors={showVectors}
                showVelocity={showVelocity}
                showTrail={showTrail}
                showProtractor={showProtractor}
                showRuler={showRuler}
                photogateActive={photogate.enabled}
                photogateTriggered={photogate.beamBroken}
                isRunning={isRunning}
                onDragStart={handleDragStart}
                onDragUpdate={handleDragUpdate}
                onDragEnd={handleDragEnd}
              />

              {/* Instantaneous Physical Telemetry & Energy Readout */}
              <TelemetryDeck
                lang={lang}
                state={state}
                calculations={calculations}
                energy={energy}
              />
            </div>

            {/* Right Zone (40%): Parameter Control Deck */}
            <div className="lg:col-span-5">
              <ControlDeck
                lang={lang}
                mode={mode}
                onModeChange={(newMode) => {
                  setMode(newMode);
                  handleReset();
                }}
                isRunning={isRunning}
                onTogglePlay={() => setIsRunning((prev) => !prev)}
                onStepForward={handleStepForward}
                onReset={handleReset}
                playbackSpeed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
                params={params}
                onParamsChange={(newP) => setParams((prev) => ({ ...prev, ...newP }))}
                doubleParams={doubleParams}
                onDoubleParamsChange={(newP) => setDoubleParams((prev) => ({ ...prev, ...newP }))}
                currentGravityPreset={currentGravityPreset}
                onGravityPresetSelect={handleGravityPresetSelect}
                initialAngleDeg={radToDeg(state.initialTheta)}
                onInitialAngleChange={handleInitialAngleChange}
                showVectors={showVectors}
                onToggleVectors={() => setShowVectors((p) => !p)}
                showVelocity={showVelocity}
                onToggleVelocity={() => setShowVelocity((p) => !p)}
                showTrail={showTrail}
                onToggleTrail={() => setShowTrail((p) => !p)}
                showProtractor={showProtractor}
                onToggleProtractor={() => setShowProtractor((p) => !p)}
                showRuler={showRuler}
                onToggleRuler={() => setShowRuler((p) => !p)}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted((p) => !p)}
                photogateEnabled={photogate.enabled}
                onTogglePhotogate={() => setPhotogate((p) => ({ ...p, enabled: !p.enabled }))}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Five World-Famous Physics Phenomena */}
        <section id="phenomena-section">
          <PhenomenaHub lang={lang} />
        </section>

        {/* Section 3: Real-time Multi-Series Live Graphs */}
        <section id="graphs-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.navGraphs}</h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar' ? 'منحنيات الزاوية، السرعة، فضاء الطور، وميزان الطاقة اللحظي' : 'Real-time phase space, energy balance, and kinematic wave traces'}
              </p>
            </div>
          </div>
          <LiveGraphs
            lang={lang}
            history={history}
            onClearHistory={() => setHistory([])}
            onExportCSV={handleExportCSV}
          />
        </section>

        {/* Section 3: Digital Photogate & Manual Stopwatch */}
        <section id="photogate-section" className="space-y-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.navPhotogate}</h2>
            <p className="text-xs text-slate-500">
              {lang === 'ar' ? 'أدوات القياس الزمني الدقيق للتحقق المخبري من قوانين الحركة' : 'High-precision timing instruments to empirically measure periods'}
            </p>
          </div>
          <PhotogateStopwatch
            lang={lang}
            photogate={photogate}
            theoreticalPeriodExact={calculations.theoreticalPeriodExact}
            onResetPhotogate={() => setPhotogate((p) => ({ ...p, measuredPeriod: null, oscillationCount: 0, history: [] }))}
            onTogglePhotogate={() => setPhotogate((p) => ({ ...p, enabled: !p.enabled }))}
          />
        </section>

        {/* Section 4: Guided Experiments & Scientific Inquiry */}
        <section id="experiments-section" className="space-y-3">
          <LabExperiments
            lang={lang}
            onApplyExperiment={handleApplyExperiment}
          />
        </section>
      </main>

      {/* Clean Scientific Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{t.appTitle}</span>
            <span>·</span>
            <span>{lang === 'ar' ? 'محاكاة فيزيائية تعليمية عالية الدقة' : 'Educational High-Precision Physics Simulation'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFormulasModal(true)}
              className="hover:text-slate-800 transition-colors font-medium"
            >
              {t.navTheory}
            </button>
            <button
              onClick={handleExportCSV}
              className="hover:text-slate-800 transition-colors font-medium"
            >
              {t.exportCSV}
            </button>
          </div>
        </div>
      </footer>

      {/* Theoretical Formulas & Derivations Modal */}
      <PhysicsFormulasModal
        lang={lang}
        isOpen={showFormulasModal}
        onClose={() => setShowFormulasModal(false)}
      />
    </div>
  );
}
