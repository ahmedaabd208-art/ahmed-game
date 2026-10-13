import React, { useState } from 'react';
import { Users, Swords, Plus, LogIn, ChevronRight, Trophy, Smartphone, Download, Share2, Check } from 'lucide-react';
import { DIFFICULTY_PRESETS } from '../data/players';
import { sounds } from '../utils/audio';

const AVATARS = ['⚽', '👑', '🦁', '🔥', '🏆', '⭐', '🦅', '🎯', '🚀', '🌟'];

export default function HomeLobby({
  player,
  onUpdatePlayer,
  onStartSolo,
  onStartPassAndPlay,
  onStartVsAi,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onOpenInstallModal
}) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState(player?.name || 'Ahmed');
  const [isEditingName, setIsEditingName] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  const handleCreateRoom = () => {
    sounds.playFlip();
    onCreateOnlineRoom(selectedDifficulty);
    setShowCreateModal(false);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    sounds.playFlip();
    onJoinOnlineRoom(joinCodeInput.trim().toUpperCase());
    setShowJoinModal(false);
  };

  const saveName = () => {
    if (playerNameInput.trim()) {
      onUpdatePlayer({ ...player, name: playerNameInput.trim() });
      setIsEditingName(false);
      sounds.playMatch();
    }
  };

  const handleShareAppDirect = async (isWhatsapp = false) => {
    sounds.playFlip();
    const appUrl = window.location.origin;
    const text = `⚽ العب الآن لعبة Ahmed لتخمين أساطير كرة القدم!\nلعبة خفيفة وسريعة وتناسب شاشة الهاتف بالكامل:\n${appUrl}`;

    if (isWhatsapp) {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تحدي أساطير كرة القدم',
          text,
          url: appUrl
        });
        return;
      } catch (e) {}
    }

    navigator.clipboard.writeText(appUrl);
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 3000);
  };

  return (
    <div 
      style={{ 
        width: '100%', 
        maxWidth: '430px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        height: 'calc(100dvh - 42px)', 
        maxHeight: 'calc(100dvh - 42px)', 
        overflow: 'hidden', 
        padding: '2px 8px env(safe-area-inset-bottom, 6px) 8px',
        boxSizing: 'border-box'
      }}
    >
      
      {/* Toast Notification */}
      {sharedToast && (
        <div style={{ backgroundColor: '#059669', color: '#ffffff', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, textAlign: 'center', animation: 'fadeIn 0.2s ease', flexShrink: 0 }}>
          ✅ تم نسخ رابط اللعبة بنجاح! أرسله لأي صديق
        </div>
      )}

      {/* 1. Player Identity Bar (Compact) */}
      <div className="classic-card" style={{ padding: '8px 12px', position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2.5px', background: 'linear-gradient(90deg, #d4af37, #10b981, #2563eb)' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          {/* Avatar */}
          <button
            onClick={() => {
              setShowAvatarPicker(!showAvatarPicker);
              sounds.playFlip();
            }}
            style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1.5px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
            title="تغيير الشعار"
          >
            <span>{player?.avatar || '⚽'}</span>
            <span style={{ position: 'absolute', bottom: '-3px', right: '-3px', backgroundColor: '#d4af37', color: '#1a1303', fontSize: '7.5px', fontWeight: 900, padding: '1px 3px', borderRadius: '4px' }}>
              تعديل
            </span>
          </button>

          {/* Name & ID */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="text"
                  maxLength={15}
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', color: '#ffffff', fontSize: '11.5px', fontWeight: 700, padding: '3px 6px', borderRadius: '6px', border: '1px solid #d4af37', outline: 'none' }}
                  autoFocus
                />
                <button
                  onClick={saveName}
                  style={{ backgroundColor: '#d4af37', color: '#0f172a', padding: '3px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 900, border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  حفظ
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 900, color: '#ffffff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {player?.name || 'كابتن كرة القدم'}
                </h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '10px', flexShrink: 0 }}
                  title="تعديل الاسم"
                >
                  ✎
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>آيدي اللاعب:</span>
              <span style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#f5d061', fontFamily: 'monospace', fontSize: '10px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                {player?.playerId || '...'}
              </span>
            </div>
          </div>
        </div>

        {/* Avatar Selector Dropdown */}
        {showAvatarPicker && (
          <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => {
                  onUpdatePlayer({ ...player, avatar: av });
                  setShowAvatarPicker(false);
                  sounds.playFlip();
                }}
                style={{ width: '28px', height: '28px', borderRadius: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: player?.avatar === av ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.1)', backgroundColor: player?.avatar === av ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)' }}
              >
                {av}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. QUICK ACTIONS: Install to Phone Screen & Share Direct Link */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', flexShrink: 0 }}>
        <button
          onClick={onOpenInstallModal}
          className="classic-pill"
          style={{ padding: '7px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: '#f5d061', cursor: 'pointer', border: '1px solid rgba(212, 175, 55, 0.35)' }}
        >
          <Download style={{ width: '14px', height: '14px' }} />
          <span>تنزيل على الشاشة 📲</span>
        </button>

        <button
          onClick={() => handleShareAppDirect(false)}
          className="classic-pill"
          style={{ padding: '7px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: '#60a5fa', cursor: 'pointer', border: '1px solid rgba(59, 130, 246, 0.35)' }}
        >
          <Share2 style={{ width: '14px', height: '14px' }} />
          <span>مشاركة رابط اللعبة 🔗</span>
        </button>
      </div>

      {/* 3. DYNAMIC CARD SIZE / DIFFICULTY SELECTOR */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#d4af37', marginBottom: '3px', paddingRight: '2px', display: 'flex', justifyContent: 'space-between' }}>
          <span>حجم وعدد الكروت (تكبير تلقائي):</span>
          <span style={{ color: '#94a3b8' }}>تناسب الشاشة بدقة 📱</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {Object.values(DIFFICULTY_PRESETS).map((diff) => {
            const isSelected = selectedDifficulty === diff.id;
            const subtitle = diff.id === 'easy' ? 'كروت كبيرة 🌟' : diff.id === 'medium' ? 'كروت وسط ⚡' : 'كروت مدمجة 🔥';
            const countLabel = diff.id === 'easy' ? '8 كروت' : diff.id === 'medium' ? '12 كرت' : '16 كرت';

            return (
              <button
                key={diff.id}
                onClick={() => {
                  setSelectedDifficulty(diff.id);
                  sounds.playFlip();
                }}
                style={{ 
                  padding: '5px 2px', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  border: isSelected ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.1)', 
                  backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.22)' : 'rgba(255, 255, 255, 0.04)', 
                  color: isSelected ? '#f5d061' : '#cbd5e1',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '10.5px', fontWeight: 900 }}>{countLabel}</div>
                <div style={{ fontSize: '8.5px', fontWeight: 700, color: isSelected ? '#fbbf24' : '#64748b' }}>{subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. GAME MODES (Compact & High Impact) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
        
        {/* Mode 1: Online Multiplayer (1v1) */}
        <div className="classic-card" style={{ padding: '8px 10px', border: '1.5px solid rgba(37, 99, 235, 0.45)', background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.28) 0%, rgba(15, 23, 42, 0.75) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                <Swords style={{ width: '15px', height: '15px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  تحدي أونلاين مع الأصدقاء
                </h4>
                <p style={{ fontSize: '9.5px', color: '#94a3b8', margin: 0 }}>
                  برابط مباشر سريع أو كود الغرفة
                </p>
              </div>
            </div>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#93c5fd', backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '2px 5px', borderRadius: '4px' }}>
              1v1 أونلاين
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <button
              onClick={() => {
                sounds.playFlip();
                setShowCreateModal(true);
              }}
              className="btn-navy"
              style={{ fontSize: '11px', padding: '7px 4px', borderRadius: '10px' }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              <span>إنشاء غرفة</span>
            </button>

            <button
              onClick={() => {
                sounds.playFlip();
                setShowJoinModal(true);
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', fontWeight: 800, fontSize: '11px', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '7px 4px', cursor: 'pointer' }}
            >
              <LogIn style={{ width: '14px', height: '14px', color: '#60a5fa' }} />
              <span>انضمام لصديق</span>
            </button>
          </div>
        </div>

        {/* Mode 2: Pass & Play (Local 2 Players) */}
        <button
          onClick={() => {
            sounds.playFlip();
            onStartPassAndPlay(selectedDifficulty);
          }}
          className="classic-card"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'right', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(225, 29, 72, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185', flexShrink: 0 }}>
              <Smartphone style={{ width: '16px', height: '16px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>لعب زوجي على نفس الهاتف</span>
                <span style={{ fontSize: '8px', color: '#fda4af', backgroundColor: 'rgba(225, 29, 72, 0.15)', padding: '1px 4px', borderRadius: '3px' }}>بدون نت</span>
              </div>
              <p style={{ fontSize: '9.5px', color: '#94a3b8', margin: 0 }}>تناوب الأدوار مع صديقك بجوارك على نفس الشاشة</p>
            </div>
          </div>
          <ChevronRight style={{ width: '15px', height: '15px', color: '#64748b', transform: 'rotate(180deg)' }} />
        </button>

        {/* Mode 3: Solo Speedrun */}
        <button
          onClick={() => {
            sounds.playFlip();
            onStartSolo(selectedDifficulty);
          }}
          className="classic-card"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'right', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
              <Trophy style={{ width: '16px', height: '16px' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>التحدي الفردي والسرعة</div>
              <p style={{ fontSize: '9.5px', color: '#94a3b8', margin: 0 }}>تحدَّ الوقت واكشف أزواج النجوم بأقل محاولات</p>
            </div>
          </div>
          <ChevronRight style={{ width: '15px', height: '15px', color: '#64748b', transform: 'rotate(180deg)' }} />
        </button>

      </div>

      {/* MODAL: Create Online Room */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="classic-card" style={{ width: '100%', maxWidth: '330px', padding: '16px', border: '1.5px solid #d4af37' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users style={{ width: '16px', height: '16px', color: '#d4af37' }} />
              إنشاء غرفة أونلاين جديدة
            </h3>
            <p style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '10px' }}>
              اختر عدد الكروت وثواني الحفظ لتبدأ التحدي مع صديقك:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '14px' }}>
              {Object.values(DIFFICULTY_PRESETS).map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  style={{ padding: '6px', fontSize: '10px', fontWeight: 800, borderRadius: '8px', cursor: 'pointer', border: selectedDifficulty === diff.id ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.1)', backgroundColor: selectedDifficulty === diff.id ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.06)', color: '#ffffff' }}
                >
                  {diff.title}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleCreateRoom}
                className="btn-gold"
                style={{ flex: 1, fontSize: '12px', padding: '9px' }}
              >
                تأكيد وبدء الغرفة
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ padding: '9px 12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontWeight: 700, fontSize: '11px', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Join Room */}
      {showJoinModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={handleJoinRoom} className="classic-card" style={{ width: '100%', maxWidth: '330px', padding: '16px', border: '1.5px solid #2563eb' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogIn style={{ width: '16px', height: '16px', color: '#60a5fa' }} />
              الانضمام لغرفة صديق
            </h3>
            <p style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '10px' }}>
              أدخل كود الغرفة (5 أرقام) أو الآيدي الخاص بصديقك:
            </p>

            <input
              type="text"
              placeholder="كود الغرفة أو آيدي الصديق..."
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.6)', border: '2px solid #2563eb', borderRadius: '8px', padding: '8px', textAlign: 'center', color: '#ffffff', fontFamily: 'monospace', fontSize: '15px', fontWeight: 900, letterSpacing: '2px', outline: 'none', marginBottom: '12px' }}
              autoFocus
            />

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="submit"
                disabled={!joinCodeInput.trim()}
                className="btn-navy"
                style={{ flex: 1, fontSize: '12px', padding: '9px', opacity: !joinCodeInput.trim() ? 0.5 : 1 }}
              >
                دخول الغرفة
              </button>
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                style={{ padding: '9px 12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontWeight: 700, fontSize: '11px', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
