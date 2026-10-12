import { LabExperiment } from '../types/physics';

export const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: 'exp_length_period',
    titleAr: '1. قانون جاليليو: علاقة طول الخيط بالزمن الدوري',
    titleEn: '1. Galileo’s Law: String Length vs. Oscillation Period',
    objectiveAr: 'التحقق من أن الزمن الدوري للبندول يتناسب طردياً مع الجذر التربيعي لطول الخيط (T ∝ √L).',
    objectiveEn: 'Verify that the oscillation period of a pendulum is proportional to the square root of its length (T ∝ √L).',
    descriptionAr: 'اكتشف العالم جاليليو جاليلي في كاتدرائية بيزا عام 1583 أن زيادة طول البندول تبطئ حركته. لمضاعفة الزمن الدوري، يجب مضاعفة الطول أربع مرات!',
    descriptionEn: 'Galileo Galilei observed in Pisa Cathedral in 1583 that longer pendulums oscillate slower. To double the period, length must be quadrupled!',
    params: {
      length: 1.0,
      mass: 1.0,
      gravity: 9.807,
      damping: 0.0,
      initialThetaDeg: 20
    },
    questionAr: 'إذا قمنا بزيادة طول الخيط من 1.00 م إلى 4.00 م، فماذا يحدث للزمن الدوري T؟',
    questionEn: 'If the string length increases from 1.00 m to 4.00 m, what happens to the period T?',
    optionsAr: [
      'يتضاعف الزمن الدوري إلى الضعف (2×)',
      'يزداد الزمن الدوري إلى أربعة أضعاف (4×)',
      'يقل الزمن الدوري إلى النصف (0.5×)',
      'يبقى الزمن الدوري ثابتاً لا يتغير'
    ],
    optionsEn: [
      'The period doubles (2×)',
      'The period quadruples (4×)',
      'The period is halved (0.5×)',
      'The period remains unchanged'
    ],
    correctIndex: 0,
    explanationAr: 'وفقاً للمعادلة T = 2π√(L/g)، فإن T يتناسب مع √L. جذر (4 / 1) = 2، وبالتالي يتضاعف الزمن الدوري إلى الضعف بالضبط.',
    explanationEn: 'According to T = 2π√(L/g), period is proportional to √L. Since √(4/1) = 2, the period exactly doubles.'
  },
  {
    id: 'exp_mass_independence',
    titleAr: '2. هل تؤثر كتلة الكرة على الزمن الدوري؟',
    titleEn: '2. Does Bob Mass Affect Oscillation Period?',
    objectiveAr: 'إثبات أن الزمن الدوري للبندول البسيط مستقل تماماً عن كتلة الكرة المعلقة في غياب المقاومة.',
    objectiveEn: 'Demonstrate that the simple pendulum period is completely independent of the bob mass in the absence of air drag.',
    descriptionAr: 'قوة الإرجاع تزداد مع زيادة الكتلة (F = -mg sin θ)، ولكن القصور الذاتي للجسم (مقاومته للحركة) يزداد بنفس النسبة بالضبط (F = ma)، فيلغي كلاهما الآخر!',
    descriptionEn: 'The gravitational restoring force increases with mass (F = -mg sin θ), but inertia resists acceleration identically (F = ma), perfectly canceling out!',
    params: {
      length: 1.5,
      mass: 0.2,
      gravity: 9.807,
      damping: 0.0,
      initialThetaDeg: 15
    },
    questionAr: 'إذا استبدلنا كرة البندول بكرة أخرى أثقل بعشر مرات (من 0.2 كجم إلى 2.0 كجم)، كيف يتغير الزمن الدوري؟',
    questionEn: 'If we replace the bob with one that is ten times heavier (0.2 kg to 2.0 kg), how does the period change?',
    optionsAr: [
      'يبقى الزمن الدوري كما هو دون أي تغيير',
      'يصبح البندول أسرع ويقل الزمن الدوري',
      'يصبح البندول أبطأ ويزداد الزمن الدوري عشر مرات',
      'يتوقف البندول عن الحركة بسبب الثقل'
    ],
    optionsEn: [
      'The period remains exactly the same',
      'The pendulum oscillates faster with a smaller period',
      'The pendulum becomes 10× slower',
      'The pendulum stops moving due to weight'
    ],
    correctIndex: 0,
    explanationAr: 'لا يظهر متغير الكتلة m في معادلة الزمن الدوري T = 2π√(L/g). تسارع الجاذبية يؤثر على جميع الأجسام بالتساوي بغض النظر عن كتلتها.',
    explanationEn: 'Mass m does not appear in T = 2π√(L/g). Gravitational acceleration acts equally on all masses regardless of weight.'
  },
  {
    id: 'exp_small_angle',
    titleAr: '3. حدود تقريب الزوايا الصغيرة (sin θ ≈ θ)',
    titleEn: '3. Limits of the Small-Angle Approximation',
    objectiveAr: 'مقارنة الحل الخطي التقريبي مع الحل الحقيقي الدقيق غير الخطي عند زوايا إطلاق كبيرة كـ 90° و150°.',
    objectiveEn: 'Compare the linear small-angle solution against exact non-linear dynamics at large amplitudes like 90° and 150°.',
    descriptionAr: 'يصح قانون T = 2π√(L/g) فقط عندما تكون زاوية الإطلاق صغيرة (أقل من 15 درجة)، حيث sin θ بالراديان يقارب θ. ولكن عند الزوايا الكبيرة يتأخر البندول ويزداد زمنه الدوري بشكل ملحوظ.',
    descriptionEn: 'The simple equation T = 2π√(L/g) assumes sin θ ≈ θ in radians. At large angles, restoring force is smaller than linear expectation, slowing the pendulum.',
    params: {
      length: 1.0,
      mass: 1.0,
      gravity: 9.807,
      damping: 0.0,
      initialThetaDeg: 90
    },
    questionAr: 'عند إفلات البندول من زاوية أفقية 90°، كيف يقارن الزمن الدوري الحقيقي بالزمن المحسوب بقانون الزوايا الصغيرة؟',
    questionEn: 'When released from 90° (horizontal), how does the exact real period compare to the small-angle prediction?',
    optionsAr: [
      'الزمن الدوري الحقيقي أكبر بحوالي 18% من التقريب',
      'الزمن الدوري الحقيقي أصغر من التقريب',
      'الزمنان متطابقان تماماً لأن الزاوية لا تؤثر',
      'ينعدم الزمن الدوري لأن البندول لن يعود'
    ],
    optionsEn: [
      'The exact period is about ~18% longer than the small-angle formula',
      'The exact period is shorter than predicted',
      'Both periods are identical',
      'The period vanishes because it will not swing back'
    ],
    correctIndex: 0,
    explanationAr: 'عند 90°، يعطي تكامل إليبتيك الدقيق T ≈ 1.18 T₀، أي أن الزمن الدوري الحقيقي أطول بنسبة 18% مقارنة بالقانون المبسط.',
    explanationEn: 'At 90°, the complete elliptic integral yields T ≈ 1.18 T₀, making the exact period ~18% longer than the simplified formula.'
  },
  {
    id: 'exp_energy_damping',
    titleAr: '4. حفظ الطاقة الميكانيكية وتأثير التخميد',
    titleEn: '4. Mechanical Energy Conservation & Air Damping',
    objectiveAr: 'تتبع تحول طاقة الوضع Ep إلى طاقة حركة Ek ثم عودتها، وتأثير قوى الاحتكاك في تحويل الطاقة الميكانيكية إلى حرارة.',
    objectiveEn: 'Track conversion between potential energy Ep and kinetic energy Ek, and see mechanical energy dissipate into thermal energy due to friction.',
    descriptionAr: 'في قمة المسار تكون طاقة الحركة صفراً وطاقة الوضع في حدها الأقصى. عند المرور بمركز الاتزان تصبح طاقة الوضع صفراً وطاقة الحركة في حدها الأقصى، مع بقاء المجموع ثابتاً في غياب التخميد.',
    descriptionEn: 'At peak swing, kinetic energy is zero and potential energy is maximal. At the bottom, potential is minimal and kinetic is maximal, keeping total energy constant without friction.',
    params: {
      length: 1.2,
      mass: 1.5,
      gravity: 9.807,
      damping: 0.08,
      initialThetaDeg: 60
    },
    questionAr: 'أين تكون السرعة الخطية وقوة الشد في الخيط في أعلى قيم لهما خلال دورة كاملة؟',
    questionEn: 'Where are linear velocity and string tension at their maximum values during a full swing?',
    optionsAr: [
      'عند أدنى نقطة في المسار (موضع الاتزان θ = 0°)',
      'عند أعلى نقطة يصل إليها البندول في طرف المسار',
      'تكون السرعة والشد متساويين في جميع نقاط المسار',
      'عند منتصف المسافة بين القمة والقاع'
    ],
    optionsEn: [
      'At the lowest point (equilibrium position θ = 0°)',
      'At the highest turnaround points at the edges',
      'Velocity and tension are constant everywhere',
      'At the midpoint between peak and bottom'
    ],
    correctIndex: 0,
    explanationAr: 'عند أدنى نقطة (θ = 0) تتحول كل طاقة الوضع إلى طاقة حركة (أقصى سرعة)، وقوة الشد تساوي وزن الجسم زائداً القوة المركزية T = m(g + Lω²)، وهي أقصى قيمة للشد.',
    explanationEn: 'At the bottom (θ = 0), all potential energy is converted to kinetic (maximum velocity). Tension is T = m(g + Lω²), combining weight and centripetal force.'
  },
  {
    id: 'exp_resonance',
    titleAr: '5. ظاهرة الرنين والتردد الطبيعي (Resonance)',
    titleEn: '5. Forced Oscillation & Resonance Phenomenon',
    objectiveAr: 'ملاحظة التضخيم الهائل في سعة التأرجح عندما يتطابق تردد القوة المحركة الخارجية مع التردد الطبيعي للبندول (Ω ≈ ω₀).',
    objectiveEn: 'Observe massive amplitude amplification when external driving frequency matches the pendulum natural frequency (Ω ≈ ω₀).',
    descriptionAr: 'كل بندول له تردد طبيعي ω₀ = √(g/L). عند تسليط قوة دفع دورية صغيرة بنفس هذا التردد، يتم ضخ طاقة في النظام تدريجياً لترتفع السعة إلى مستويات مذهلة!',
    descriptionEn: 'Every pendulum has a natural frequency ω₀ = √(g/L). Driving it with periodic nudges at that exact rate continuously pumps energy, generating dramatic resonance amplitudes.',
    params: {
      length: 1.0,
      mass: 1.0,
      gravity: 9.807,
      damping: 0.05,
      initialThetaDeg: 5,
      drivingForce: 1.2,
      drivingFrequency: 3.13 // sqrt(9.807 / 1.0) approx 3.13 rad/s
    },
    questionAr: 'ما الشرط الأساسي لحدوث الرنين وتضخيم سعة البندول إلى أقصى حد؟',
    questionEn: 'What is the key condition for resonance and maximum amplitude amplification?',
    optionsAr: [
      'تساوي تردد القوة الخارجية مع التردد الطبيعي للبندول (Ω = ω₀)',
      'أن تكون كتلة البندول مساوية لطوله بالضبط',
      'انعدام تسارع الجاذبية في الفضاء',
      'أن تكون زاوية البداية مساوية لـ 90 درجة'
    ],
    optionsEn: [
      'External driving frequency equals natural frequency (Ω = ω₀)',
      'Pendulum mass exactly equals its string length',
      'Gravity must be zero in outer space',
      'The initial release angle must be 90 degrees'
    ],
    correctIndex: 0,
    explanationAr: 'الرنين يحدث عندما يُدفع النظام بتردده الطبيعي ω₀ = √(g/L). تنتقل الطاقة بكفاءة قصوى فتتضخم السعة.',
    explanationEn: 'Resonance occurs when the system is driven at its natural frequency ω₀ = √(g/L), transferring maximum energy per cycle.'
  },
  {
    id: 'exp_chaos',
    titleAr: '6. البندول المزدوج ونظرية الشواش (Chaos Theory)',
    titleEn: '6. Double Pendulum & Deterministic Chaos',
    objectiveAr: 'استكشاف السلوك الفوضوي الحتمي وحساسية النظام الفائقة للشروط الابتدائية (تأثير الفراشة).',
    objectiveEn: 'Explore deterministic chaos and extreme sensitivity to initial conditions (the Butterfly Effect).',
    descriptionAr: 'البندول المزدوج يخضع لقوانين نيوتن الدقيقة تماماً، ولكن حركته لا يمكن التنبؤ بها على المدى الطويل. فرق بمقدار 0.001 درجة في البداية ينتج عنه مسار مختلف تماماً بعد ثوان معدودة!',
    descriptionEn: 'Double pendulums follow classical physics deterministically, yet are fundamentally unpredictable over time due to exponential divergence of nearby trajectories.',
    params: {
      length: 1.0,
      mass: 1.0,
      gravity: 9.807,
      damping: 0.002,
      initialThetaDeg: 120
    },
    questionAr: 'لماذا يُعتبر البندول المزدوج نظاماً "شواشياً" رغم خضوعه لمعادلات فيزيائية محددة؟',
    questionEn: 'Why is the double pendulum deemed "chaotic" despite obeying exact classical equations?',
    optionsAr: [
      'لأن أي اختلاف متناهي الصغر في زاوية البداية يتضخم أسياً ليغير المسار كلياً',
      'لأن قوانين نيوتن لا تنطبق عليه',
      'لأن الطاقة لا تُحفظ فيه على الإطلاق',
      'لأن الجاذبية تتغير عشوائياً أثناء حركته'
    ],
    optionsEn: [
      'Because microscopic initial condition differences amplify exponentially',
      'Because Newton’s laws do not apply to it',
      'Because energy is not conserved at all',
      'Because gravity fluctuates randomly during motion'
    ],
    correctIndex: 0,
    explanationAr: 'الشواش الحتمي يعني أن النظام محكوم بمعادلات رياضية دقيقة، ولكن عدم اليقين المتناهي في الصغر يتضخم أسياً مع الزمن (أس ليازونوف الموجب).',
    explanationEn: 'Deterministic chaos means equations are exact, yet tiny uncertainties diverge exponentially over time (positive Lyapunov exponent).'
  }
];
