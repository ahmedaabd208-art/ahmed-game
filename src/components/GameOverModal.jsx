import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, RotateCcw, Home, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GameOverModal({
  mode,
  winnerId,
  isDraw,
  player1,
  player2,
  scores,
  timerSeconds,
  movesCount,
  onRematch,
  onHome
}) {
  useEffect(() => {
    sounds.playVictory();

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 350);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const winner = winnerId === player1?.playerId ? player1 : player2;
  const isSolo = mode === 'solo';

  // Stars for solo mode based on moves
  const starsCount = movesCount <= 8 ? 3 : movesCount <= 14 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border-2 border-amber-500/50 shadow-2xl text-center relative overflow-hidden">
        
        {/* Glow Header */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />

        {/* Trophy icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-xl shadow-amber-500/30 flex items-center justify-center mb-3 animate-bounce">
          <div className="w-full h-full bg-slate-900 rounded-[20px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400 drop-shadow" />
          </div>
        </div>

        {isSolo ? (
          <div>
            <h3 className="text-xl font-black text-white mb-1">
              أحسنت صنعاً! انتهت اللعبة!
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              لقد طابقت جميع كروت الأساطير بنجاح
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-7 h-7 ${
                    star <= starsCount ? 'text-amber-400 fill-amber-400 drop-shadow' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 mb-5">
              <div>
                <span className="text-[11px] text-slate-400 block">الوقت المستغرق</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">عدد المحاولات</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {movesCount}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* 2-Player Outcome */
          <div>
            {isDraw ? (
              <div className="mb-4">
                <h3 className="text-xl font-black text-white mb-1">تعادل أسطوري! 🤝</h3>
                <p className="text-xs text-slate-300">مباراة متقاربة وأداء مذهل من كلا اللاعبين!</p>
              </div>
            ) : (
              <div className="mb-4">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                  بطل التحدي 👑
                </span>
                <h3 className="text-xl font-black text-white mt-2 mb-1 flex items-center justify-center gap-2">
                  <span>{winner?.avatar}</span>
                  <span>{winner?.name}</span>
                </h3>
                <p className="text-xs text-slate-300">انتصار ساحق في ذاكرة كرة القدم!</p>
              </div>
            )}

            {/* 2-Player Score comparison */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 mb-5">
              <div className="text-right border-l border-slate-800 pl-2">
                <span className="text-[11px] text-slate-400 block truncate">{player1?.name}</span>
                <span className="text-base font-black text-blue-400 font-mono">
                  {scores[player1?.playerId] || 0} نقطة
                </span>
              </div>
              <div className="text-left pr-2">
                <span className="text-[11px] text-slate-400 block truncate">{player2?.name}</span>
                <span className="text-base font-black text-pink-400 font-mono">
                  {scores[player2?.playerId] || 0} نقطة
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRematch}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>لعب جولة أخرى</span>
          </button>
          <button
            onClick={onHome}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>الرئيسية</span>
          </button>
        </div>

      </div>
    </div>
  );
}
