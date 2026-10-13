import React from 'react';
import { Smartphone, Share, PlusSquare, CheckCircle, X, Download } from 'lucide-react';

export default function InstallModal({ onClose, hasPrompt, onTriggerPrompt }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="classic-card" style={{ width: '100%', maxWidth: '370px', padding: '16px', position: 'relative' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '12px', left: '12px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X style={{ width: '15px', height: '15px' }} />
        </button>

        {/* App Icon & Name Preview Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', backgroundColor: 'rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: '14px', border: '1.5px solid rgba(212, 175, 55, 0.4)' }}>
          <img 
            src="/app-icon.png" 
            alt="Ahmed App Icon" 
            style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)', border: '1.5px solid #d4af37' }} 
          />
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '0.3px' }}>
              Ahmed
            </h3>
            <p style={{ fontSize: '10.5px', color: '#cbd5e1', margin: '2px 0 0 0' }}>
              تثبيت اللعبة كتطبيق مباشر على شاشة الهاتف 📲
            </p>
          </div>
        </div>

        {hasPrompt && (
          <button
            onClick={() => {
              onTriggerPrompt?.();
              onClose();
            }}
            className="btn-gold"
            style={{ width: '100%', marginBottom: '12px', padding: '10px', fontSize: '13px' }}
          >
            <span>📲 تثبيت فوري الآن على الهاتف</span>
          </button>
        )}

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* iOS Safari */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#f5d061', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>🍎</span>
              <span>لمستخدمي آيفون (Safari):</span>
            </div>
            <ol style={{ margin: 0, paddingRight: '16px', fontSize: '10.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
              <li>اضغط على زر <strong>المشاركة (Share ⎋)</strong> أسفل شاشة Safari.</li>
              <li>اختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen ➕)</strong>.</li>
              <li>اضغط <strong>"إضافة" (Add)</strong> في الزاوية العلوية.</li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#60a5fa', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>🤖</span>
              <span>لمستخدمي أندرويد (Chrome):</span>
            </div>
            <ol style={{ margin: 0, paddingRight: '16px', fontSize: '10.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
              <li>اضغط على قائمة الثلاث نقاط <strong>(⋮)</strong> أعلى المتصفح.</li>
              <li>اختر <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</li>
            </ol>
          </div>

        </div>

        <button
          onClick={onClose}
          className="btn-navy"
          style={{ width: '100%', marginTop: '12px', padding: '9px', fontSize: '12px' }}
        >
          فهمت ذلك، شكراً!
        </button>

      </div>
    </div>
  );
}
