import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Info } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Navbar({ 
  player, 
  onUpdatePlayer, 
  onOpenRules,
  soundMuted,
  onToggleSound 
}) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (player?.playerId) {
      navigator.clipboard.writeText(player.playerId);
      setCopied(true);
      sounds.playFlip();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header style={{ width: '100%', maxWidth: '440px', margin: '0 auto', padding: '6px 10px 4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 30, height: '42px', boxSizing: 'border-box' }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img 
          src="./app-icon.png" 
          alt="Ahmed Logo"
          style={{ width: '32px', height: '32px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 3px 10px rgba(212, 175, 55, 0.4)', border: '1.5px solid #d4af37' }} 
        />
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '0.2px', lineHeight: 1.1 }}>
            Ahmed
          </h1>
          <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#d4af37', letterSpacing: '0.5px' }}>
            FOOTBALL LEGENDS
          </span>
        </div>
      </div>

      {/* Right controls: Profile ID & Sound */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Player ID Pill with Copy */}
        <button
          onClick={copyId}
          className="classic-pill"
          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#f8fafc', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)' }}
          title="اضغط لنسخ الآيدي الخاص بك"
        >
          <span style={{ fontSize: '13px' }}>{player?.avatar || '⚽'}</span>
          <span style={{ color: '#f5d061', fontFamily: 'monospace' }}>
            {player?.playerId || '...'}
          </span>
          {copied ? (
            <Check style={{ width: '13px', height: '13px', color: '#34d399' }} />
          ) : (
            <Copy style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="classic-pill"
          style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)' }}
          title={soundMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
        >
          {soundMuted ? (
            <VolumeX style={{ width: '15px', height: '15px', color: '#fb7185' }} />
          ) : (
            <Volume2 style={{ width: '15px', height: '15px', color: '#34d399' }} />
          )}
        </button>

        {/* Rules button */}
        <button
          onClick={onOpenRules}
          className="classic-pill"
          style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)' }}
          title="كيفية اللعب"
        >
          <Info style={{ width: '15px', height: '15px', color: '#60a5fa' }} />
        </button>
      </div>
    </header>
  );
}
