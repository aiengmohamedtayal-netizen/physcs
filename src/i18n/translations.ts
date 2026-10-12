/**
 * Bilingual scientific translation dictionary (Arabic & English)
 */

export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    appTitle: 'مختبر البندول الفيزيائي',
    appSubtitle: 'محاكاة تفاعلية لحركة البندول، حسابات الطاقة وقوى الشد والتحليل الطوري',
    brandBadge: 'المختبر الفيزيائي التفاعلي',

    // Nav
    navCurriculum: 'منهج 3 ثانوي (مصر)',
    navSimulation: 'محاكي البندول',
    navPhenomena: 'الظواهر العالمية',
    navGraphs: 'الرسوم البيانية',
    navExperiments: 'التجارب المخبرية',
    navPhotogate: 'البوابة والمؤقت',
    navTheory: 'القوانين والمعادلات',

    // Modes
    modeSimple: 'البندول البسيط',
    modeDouble: 'البندول المزدوج (الشواش)',
    modeComparison: 'مقارنة بندولين',

    // Simulation controls
    play: 'تشغيل',
    pause: 'إيقاف مؤقت',
    step: 'خطوة واحدة',
    reset: 'إعادة ضبط',
    speed: 'سرعة العرض',
    dragHint: 'اسحب كرة البندول بالماوس أو اللمس لتحديد زاوية الانطلاق ثم أفلتها!',
    releasingAt: 'زاوية الإفلات:',

    // Overlays
    showVectors: 'متجهات القوى',
    showVelocity: 'متجه السرعة',
    showTrail: 'مسار الحركة',
    showProtractor: 'المنقلة والزوايا',
    showRuler: 'شبكة الإحداثيات',
    soundToggle: 'مؤثرات الصوت',
    smallAngleApprox: 'تقريب الزوايا الصغيرة (sin θ ≈ θ)',

    // Parameters
    parametersTitle: 'معاملات التجربة',
    length: 'طول الخيط (L)',
    mass: 'كتلة الكرة (m)',
    gravity: 'تسارع الجاذبية (g)',
    damping: 'مقاومة الهواء (التخميد)',
    initialAngle: 'زاوية الانطلاق الابتدائية (θ₀)',
    drivingForce: 'قوة دفع دورية (F₀)',
    drivingFrequency: 'تردد قوة الدفع (Ω)',

    // Presets
    gravityPresets: 'البيئة الجاذبية',
    earth: 'الأرض (9.81 م/ث²)',
    moon: 'القمر (1.62 م/ث²)',
    mars: 'المريخ (3.72 م/ث²)',
    jupiter: 'المشتري (24.79 م/ث²)',
    zeroG: 'انعدام الجاذبية (0 م/ث²)',

    // Measurements & Telemetry
    telemetryTitle: 'القياسات الفيزيائية اللحظية',
    currentAngle: 'الزاوية اللحظية (θ)',
    angularVelocity: 'السرعة الزاوية (ω)',
    linearVelocity: 'السرعة الخطية (v)',
    stringTension: 'قوة الشد (T)',
    centripetalAccel: 'التسارع المركزي (ac)',
    tangentialAccel: 'التسارع المماسي (at)',
    periodSmall: 'الزمن الدوري التقريبي (T₀)',
    periodExact: 'الزمن الدوري الدقيق (T)',
    frequency: 'التردد (f)',
    cycleCount: 'عدد الدورات المكتملة',

    // Energy
    energyTitle: 'مخطط تحولات الطاقة',
    kineticEnergy: 'طاقة الحركة (Ek)',
    potentialEnergy: 'طاقة الوضع (Ep)',
    totalEnergy: 'الطاقة الميكانيكية (Etot)',
    dissipatedEnergy: 'طاقة مهدورة بالاحتكاك',
    energyConservation: 'قانون حفظ الطاقة الميكانيكية متحقق بدقة عالية',

    // Graphs
    graphAngle: 'الزاوية مع الزمن θ(t)',
    graphVelocity: 'السرعة الزاوية ω(t)',
    graphPhase: 'فضاء الطور (Phase Space)',
    graphEnergy: 'تحولات الطاقة E(t)',
    timeAxis: 'الزمن (ثانية)',
    angleAxis: 'الزاوية (درجة)',
    velocityAxis: 'السرعة الزاوية (راديان/ث)',
    energyAxis: 'الطاقة (جول)',

    // Photogate & Stopwatch
    photogateTitle: 'البوابة الضوئية الرقمية',
    photogateDesc: 'تقيس الزمن الدوري عند مرور الكرة عبر موضع الاتزان بدقة الليزر',
    photogateActive: 'البوابة نشطة (انتظار مرور البندول)',
    photogateBeamCut: 'تم قطع شعاع الليزر!',
    measuredPeriod: 'الزمن الدوري المقاس بالبوابة',
    periodAverage: 'متوسط الزمن الدوري (T_avg)',
    stopwatchTitle: 'ساعة الإيقاف اليدوية',
    startStopwatch: 'بدء',
    stopStopwatch: 'إيقاف',
    lapStopwatch: 'دورة / لفة',
    clearStopwatch: 'تصفير',
    lapsCount: 'الدورات المسجلة',

    // Experiments
    experimentsTitle: 'تجارب علمية موجهة للطلاب والباحثين',
    experimentsSubtitle: 'اختر تجربة لاستكشاف قوانين البندول واختبار الفرضيات الفيزيائية',
    applyExperiment: 'تطبيق إعدادات التجربة',
    testUnderstanding: 'اختبر فهمك للظاهرة',
    submitAnswer: 'تحقق من الإجابة',
    correctAnswer: 'إجابة صحيحة ومتقنة!',
    tryAgain: 'حاول مجدداً، تأمل القوانين الفيزيائية بعناية.',

    // Export & Formulas
    exportCSV: 'تصدير بيانات التجربة (CSV)',
    viewFormulas: 'الاشتقاقات والمعادلات الرياضية',
    formulasTitle: 'الأساس الرياضي والفيزيائي للبندول',
    close: 'إغلاق',

    // Double pendulum specifics
    doublePendulumNote: 'البندول المزدوج مثال كلاسيكي على الأنظمة الديناميكية غير الخطية والشواش الحتمي (Chaos Theory). أي تغير طفيف في زاوية البداية يؤدي لمسار مختلف كلياً.',
    length1: 'طول القضيب الأول (L₁)',
    length2: 'طول القضيب الثاني (L₂)',
    mass1: 'كتلة الجسم الأول (m₁)',
    mass2: 'كتلة الجسم الثاني (m₂)',

    // Units
    meters: 'متر',
    kilograms: 'كجم',
    seconds: 'ثانية',
    hertz: 'هرتز',
    newtons: 'نيوتن',
    joules: 'جول',
    degPerSec: 'درجة/ثانية',
    radPerSec: 'راد/ثانية',
    metersPerSecSq: 'م/ث²'
  },
  en: {
    appTitle: 'Interactive Pendulum Lab',
    appSubtitle: 'High-precision physics simulation, energy breakdown, tension vectors & phase-space analysis',
    brandBadge: 'Physics Simulation Studio',

    // Nav
    navCurriculum: '3rd Secondary Curriculum',
    navSimulation: 'Pendulum Lab',
    navPhenomena: 'World Phenomena',
    navGraphs: 'Live Graphs',
    navExperiments: 'Guided Labs',
    navPhotogate: 'Photogate & Timer',
    navTheory: 'Physics Equations',

    // Modes
    modeSimple: 'Simple Pendulum',
    modeDouble: 'Double Pendulum (Chaos)',
    modeComparison: 'Dual Comparison',

    // Simulation controls
    play: 'Play',
    pause: 'Pause',
    step: 'Step Forward',
    reset: 'Reset',
    speed: 'Playback Speed',
    dragHint: 'Drag the pendulum bob with mouse or touch to set the release angle, then release!',
    releasingAt: 'Release Angle:',

    // Overlays
    showVectors: 'Force Vectors',
    showVelocity: 'Velocity Vector',
    showTrail: 'Motion Trail',
    showProtractor: 'Protractor & Angles',
    showRuler: 'Coordinate Grid',
    soundToggle: 'Audio Ticks',
    smallAngleApprox: 'Small Angle Approx (sin θ ≈ θ)',

    // Parameters
    parametersTitle: 'Simulation Parameters',
    length: 'String Length (L)',
    mass: 'Bob Mass (m)',
    gravity: 'Gravity (g)',
    damping: 'Air Resistance (Damping)',
    initialAngle: 'Initial Release Angle (θ₀)',
    drivingForce: 'Periodic Driving Force (F₀)',
    drivingFrequency: 'Driving Frequency (Ω)',

    // Presets
    gravityPresets: 'Gravitational Environments',
    earth: 'Earth (9.81 m/s²)',
    moon: 'Moon (1.62 m/s²)',
    mars: 'Mars (3.72 m/s²)',
    jupiter: 'Jupiter (24.79 m/s²)',
    zeroG: 'Zero Gravity (0 m/s²)',

    // Measurements & Telemetry
    telemetryTitle: 'Instantaneous Physical Quantities',
    currentAngle: 'Current Angle (θ)',
    angularVelocity: 'Angular Velocity (ω)',
    linearVelocity: 'Linear Velocity (v)',
    stringTension: 'String Tension (T)',
    centripetalAccel: 'Centripetal Accel (ac)',
    tangentialAccel: 'Tangential Accel (at)',
    periodSmall: 'Small-Angle Period (T₀)',
    periodExact: 'Exact Non-Linear Period (T)',
    frequency: 'Frequency (f)',
    cycleCount: 'Completed Oscillations',

    // Energy
    energyTitle: 'Energy Transformation Spectrum',
    kineticEnergy: 'Kinetic Energy (Ek)',
    potentialEnergy: 'Potential Energy (Ep)',
    totalEnergy: 'Mechanical Energy (Etot)',
    dissipatedEnergy: 'Dissipated Heat Energy',
    energyConservation: 'Conservation of mechanical energy verified with high numerical precision',

    // Graphs
    graphAngle: 'Angle vs Time θ(t)',
    graphVelocity: 'Angular Velocity ω(t)',
    graphPhase: 'Phase Space (ω vs θ)',
    graphEnergy: 'Energy vs Time E(t)',
    timeAxis: 'Time (s)',
    angleAxis: 'Angle (°)',
    velocityAxis: 'Angular Vel (rad/s)',
    energyAxis: 'Energy (J)',

    // Photogate & Stopwatch
    photogateTitle: 'Digital Laser Photogate',
    photogateDesc: 'Measures oscillation period with high optical accuracy at the equilibrium point',
    photogateActive: 'Photogate active (awaiting pendulum crossing)',
    photogateBeamCut: 'Laser beam interrupted!',
    measuredPeriod: 'Photogate Measured Period',
    periodAverage: 'Average Period (T_avg)',
    stopwatchTitle: 'Manual Lab Stopwatch',
    startStopwatch: 'Start',
    stopStopwatch: 'Stop',
    lapStopwatch: 'Lap / Split',
    clearStopwatch: 'Reset',
    lapsCount: 'Recorded Laps',

    // Experiments
    experimentsTitle: 'Structured Physics Guided Labs',
    experimentsSubtitle: 'Explore fundamental laws of pendulums, test hypotheses, and verify equations',
    applyExperiment: 'Load Lab Configuration',
    testUnderstanding: 'Check Your Conceptual Understanding',
    submitAnswer: 'Verify Answer',
    correctAnswer: 'Correct! Accurate scientific reasoning.',
    tryAgain: 'Not quite. Re-examine the physical principles above.',

    // Export & Formulas
    exportCSV: 'Export CSV Data',
    viewFormulas: 'Equations & Derivations',
    formulasTitle: 'Mathematical & Physics Foundations',
    close: 'Close',

    // Double pendulum specifics
    doublePendulumNote: 'The double pendulum is an archetypal example of deterministic chaos. Microscopic variations in initial angles diverge exponentially over time.',
    length1: 'First Rod Length (L₁)',
    length2: 'Second Rod Length (L₂)',
    mass1: 'First Mass (m₁)',
    mass2: 'Second Mass (m₂)',

    // Units
    meters: 'm',
    kilograms: 'kg',
    seconds: 's',
    hertz: 'Hz',
    newtons: 'N',
    joules: 'J',
    degPerSec: '°/s',
    radPerSec: 'rad/s',
    metersPerSecSq: 'm/s²'
  }
};
