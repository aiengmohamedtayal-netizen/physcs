/**
 * Types and interfaces for the Five World-Famous Physics Phenomena
 */

export type PhenomenonId = 'foucault' | 'newton_cradle' | 'double_slit' | 'photoelectric' | 'millikan';

export interface PhenomenonMeta {
  id: PhenomenonId;
  titleAr: string;
  titleEn: string;
  scientistAr: string;
  scientistEn: string;
  year: string;
  summaryAr: string;
  summaryEn: string;
  keyEquation: string;
}

// 1. Foucault Pendulum State
export interface FoucaultParams {
  latitudeDeg: number;       // degrees (-90 to 90)
  pendulumLength: number;     // meters (e.g. 67m in Paris Pantheon)
  initialAmplitudeDeg: number;
}

// 2. Newton's Cradle State
export interface NewtonsCradleParams {
  ballCount: number;          // 5
  liftedCount: number;        // 1 to 4
  elasticity: number;         // restitution 0.8 to 1.0
  gravity: number;
}

// 3. Young's Double Slit State
export interface DoubleSlitParams {
  wavelengthNm: number;       // 380 nm (violet) to 700 nm (red)
  slitDistanceMm: number;     // mm (d)
  slitWidthMm: number;        // mm (a)
  screenDistanceM: number;    // meters (D)
  intensity: number;          // lux
}

// 4. Photoelectric Effect State
export interface TargetMetal {
  id: string;
  nameAr: string;
  nameEn: string;
  workFunctionEV: number;     // Phi in eV
  colorHex: string;
}

export interface PhotoelectricParams {
  targetMetalId: string;
  wavelengthNm: number;       // 200 nm to 800 nm
  lightIntensityPct: number;  // 0% to 100%
  stoppingVoltageV: number;   // -5V to +5V
}

// 5. Millikan Oil Drop State
export interface MillikanParams {
  voltageV: number;           // 0 to 500 V
  plateSeparationMm: number;  // mm (d)
  dropRadiusUm: number;       // micrometers (r)
  excessElectrons: number;    // integer n (e.g. 1 to 10)
  oilDensityKgM3: number;     // ~900 kg/m^3
}
