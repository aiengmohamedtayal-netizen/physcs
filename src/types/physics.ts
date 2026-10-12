/**
 * Physics Types and State Interfaces for the Interactive Pendulum Lab
 */

export type SimulationMode = 'simple' | 'double' | 'comparison';

export type GravityPreset = 'earth' | 'moon' | 'mars' | 'jupiter' | 'zero_g' | 'custom';

export interface GravityOption {
  id: GravityPreset;
  nameAr: string;
  nameEn: string;
  value: number; // m/s^2
  iconColor: string;
}

export interface SimplePendulumParams {
  length: number;       // meters (L)
  mass: number;         // kg (m)
  gravity: number;      // m/s^2 (g)
  damping: number;      // friction coefficient b (N*s/m)
  drivingForce: number; // amplitude F0 (N)
  drivingFrequency: number; // rad/s (Omega)
}

export interface PendulumDynamicState {
  theta: number;        // radians
  omega: number;        // rad/s (angular velocity)
  alpha: number;        // rad/s^2 (angular acceleration)
  time: number;         // seconds elapsed
  initialTheta: number; // radians (at release)
}

export interface DoublePendulumParams {
  length1: number;      // L1 (m)
  length2: number;      // L2 (m)
  mass1: number;        // m1 (kg)
  mass2: number;        // m2 (kg)
  gravity: number;      // g (m/s^2)
  damping: number;      // damping coefficient
}

export interface DoublePendulumState {
  theta1: number;
  theta2: number;
  omega1: number;
  omega2: number;
  time: number;
}

export interface EnergyBreakdown {
  kinetic: number;      // Joules (Ek)
  potential: number;    // Joules (Ep)
  total: number;        // Joules (Etot = Ek + Ep)
  dissipated: number;   // Joules lost to damping
}

export interface DynamicCalculations {
  tension: number;             // Tension force T in string (Newtons)
  velocity: number;            // Linear velocity v = L * omega (m/s)
  centripetalAccel: number;    // ac = v^2 / L (m/s^2)
  tangentialAccel: number;     // at = g * sin(theta) (m/s^2)
  theoreticalPeriodSmall: number; // T0 = 2*pi*sqrt(L/g)
  theoreticalPeriodExact: number; // Exact period using elliptic series
  frequency: number;           // f = 1 / T0 (Hz)
  restoringForce: number;      // F_restoring = -m * g * sin(theta)
}

export interface DataPoint {
  time: number;
  theta: number;               // degrees or radians
  omega: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
  tension: number;
}

export interface PhotogateData {
  enabled: boolean;
  beamBroken: boolean;
  lastCrossingTime: number | null;
  currentHalfPeriod: number | null;
  measuredPeriod: number | null;
  oscillationCount: number;
  history: number[]; // array of measured periods
}

export interface StopwatchState {
  running: boolean;
  elapsedTime: number; // seconds
  laps: number[];
}

export interface LabExperiment {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  objectiveAr: string;
  objectiveEn: string;
  params: {
    length: number;
    mass: number;
    gravity: number;
    damping: number;
    initialThetaDeg: number;
    drivingForce?: number;
    drivingFrequency?: number;
  };
  questionAr: string;
  questionEn: string;
  optionsAr: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationAr: string;
  explanationEn: string;
}
