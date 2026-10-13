import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Share2, Users, ArrowRight, ShieldCheck, Clock, QrCode as QrIcon, Send, Smartphone } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function MultiplayerLobby({
  room,
  currentSocketId,
  onToggleReady,
  onLeaveRoom
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isHost = room?.hostSocketId === currentSocketId;
  const currentPlayer = room?.players?.find(p => p.socketId === currentSocketId);
  const isReady = currentPlayer ? room?.ready[currentPlayer.playerId] : false;

  const joinUrl = `${window.location.origin}/?join=${room?.code}`;

  useEffect(() => {
    if (room?.code) {
      QRCode.toDataURL(joinUrl, { width: 220, margin: 1, color: { dark: '#020617', light: '#ffffff' } })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [room?.code, joinUrl]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room?.code);
    setCopiedCode(true);
    sounds.playFlip();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareDirectLink = async (isWhatsapp = false) => {
    sounds.playFlip();
    const shareText = `⚽ تحداني الآن في لعبة Ahmed لتخمين أساطير كرة القدم!\nاضغط على الرابط المباشر للدخول فوراً واللعب معي:\n${joinUrl}`;

    if (isWhatsapp) {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تحدي أساطير كرة القدم',
          text: shareText,
          url: joinUrl
        });
        return;
      } catch (err) {
        // User cancelled or fallback
      }
    }

    // Fallback: Clipboard copy + Toast
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setToastMessage('✅ تم نسخ الرابط المباشر بنجاح! أرسله لصديقك');
    setTimeout(() => {
      setCopiedLink(false);
      setToastMessage('');
    }, 3500);
  };

  return (
    <div style={{ width: '100%', maxWidth: '430px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100dvh - 42px)', maxHeight: 'calc(100dvh - 42px)', overflow: 'hidden', padding: '4px 8px env(safe-area-inset-bottom, 8px) 8px', boxSizing: 'border-box' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{ backgroundColor: '#059669', color: '#ffffff', padding: '6px 12px', borderRadius: '10px', fontSize: '11.5px', fontWeight: 800, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease', flexShrink: 0 }}>
          {toastMessage}
        </div>
      )}

      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button
          onClick={onLeaveRoom}
          className="classic-pill"
          style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
        >
          <ArrowRight style={{ width: '13px', height: '13px' }} />
          <span>مغادرة الغرفة</span>
        </button>
        <div className="classic-pill" style={{ padding: '4px 10px', fontSize: '10.5px', color: '#60a5fa', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users style={{ width: '12px', height: '12px' }} />
          <span>غرفة أونلاين خاصة</span>
        </div>
      </div>

      {/* Room Code & Direct Invite Card */}
      <div className="classic-card" style={{ padding: '12px 14px', textAlign: 'center', position: 'relative', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '3px' }}>
          كود الغرفة للمشاركة
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '4px 0 10px 0' }}>
          <span style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '4px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 16px', borderRadius: '12px', border: '1.5px solid #d4af37' }}>
            {room?.code}
          </span>
          <button
            onClick={copyRoomCode}
            style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="نسخ كود الغرفة"
          >
            {copiedCode ? <Check style={{ width: '18px', height: '18px', color: '#34d399' }} /> : <Copy style={{ width: '18px', height: '18px' }} />}
          </button>
        </div>

        {/* PRIMARY ACTION: SEND DIRECT LINK TO FRIEND */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '6px' }}>
          <button
            onClick={() => handleShareDirectLink(true)}
            className="btn-gold"
            style={{ fontSize: '11.5px', padding: '9px 6px', borderRadius: '12px', gap: '5px' }}
          >
            <span>💬 إرسال واتساب</span>
          </button>
          <button
            onClick={() => handleShareDirectLink(false)}
            className="btn-navy"
            style={{ fontSize: '11.5px', padding: '9px 6px', borderRadius: '12px', gap: '5px' }}
          >
            <Share2 style={{ width: '15px', height: '15px' }} />
            <span>{copiedLink ? 'تم النسخ!' : 'مشاركة الرابط'}</span>
          </button>
        </div>

        {/* Direct Link Preview Box */}
        <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '5px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr' }}>
            {joinUrl}
          </span>
          {qrDataUrl && (
            <button
              onClick={() => setShowQrModal(true)}
              style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}
            >
              <QrIcon style={{ width: '12px', height: '12px' }} />
              <span>QR</span>
            </button>
          )}
        </div>
      </div>

      {/* Players in Room */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
        <h4 style={{ fontSize: '10.5px', fontWeight: 800, color: '#94a3b8', margin: 0 }}>اللاعبون في الغرفة:</h4>

        {/* Host */}
        {room?.players?.[0] ? (
          <div className="classic-card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.2)', border: '1.5px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                {room.players[0].avatar}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#ffffff' }}>{room.players[0].name}</span>
                  <span style={{ fontSize: '8.5px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>المضيف 👑</span>
                </div>
                <span style={{ fontSize: '9.5px', color: '#94a3b8', fontFamily: 'monospace' }}>{room.players[0].playerId}</span>
              </div>
            </div>

            <div>
              {room.ready[room.players[0].playerId] ? (
                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck style={{ width: '12px', height: '12px' }} />
                  جاهز
                </span>
              ) : (
                <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock style={{ width: '12px', height: '12px' }} />
                  غير جاهز
                </span>
              )}
            </div>
          </div>
        ) : null}

        {/* Guest */}
        {room?.players?.[1] ? (
          <div className="classic-card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(225, 29, 72, 0.2)', border: '1.5px solid #e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                {room.players[1].avatar}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#ffffff' }}>{room.players[1].name}</span>
                  <span style={{ fontSize: '8.5px', backgroundColor: 'rgba(225, 29, 72, 0.2)', color: '#fda4af', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>الضيف</span>
                </div>
                <span style={{ fontSize: '9.5px', color: '#94a3b8', fontFamily: 'monospace' }}>{room.players[1].playerId}</span>
              </div>
            </div>

            <div>
              {room.ready[room.players[1].playerId] ? (
                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck style={{ width: '12px', height: '12px' }} />
                  جاهز
                </span>
              ) : (
                <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock style={{ width: '12px', height: '12px' }} />
                  غير جاهز
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="classic-card" style={{ padding: '10px', border: '1.5px dashed rgba(255,255,255,0.2)', textAlign: 'center', color: '#94a3b8' }}>
            <Users style={{ width: '18px', height: '18px', margin: '0 auto 2px auto', opacity: 0.6 }} />
            <div style={{ fontSize: '11px', fontWeight: 800 }}>بانتظار انضمام صديقك عبر الرابط المباشر أو الكود...</div>
          </div>
        )}
      </div>

      {/* Ready Button */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        <button
          onClick={() => {
            sounds.playFlip();
            onToggleReady();
          }}
          disabled={room?.players?.length < 2}
          className={isReady ? 'btn-gold' : 'btn-navy'}
          style={{ width: '100%', padding: '11px', fontSize: '13px', opacity: room?.players?.length < 2 ? 0.5 : 1, cursor: room?.players?.length < 2 ? 'not-allowed' : 'pointer', borderRadius: '14px' }}
        >
          {room?.players?.length < 2 ? (
            'بانتظار انضمام اللاعب الثاني للبدء'
          ) : isReady ? (
            'إلغاء الاستعداد (أنا جاهز)'
          ) : (
            '⚡ أنا جاهز لبدء التحدي!'
          )}
        </button>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="classic-card" style={{ width: '100%', maxWidth: '300px', padding: '20px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', margin: '0 0 6px 0' }}>امسح الكود بكاميرا الموبايل</h4>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 14px 0' }}>وجه كاميرا هاتف صديقك للدخول للغرفة فوراً</p>

            <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '16px', display: 'inline-block', marginBottom: '14px' }}>
              <img src={qrDataUrl} alt="Room QR" style={{ width: '180px', height: '180px', display: 'block' }} />
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="btn-navy"
              style={{ width: '100%', padding: '8px', fontSize: '12px' }}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
