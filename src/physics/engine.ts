/**
 * High-Precision Physics Engine for Pendulum Simulations
 * Utilizes 4th-Order Runge-Kutta (RK4) numerical integration for non-linear dynamics
 */

import {
  SimplePendulumParams,
  PendulumDynamicState,
  DoublePendulumParams,
  DoublePendulumState,
  EnergyBreakdown,
  DynamicCalculations,
  GravityOption
} from '../types/physics';

export const GRAVITY_PRESETS: GravityOption[] = [
  { id: 'earth', nameAr: 'الأرض', nameEn: 'Earth', value: 9.807, iconColor: '#0284c7' },
  { id: 'moon', nameAr: 'القمر', nameEn: 'Moon', value: 1.62, iconColor: '#64748b' },
  { id: 'mars', nameAr: 'المريخ', nameEn: 'Mars', value: 3.721, iconColor: '#dc2626' },
  { id: 'jupiter', nameAr: 'المشتري', nameEn: 'Jupiter', value: 24.79, iconColor: '#d97706' },
  { id: 'zero_g', nameAr: 'انعدام الجاذبية', nameEn: 'Zero-G', value: 0.0, iconColor: '#8b5cf6' },
  { id: 'custom', nameAr: 'مخصص', nameEn: 'Custom', value: 9.807, iconColor: '#0d9488' }
];

/**
 * Evaluates angular acceleration d^2(theta)/dt^2
 */
function simplePendulumDerivatives(
  theta: number,
  omega: number,
  t: number,
  params: SimplePendulumParams
): { dTheta: number; dOmega: number } {
  const { length, mass, gravity, damping, drivingForce, drivingFrequency } = params;

  const dTheta = omega;
  // Gravitational restoring term: -(g/L)*sin(theta)
  // Damping term: -(b/m)*omega
  // External periodic forcing: (F0 / (m*L)) * cos(Omega * t)
  const forcing = drivingForce > 0 ? (drivingForce / (mass * length)) * Math.cos(drivingFrequency * t) : 0;
  const gravityTerm = length > 0.001 ? -(gravity / length) * Math.sin(theta) : 0;
  const dampingTerm = mass > 0.001 ? -(damping / mass) * omega : 0;

  const dOmega = gravityTerm + dampingTerm + forcing;

  return { dTheta, dOmega };
}

/**
 * Step forward in time using 4th-Order Runge-Kutta (RK4)
 */
export function stepSimplePendulumRK4(
  state: PendulumDynamicState,
  params: SimplePendulumParams,
  dt: number
): PendulumDynamicState {
  const { theta, omega, time } = state;

  // k1
  const k1 = simplePendulumDerivatives(theta, omega, time, params);

  // k2
  const theta2 = theta + 0.5 * dt * k1.dTheta;
  const omega2 = omega + 0.5 * dt * k1.dOmega;
  const k2 = simplePendulumDerivatives(theta2, omega2, time + 0.5 * dt, params);

  // k3
  const theta3 = theta + 0.5 * dt * k2.dTheta;
  const omega3 = omega + 0.5 * dt * k2.dOmega;
  const k3 = simplePendulumDerivatives(theta3, omega3, time + 0.5 * dt, params);

  // k4
  const theta4 = theta + dt * k3.dTheta;
  const omega4 = omega + dt * k3.dOmega;
  const k4 = simplePendulumDerivatives(theta4, omega4, time + dt, params);

  // Weighted average
  const nextTheta = theta + (dt / 6) * (k1.dTheta + 2 * k2.dTheta + 2 * k3.dTheta + k4.dTheta);
  const nextOmega = omega + (dt / 6) * (k1.dOmega + 2 * k2.dOmega + 2 * k3.dOmega + k4.dOmega);

  // Wrap theta to [-pi, pi] for unbounded rotations if desired, or keep continuous
  // We compute current instantaneous acceleration
  const currentDeriv = simplePendulumDerivatives(nextTheta, nextOmega, time + dt, params);

  return {
    theta: nextTheta,
    omega: nextOmega,
    alpha: currentDeriv.dOmega,
    time: time + dt,
    initialTheta: state.initialTheta
  };
}

/**
 * Computes energy breakdown for simple pendulum
 */
export function calculateEnergy(
  state: PendulumDynamicState,
  params: SimplePendulumParams,
  priorDissipated: number = 0,
  dt: number = 0
): EnergyBreakdown {
  const { length, mass, gravity, damping } = params;
  const { theta, omega } = state;

  // Linear velocity v = L * omega
  const v = length * omega;
  // Kinetic energy: Ek = 0.5 * m * v^2 = 0.5 * m * L^2 * omega^2
  const kinetic = 0.5 * mass * v * v;

  // Potential energy reference: zero at the bottom (theta = 0)
  // Height h = L * (1 - cos(theta))
  const height = length * (1 - Math.cos(theta));
  const potential = mass * gravity * height;

  // Dissipated power P_diss = b * v^2 = b * L^2 * omega^2
  const instantDissipatedPower = damping * v * v;
  const newlyDissipated = instantDissipatedPower * dt;
  const dissipated = priorDissipated + newlyDissipated;

  const total = kinetic + potential;

  return {
    kinetic: Math.max(0, kinetic),
    potential: Math.max(0, potential),
    total: Math.max(0, total),
    dissipated
  };
}

/**
 * Computes theoretical and exact period of simple pendulum
 */
export function calculateDynamicValues(
  state: PendulumDynamicState,
  params: SimplePendulumParams
): DynamicCalculations {
  const { length, mass, gravity } = params;
  const { theta, omega } = state;

  const v = length * omega;
  const centripetalAccel = length > 0 ? (v * v) / length : 0;
  const tangentialAccel = -gravity * Math.sin(theta);

  // String tension force: T = m * (g*cos(theta) + L*omega^2)
  const tension = mass * (gravity * Math.cos(theta) + length * omega * omega);

  // Theoretical period for small angles: T0 = 2*pi*sqrt(L/g)
  let theoreticalPeriodSmall = 0;
  let frequency = 0;
  if (gravity > 0 && length > 0) {
    theoreticalPeriodSmall = 2 * Math.PI * Math.sqrt(length / gravity);
    frequency = 1 / theoreticalPeriodSmall;
  }

  // Exact period using Borda / Legendre elliptic expansion
  // T = T0 * (1 + 1/4 k^2 + 9/64 k^4 + 25/256 k^6 ...) where k = sin(theta0 / 2)
  let theoreticalPeriodExact = theoreticalPeriodSmall;
  const initialAngle = Math.abs(state.initialTheta);
  if (theoreticalPeriodSmall > 0 && initialAngle > 0.001) {
    const k = Math.sin(initialAngle / 2);
    const k2 = k * k;
    const k4 = k2 * k2;
    const k6 = k4 * k2;
    const k8 = k4 * k4;
    const factor = 1 + (1 / 4) * k2 + (9 / 64) * k4 + (25 / 256) * k6 + (1225 / 16384) * k8;
    theoreticalPeriodExact = theoreticalPeriodSmall * factor;
  }

  const restoringForce = -mass * gravity * Math.sin(theta);

  return {
    tension: Math.max(0, tension),
    velocity: v,
    centripetalAccel,
    tangentialAccel,
    theoreticalPeriodSmall,
    theoreticalPeriodExact,
    frequency,
    restoringForce
  };
}

/**
 * Double Pendulum Derivatives via Lagrangian Mechanics
 */
function doublePendulumDerivatives(
  theta1: number,
  theta2: number,
  omega1: number,
  omega2: number,
  params: DoublePendulumParams
): { dTheta1: number; dTheta2: number; dOmega1: number; dOmega2: number } {
  const { length1: L1, length2: L2, mass1: m1, mass2: m2, gravity: g, damping: b } = params;

  const delta = theta1 - theta2;

  const num1 = -g * (2 * m1 + m2) * Math.sin(theta1)
    - m2 * g * Math.sin(theta1 - 2 * theta2)
    - 2 * Math.sin(delta) * m2 * (omega2 * omega2 * L2 + omega1 * omega1 * L1 * Math.cos(delta));
  const den1 = L1 * (2 * m1 + m2 - m2 * Math.cos(2 * delta));
  let dOmega1 = num1 / den1;

  const num2 = 2 * Math.sin(delta) * (
    omega1 * omega1 * L1 * (m1 + m2)
    + g * (m1 + m2) * Math.cos(theta1)
    + omega2 * omega2 * L2 * m2 * Math.cos(delta)
  );
  const den2 = L2 * (2 * m1 + m2 - m2 * Math.cos(2 * delta));
  let dOmega2 = num2 / den2;

  // Apply damping if present
  if (b > 0) {
    dOmega1 -= (b / (m1 + m2)) * omega1;
    dOmega2 -= (b / m2) * omega2;
  }

  return {
    dTheta1: omega1,
    dTheta2: omega2,
    dOmega1,
    dOmega2
  };
}

/**
 * Step forward Double Pendulum using RK4
 */
export function stepDoublePendulumRK4(
  state: DoublePendulumState,
  params: DoublePendulumParams,
  dt: number
): DoublePendulumState {
  const { theta1, theta2, omega1, omega2, time } = state;

  const k1 = doublePendulumDerivatives(theta1, theta2, omega1, omega2, params);

  const t1_2 = theta1 + 0.5 * dt * k1.dTheta1;
  const t2_2 = theta2 + 0.5 * dt * k1.dTheta2;
  const w1_2 = omega1 + 0.5 * dt * k1.dOmega1;
  const w2_2 = omega2 + 0.5 * dt * k1.dOmega2;
  const k2 = doublePendulumDerivatives(t1_2, t2_2, w1_2, w2_2, params);

  const t1_3 = theta1 + 0.5 * dt * k2.dTheta1;
  const t2_3 = theta2 + 0.5 * dt * k2.dTheta2;
  const w1_3 = omega1 + 0.5 * dt * k2.dOmega1;
  const w2_3 = omega2 + 0.5 * dt * k2.dOmega2;
  const k3 = doublePendulumDerivatives(t1_3, t2_3, w1_3, w2_3, params);

  const t1_4 = theta1 + dt * k3.dTheta1;
  const t2_4 = theta2 + dt * k3.dTheta2;
  const w1_4 = omega1 + dt * k3.dOmega1;
  const w2_4 = omega2 + dt * k3.dOmega2;
  const k4 = doublePendulumDerivatives(t1_4, t2_4, w1_4, w2_4, params);

  const nextT1 = theta1 + (dt / 6) * (k1.dTheta1 + 2 * k2.dTheta1 + 2 * k3.dTheta1 + k4.dTheta1);
  const nextT2 = theta2 + (dt / 6) * (k1.dTheta2 + 2 * k2.dTheta2 + 2 * k3.dTheta2 + k4.dTheta2);
  const nextW1 = omega1 + (dt / 6) * (k1.dOmega1 + 2 * k2.dOmega1 + 2 * k3.dOmega1 + k4.dOmega1);
  const nextW2 = omega2 + (dt / 6) * (k1.dOmega2 + 2 * k2.dOmega2 + 2 * k3.dOmega2 + k4.dOmega2);

  return {
    theta1: nextT1,
    theta2: nextT2,
    omega1: nextW1,
    omega2: nextW2,
    time: time + dt
  };
}

/**
 * Format physics values with exact precision
 */
export function formatNum(val: number, decimals: number = 2): string {
  if (isNaN(val) || !isFinite(val)) return '0.00';
  return val.toFixed(decimals);
}

/**
 * Radians to degrees
 */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Degrees to radians
 */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
