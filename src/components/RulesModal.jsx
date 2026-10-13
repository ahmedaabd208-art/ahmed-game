import React from 'react';
import { Eye, Swords, Zap, CheckCircle2, X } from 'lucide-react';

export default function RulesModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-5 border border-slate-700 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
          <span>⚽</span>
          قواعد لعبة تحدي الأساطير
        </h3>

        <div className="space-y-3.5 text-xs text-slate-300">
          
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block font-black">1. مرحلة الحفظ السريع:</strong>
              تظهر الكروت مكشوفة في البداية لمدة 3 إلى 4 ثوانٍ. استغل الوقت لحفظ أماكن أزواج اللاعبين المتشابهين في ذاكرتك!
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block font-black">2. التخمين واكتشاف الأزواج:</strong>
              اضغط على كرتين؛ إذا تطابق اللاعبان، تكسب 100 نقطة ويبقى الكرتان مكشوفين ويستمر دورك. وإذا اختلفا، يقلبان وينتقل الدور.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block font-black">3. اللعب الزوجي مع الأصدقاء:</strong>
              أنشئ غرفة وشارك كود الغرفة أو رابط الدعوة أو امسح كود الـ QR بكاميرا الهاتف للعب المباشر في أي مكان!
            </div>
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          فهمت القواعد، فلنبدأ!
        </button>

      </div>
    </div>
  );
}
