import React from 'react';
import { FOOTBALL_PLAYERS } from '../data/players';

export default function Card({ 
  card, 
  isFlipped, 
  isMatched, 
  matchedBy, 
  isShaking, 
  onClick, 
  disabled,
  player1Id,
  player2Id,
  p1Name = 'اللاعب 1',
  p2Name = 'اللاعب 2',
  sizeVariant = 'medium' // 'large' | 'medium' | 'compact'
}) {
  const playerData = FOOTBALL_PLAYERS.find(p => p.id === card.playerId) || {
    name: 'أسطورة كرة القدم',
    rating: 90,
    club: 'أساطير العالم',
    flag: '⚽',
    position: 'FW',
    avatar: './players/messi.jpg'
  };

  const isMatchedByP1 = matchedBy && matchedBy === player1Id;
  const isMatchedByP2 = matchedBy && matchedBy === player2Id;

  // Responsive sizes based on cards count
  const isLarge = sizeVariant === 'large';
  const isCompact = sizeVariant === 'compact';

  const avatarSize = isLarge ? 58 : isCompact ? 32 : 44;
  const ratingSize = isLarge ? 15 : isCompact ? 10.5 : 12.5;
  const nameSize = isLarge ? 13 : isCompact ? 9 : 11;
  const clubSize = isLarge ? 10 : isCompact ? 7 : 8.5;
  const flagSize = isLarge ? 17 : isCompact ? 12 : 14;

  return (
    <div 
      className={`card-tile ${isShaking ? 'shake' : ''}`}
      onClick={() => {
        if (!disabled && !isFlipped && !isMatched) {
          onClick();
        }
      }}
      style={{ width: '100%', height: '100%', minHeight: 0, minWidth: 0 }}
    >
      <div className={`card-flipper-3d ${isFlipped || isMatched ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}>
        
        {/* CARD BACK: Tactile mint/cyan gradient */}
        <div className="card-side card-side-back">
          <div 
            className="card-back-icon-circle"
            style={{ 
              width: isLarge ? '48px' : isCompact ? '34px' : '40px', 
              height: isLarge ? '48px' : isCompact ? '34px' : '40px' 
            }}
          >
            <svg 
              viewBox="0 0 24 24" 
              style={{ 
                width: isLarge ? '24px' : isCompact ? '18px' : '20px', 
                height: isLarge ? '24px' : isCompact ? '18px' : '20px', 
                color: '#ffffff' 
              }} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="12 6 15.5 8.5 14 12.5 10 12.5 8.5 8.5" fill="currentColor" fillOpacity="0.3" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="21.5" y1="9" x2="15.5" y2="8.5" />
              <line x1="18" y1="18" x2="14" y2="12.5" />
              <line x1="6" y1="18" x2="10" y2="12.5" />
              <line x1="2.5" y1="9" x2="8.5" y2="8.5" />
            </svg>
          </div>
        </div>

        {/* CARD FRONT: Classic Football Player Card with Real Authentic Photo */}
        <div 
          className="card-side card-side-front" 
          style={{ 
            padding: isLarge ? '5px 8px' : isCompact ? '2px 3px' : '3px 6px',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          
          {/* Matched player ribbon if 2-player mode */}
          {isMatched && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: isMatchedByP1 ? '#1d4ed8' : isMatchedByP2 ? '#be185d' : '#059669',
                color: '#ffffff',
                fontSize: isCompact ? '7.5px' : '9px',
                fontWeight: 900,
                textAlign: 'center',
                padding: '1px 0',
                zIndex: 10
              }}
            >
              {isMatchedByP1 ? `✓ ${p1Name}` : isMatchedByP2 ? `✓ ${p2Name}` : '✓ تطابق'}
            </div>
          )}

          {/* Top Bar: Rating, Position, Flag */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: isMatched ? '8px' : '0px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ fontSize: `${ratingSize}px`, fontWeight: 900, color: '#b45309', fontFamily: 'monospace' }}>
                {playerData.rating}
              </span>
              <span style={{ fontSize: `${isCompact ? 7.5 : 9}px`, fontWeight: 800, color: '#475569' }}>
                {playerData.position}
              </span>
            </div>
            <span style={{ fontSize: `${flagSize}px`, lineHeight: 1 }}>
              {playerData.flag}
            </span>
          </div>

          {/* Center: Real Player Portrait */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', margin: '1px 0' }}>
            <div 
              style={{
                width: `${avatarSize}px`,
                height: `${avatarSize}px`,
                borderRadius: '50%',
                overflow: 'hidden',
                border: isCompact ? '1.5px solid #d4af37' : '2px solid #d4af37',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <img 
                src={playerData.avatar?.startsWith('/') ? '.' + playerData.avatar : (playerData.avatar || `./players/${playerData.id}.jpg`)} 
                alt={playerData.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                loading="eager"
                onError={(e) => {
                  if (!e.target.dataset.retried) {
                    e.target.dataset.retried = 'true';
                    e.target.src = `./players/${playerData.id}.jpg`;
                    return;
                  }
                  if (!e.target.dataset.retriedAbsolute) {
                    e.target.dataset.retriedAbsolute = 'true';
                    e.target.src = `/ahmed-game/players/${playerData.id}.jpg`;
                    return;
                  }
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `<span style="font-size:${isCompact ? 14 : 18}px">${playerData.flag || '⚽'}</span>`;
                }}
              />
            </div>
          </div>

          {/* Bottom Bar: Player Name & Club */}
          <div style={{ textAlign: 'center', width: '100%', paddingBottom: '1px', flexShrink: 0 }}>
            <div style={{ fontSize: `${nameSize}px`, fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.15 }}>
              {playerData.name}
            </div>
            <div style={{ fontSize: `${clubSize}px`, fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1 }}>
              {playerData.club}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
