import React from 'react';
import Card from './Card';
import { Timer, Zap, RotateCcw, ArrowRight } from 'lucide-react';

const QUICK_REACTIONS = ['⚽', '🔥', '🏆', '👏', '😱', '😂'];

export default function GameBoard({
  mode, // 'online' | 'pass_and_play' | 'solo' | 'ai'
  deck,
  isFlashing,
  flashCountdown,
  player1,
  player2,
  currentTurnPlayerId,
  scores,
  flippedIndices,
  shakingIndices = [],
  onCardClick,
  onLeaveGame,
  onRestartGame,
  timerSeconds = 0,
  movesCount = 0,
  activeReaction = null,
  onSendReaction = null
}) {
  const isMyTurn = currentTurnPlayerId === player1?.playerId;
  const is2Player = mode !== 'solo';

  // Dynamic grid setup based on card count
  // <=6 cards -> 2 cols x 3 rows (large cards)
  // 8 cards -> 2 cols x 4 rows (large cards)
  // 12 cards -> 3 cols x 4 rows (medium cards)
  // 16 cards -> 4 cols x 4 rows (compact cards)
  const is6 = deck.length <= 6;
  const is8 = deck.length > 6 && deck.length <= 8;
  const is12 = deck.length > 8 && deck.length <= 12;
  const is16 = deck.length > 12;

  const gridClass = is6 ? 'grid-6' : is8 ? 'grid-8' : is12 ? 'grid-12' : 'grid-16';
  const sizeVariant = is6 ? 'large' : is8 ? 'large' : is12 ? 'medium' : 'compact';

  return (
    <div className="game-screen-fixed">
      
      {/* 1. Compact Top Bar */}
      <div className="game-top-bar">
        <button
          onClick={onLeaveGame}
          className="classic-pill compact-btn"
          title="الخروج للقائمة الرئيسية"
        >
          <ArrowRight style={{ width: '13px', height: '13px' }} />
          <span>خروج</span>
        </button>

        {mode === 'solo' ? (
          <div className="classic-pill compact-status">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399' }}>
              <Timer style={{ width: '13px', height: '13px' }} />
              <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
            <div style={{ color: '#475569' }}>|</div>
            <div style={{ color: '#f59e0b' }}>
              {movesCount} محاولة
            </div>
          </div>
        ) : (
          <div>
            {isFlashing ? (
              <span className="flash-badge animate-pulse">
                ⏳ احفظ أماكن النجوم الآن!
              </span>
            ) : isMyTurn ? (
              <span className="turn-badge my-turn">
                🟢 دورك الآن! اختر كرتين
              </span>
            ) : (
              <span className="turn-badge other-turn">
                ⏳ دور {currentTurnPlayerId === player2?.playerId ? player2?.name : 'الخصم'}...
              </span>
            )}
          </div>
        )}

        {mode === 'solo' ? (
          <button
            onClick={onRestartGame}
            className="classic-pill compact-btn"
            title="إعادة المحاولة"
          >
            <RotateCcw style={{ width: '13px', height: '13px' }} />
          </button>
        ) : (
          <div style={{ width: '32px' }} />
        )}
      </div>

      {/* 2. Compact Scoreboard in 2-Player */}
      {is2Player && (
        <div className="classic-card compact-scoreboard">
          {/* Player 1 */}
          <div className={`player-score-box ${currentTurnPlayerId === player1?.playerId ? 'active-p1' : ''}`}>
            <span style={{ fontSize: '18px' }}>{player1?.avatar || '⚽'}</span>
            <div style={{ overflow: 'hidden' }}>
              <div className="player-score-name">{player1?.name || 'اللاعب 1'}</div>
              <div className="player-score-val p1-val">{scores[player1?.playerId] || 0} نقطة</div>
            </div>
          </div>

          {/* VS Badge */}
          <div className="vs-badge">VS</div>

          {/* Player 2 */}
          <div className={`player-score-box p2-box ${currentTurnPlayerId === player2?.playerId ? 'active-p2' : ''}`}>
            <span style={{ fontSize: '18px' }}>{player2?.avatar || '🏆'}</span>
            <div style={{ overflow: 'hidden' }}>
              <div className="player-score-name">{player2?.name || 'اللاعب 2'}</div>
              <div className="player-score-val p2-val">{scores[player2?.playerId] || 0} نقطة</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Flash Countdown Progress Alert */}
      {isFlashing && (
        <div className="flash-progress-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px' }}>
            <Zap style={{ width: '15px', height: '15px', fill: '#1a1303' }} />
            <span>احفظ أماكن اللاعبين قبل أن تُقلب البطاقات!</span>
          </div>
          <div className="flash-timer-circle">
            {flashCountdown}
          </div>
        </div>
      )}

      {/* Floating Reaction Animation */}
      {activeReaction && (
        <div className="floating-reaction">
          {activeReaction.emoji}
        </div>
      )}

      {/* 4. THE DYNAMIC ZERO-SCROLL CARDS STAGE */}
      <div className="cards-dynamic-stage">
        <div className={`cards-dynamic-grid ${gridClass}`}>
          {deck.map((card, idx) => {
            const isFlipped = isFlashing || card.flipped || card.matched;
            const isShaking = shakingIndices.includes(idx);
            const canClick = !isFlashing && (mode === 'solo' || mode === 'pass_and_play' || isMyTurn);

            return (
              <Card
                key={card.id || idx}
                card={card}
                isFlipped={isFlipped}
                isMatched={card.matched}
                matchedBy={card.matchedBy}
                isShaking={isShaking}
                disabled={!canClick || card.flipped || card.matched}
                onClick={() => onCardClick(idx)}
                player1Id={player1?.playerId}
                player2Id={player2?.playerId}
                p1Name={player1?.name}
                p2Name={player2?.name}
                sizeVariant={sizeVariant}
              />
            );
          })}
        </div>
      </div>

      {/* 5. Compact Reactions Bar */}
      {is2Player && onSendReaction && (
        <div className="classic-pill compact-reactions-bar">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(emoji)}
              className="reaction-emoji-btn"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
