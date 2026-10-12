import React from 'react';
import { X, BookOpen, Layers } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface PhysicsFormulasModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const PhysicsFormulasModal: React.FC<PhysicsFormulasModalProps> = ({
  lang,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-800">{t.formulasTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* 1. The Non-Linear Differential Equation */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-2">
              {lang === 'ar' ? '1. معادلة الحركة التفاضلية غير الخطية' : '1. Non-Linear Equation of Motion'}
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              {lang === 'ar'
                ? 'تُشتق معادلة البندول بتطبيق قانون نيوتن الثاني للحركة الدورانية حول نقطة التعليق (Στ = I α):'
                : 'Derived via Newton’s second law for rotational dynamics about the pivot pin (Στ = I α):'}
            </p>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-center text-sm font-semibold text-sky-950 overflow-x-auto">
              θ″(t) + (b / m) θ′(t) + (g / L) sin(θ) = (F₀ / m L) cos(Ω t)
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-1">
              <div>• <strong>θ″(t)</strong>: {lang === 'ar' ? 'التسارع الزاوي' : 'Angular acceleration'} (d²θ/dt²)</div>
              <div>• <strong>(b/m) θ′(t)</strong>: {lang === 'ar' ? 'حد تخميد مقاومة المائع' : 'Damping drag term'}</div>
              <div>• <strong>(g/L) sin(θ)</strong>: {lang === 'ar' ? 'حد عزم إرجاع الجاذبية غير الخطي' : 'Non-linear gravitational restoring torque'}</div>
              <div>• <strong>F₀ cos(Ω t)</strong>: {lang === 'ar' ? 'قوة الدفع الدورية الخارجية للرنين' : 'Periodic external driving force'}</div>
            </div>
          </section>

          {/* 2. Small Angle Approximation */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-2">
              {lang === 'ar' ? '2. تقريب الزوايا الصغيرة (الحركة التوافقية البسيطة)' : '2. Small-Angle Harmonic Approximation'}
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              {lang === 'ar'
                ? 'عندما تكون سعة الاهتزاز صغيرة (θ < 15°)، يمكن استبدال sin(θ) بـ θ بالراديان، فتتحول المعادلة إلى حركة توافقية خطية:'
                : 'For small amplitudes (θ < 15°), sin(θ) ≈ θ in radians, yielding simple harmonic motion (SHM):'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center font-mono text-sm font-semibold">
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-900">
                ω₀ = √(g / L)
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-sky-800">
                T₀ = 2π √(L / g)
              </div>
            </div>
          </section>

          {/* 3. Large Angle Elliptic Integral */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-2">
              {lang === 'ar' ? '3. الحل الدقيق للزوايا الكبيرة (متسلسلة بوردا وتكامل إليبتيك)' : '3. Exact Large-Angle Period (Complete Elliptic Integral)'}
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              {lang === 'ar'
                ? 'لأي زاوية إطلاق ابتدائية θ₀ حتى 179°، يُحسب الزمن الدوري بدقة عبر تكامل ليجاندر الإهليلجي التام من النوع الأول K(k):'
                : 'For arbitrary initial amplitudes θ₀, exact period is governed by Legendre’s complete elliptic integral of the first kind K(k):'}
            </p>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-center text-xs sm:text-sm font-semibold text-purple-900 overflow-x-auto">
              T = T₀ [ 1 + (1/4) sin²(θ₀/2) + (9/64) sin⁴(θ₀/2) + (25/256) sin⁶(θ₀/2) + ... ]
            </div>
          </section>

          {/* 4. Energy & Tension */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-2">
              {lang === 'ar' ? '4. حفظ الطاقة وقوة الشد في الخيط' : '4. Mechanical Energy & String Tension'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs text-center font-semibold mb-3">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-sky-700">
                Ek = ½ m L² ω²
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-amber-700">
                Ep = m g L (1 - cos θ)
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-emerald-700">
                T = m [ g cos θ + L ω² ]
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'تصل قوة الشد في الخيط T والسرعة الخطية v لأقصى قيمة عند موضع الاتزان θ = 0° حيث تتحول كامل طاقة الوضع إلى طاقة حركة.'
                : 'String tension T and linear velocity v peak at the equilibrium bottom θ = 0°, where all potential energy is converted to kinetic.'}
            </p>
          </section>

          {/* 5. Double Pendulum Lagrangian */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-2">
              {lang === 'ar' ? '5. ميكانيكا لاغرانج للبندول المزدوج والشواش' : '5. Double Pendulum Lagrangian & Deterministic Chaos'}
            </h3>
            <p className="text-xs text-slate-600 mb-2">
              {lang === 'ar'
                ? 'باستخدام دالة لاغرانج L = T - V والإحداثيات المعممة (θ₁, θ₂)، نحصل على نظام معادلتين تفاضليتين مقترنتين غير خطيتين تتسمان بحساسية متطرفة للشروط الابتدائية (أس ليازونوف موجب)، مما ينتج الشواش الحتمي.'
                : 'Using Lagrangian mechanics L = T - V with generalized coordinates (θ₁, θ₂), we obtain two non-linear coupled differential equations possessing positive Lyapunov exponents—the hallmark of deterministic chaos.'}
            </p>
          </section>

          {/* 6. Five World Phenomena Equations */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-2">
              {lang === 'ar' ? '6. قوانين الظواهر الفيزيائية العالمية الخمس' : '6. Formulations of the Five World Phenomena'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono font-medium text-slate-800">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block mb-0.5">{lang === 'ar' ? 'بندول فوكو:' : 'Foucault Precession:'}</span>
                ω_p = (15°/h) × sin(φ)
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block mb-0.5">{lang === 'ar' ? 'بندول نيوتن:' : 'Newton’s Cradle:'}</span>
                Σp_i = const , ΣEk_i = const
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block mb-0.5">{lang === 'ar' ? 'شقا يونغ:' : 'Young’s Fringes:'}</span>
                Δy = (λ × D) / d
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block mb-0.5">{lang === 'ar' ? 'الكهروضوئية:' : 'Photoelectric:'}</span>
                K_max = hν - Φ = e × V₀
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 sm:col-span-2">
                <span className="text-[10px] text-slate-500 block mb-0.5">{lang === 'ar' ? 'قطرة ميليكان وتكميم الشحنة:' : 'Millikan Charge Quantization:'}</span>
                q = n × e = (m × g × d) / V_eq (e = 1.602 × 10⁻¹⁹ C)
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
