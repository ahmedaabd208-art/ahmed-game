import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HomeLobby from './components/HomeLobby';
import MultiplayerLobby from './components/MultiplayerLobby';
import GameBoard from './components/GameBoard';
import GameOverModal from './components/GameOverModal';
import RulesModal from './components/RulesModal';
import InstallModal from './components/InstallModal';
import { FOOTBALL_PLAYERS, DIFFICULTY_PRESETS } from './data/players';
import { sounds } from './utils/audio';
import { socket } from './utils/socket';

export default function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  // Player state
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('football_player_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const randId = `STAR-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      playerId: randId,
      name: 'Ahmed',
      avatar: '👑'
    };
  });

  const [soundMuted, setSoundMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [currentView, setCurrentView] = useState('lobby'); // 'lobby' | 'multiplayer_waiting' | 'gameplay'
  const [gameMode, setGameMode] = useState('solo'); // 'solo' | 'pass_and_play' | 'ai' | 'online'
  
  // Game state
  const [deck, setDeck] = useState([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashCountdown, setFlashCountdown] = useState(3);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [scores, setScores] = useState({});
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [shakingIndices, setShakingIndices] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winnerId, setWinnerId] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [activeReaction, setActiveReaction] = useState(null);
  
  // Online room state
  const [onlineRoom, setOnlineRoom] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

  // AI memory store
  const aiMemoryRef = useRef({});

  // Save profile to localStorage
  const handleUpdatePlayer = (updated) => {
    setPlayer(updated);
    localStorage.setItem('football_player_profile', JSON.stringify(updated));
    if (socket.connected) {
      socket.emit('register_player', updated);
    }
  };

  // Toggle sound
  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setSoundMuted(muted);
  };

  // PWA installation listener
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleOpenInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      setShowInstallModal(true);
    }
  };

  // Socket.io initialization & URL query auto-join
  useEffect(() => {
    const handleConnect = () => {
      socket.emit('register_player', player);

      // Check URL query parameters for ?join=CODE
      const params = new URLSearchParams(window.location.search);
      const joinCode = params.get('join');
      if (joinCode) {
        socket.emit('join_room', { roomCode: joinCode });
        // Clean URL without refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    if (socket.connected) {
      handleConnect();
    }
    socket.on('connect', handleConnect);

    socket.on('player_registered', ({ playerId }) => {
      setPlayer(prev => ({ ...prev, playerId }));
    });

    socket.on('room_created', ({ room }) => {
      setOnlineRoom(room);
      setCurrentView('multiplayer_waiting');
    });

    socket.on('room_updated', ({ room }) => {
      setOnlineRoom(room);
      setCurrentView('multiplayer_waiting');
    });

    socket.on('join_error', ({ message }) => {
      alert(message);
    });

    // Game started by server in Online mode
    socket.on('game_started', ({ room, flashSeconds }) => {
      setOnlineRoom(room);
      setGameMode('online');
      setDeck(room.deck);
      setPlayer1(room.players[0]);
      setPlayer2(room.players[1]);
      setScores(room.scores);
      setCurrentTurnId(room.players[0]?.playerId);
      setIsFlashing(true);
      setFlashCountdown(flashSeconds || 3);
      setCurrentView('gameplay');
      setGameOver(false);

      // Count down flash
      let count = flashSeconds || 3;
      const interval = setInterval(() => {
        count -= 1;
        setFlashCountdown(count);
        if (count > 0) {
          sounds.playTick();
        } else {
          clearInterval(interval);
          sounds.playWhistle();
          setIsFlashing(false);
        }
      }, 1000);
    });

    socket.on('card_flipped', ({ index, playerId, card }) => {
      sounds.playFlip();
      setDeck(prev => {
        const next = [...prev];
        next[index] = { ...next[index], flipped: true };
        return next;
      });
    });

    socket.on('match_result', ({ isMatch, matchedIndices, mismatchedIndices, scores: updatedScores, nextTurnSocketId }) => {
      setScores(updatedScores);

      if (isMatch) {
        sounds.playMatch();
        setDeck(prev => {
          const next = [...prev];
          matchedIndices.forEach(idx => {
            if (next[idx]) next[idx] = { ...next[idx], matched: true, flipped: true };
          });
          return next;
        });
      } else {
        sounds.playMismatch();
        setShakingIndices(mismatchedIndices);
        setTimeout(() => {
          setShakingIndices([]);
          setDeck(prev => {
            const next = [...prev];
            mismatchedIndices.forEach(idx => {
              if (next[idx]) next[idx] = { ...next[idx], flipped: false };
            });
            return next;
          });
        }, 800);
      }

      // Update current turn
      if (onlineRoom?.players) {
        const nextPlayer = onlineRoom.players.find(p => p.socketId === nextTurnSocketId);
        if (nextPlayer) {
          setCurrentTurnId(nextPlayer.playerId);
          if (nextPlayer.playerId === player.playerId) {
            sounds.playTurn();
          }
        }
      }
    });

    socket.on('game_over', ({ room, winnerId, isDraw }) => {
      setOnlineRoom(room);
      setScores(room.scores);
      setWinnerId(winnerId);
      setIsDraw(isDraw);
      setGameOver(true);
    });

    socket.on('player_reaction', ({ emoji }) => {
      setActiveReaction({ emoji });
      setTimeout(() => setActiveReaction(null), 2000);
    });

    socket.on('player_left', ({ message, room }) => {
      alert(message);
      setOnlineRoom(room);
      if (room.players.length < 2) {
        setCurrentView('multiplayer_waiting');
      }
    });

    return () => {
      socket.off('connect');
      socket.off('room_created');
      socket.off('room_updated');
      socket.off('game_started');
      socket.off('card_flipped');
      socket.off('match_result');
      socket.off('game_over');
      socket.off('player_reaction');
      socket.off('player_left');
    };
  }, [player, onlineRoom]);

  // Solo timer
  useEffect(() => {
    let interval = null;
    if (currentView === 'gameplay' && !isFlashing && !gameOver && gameMode === 'solo') {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentView, isFlashing, gameOver, gameMode]);

  // Generate Deck for Local Games (Solo, Pass & Play, AI)
  const setupLocalGame = (modeType, difficulty = 'medium') => {
    const config = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medium;
    setSelectedDifficulty(difficulty);
    setGameMode(modeType);

    // Pick unique players
    const shuffledPlayers = [...FOOTBALL_PLAYERS].sort(() => 0.5 - Math.random());
    const selected = shuffledPlayers.slice(0, config.pairsCount);

    let newDeck = [];
    selected.forEach(p => {
      newDeck.push({ id: `${p.id}-1`, playerId: p.id, matched: false, flipped: false, matchedBy: null });
      newDeck.push({ id: `${p.id}-2`, playerId: p.id, matched: false, flipped: false, matchedBy: null });
    });

    // Shuffle deck
    newDeck.sort(() => 0.5 - Math.random());
    newDeck = newDeck.map((c, idx) => ({ ...c, index: idx }));

    setDeck(newDeck);
    setFlippedIndices([]);
    setShakingIndices([]);
    setMovesCount(0);
    setTimerSeconds(0);
    setGameOver(false);
    setWinnerId(null);
    setIsDraw(false);
    aiMemoryRef.current = {};

    // Setup players
    const p1 = { ...player };
    let p2 = null;

    if (modeType === 'pass_and_play') {
      p2 = {
        playerId: 'FRIEND-2',
        name: 'الصديق 2',
        avatar: '🏆'
      };
      setScores({ [p1.playerId]: 0, [p2.playerId]: 0 });
      setCurrentTurnId(p1.playerId);
    } else if (modeType === 'ai') {
      p2 = {
        playerId: 'BOT-AI',
        name: 'الروبوت الأسطوري 🤖',
        avatar: '🤖'
      };
      setScores({ [p1.playerId]: 0, [p2.playerId]: 0 });
      setCurrentTurnId(p1.playerId);
    } else {
      // Solo
      setScores({ [p1.playerId]: 0 });
      setCurrentTurnId(p1.playerId);
    }

    setPlayer1(p1);
    setPlayer2(p2);
    setCurrentView('gameplay');
    setIsFlashing(true);
    setFlashCountdown(config.flashSeconds);

    // Flash countdown
    let count = config.flashSeconds;
    const interval = setInterval(() => {
      count -= 1;
      setFlashCountdown(count);
      if (count > 0) {
        sounds.playTick();
      } else {
        clearInterval(interval);
        sounds.playWhistle();
        setIsFlashing(false);
      }
    }, 1000);
  };

  // Card click handler
  const handleCardClick = (index) => {
    if (isFlashing || gameOver) return;
    if (deck[index]?.flipped || deck[index]?.matched) return;
    if (flippedIndices.length >= 2) return;

    if (gameMode === 'online') {
      // Send to server
      socket.emit('flip_card', { index });
      return;
    }

    // Local click logic
    sounds.playFlip();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Flip card visually
    setDeck(prev => {
      const next = [...prev];
      next[index] = { ...next[index], flipped: true };
      return next;
    });

    // If 2 cards flipped, evaluate match
    if (newFlipped.length === 2) {
      setMovesCount(m => m + 1);
      const [idx1, idx2] = newFlipped;
      const card1 = deck[idx1];
      const card2 = deck[idx2];
      const isMatch = card1.playerId === card2.playerId;

      // Remember in AI memory
      aiMemoryRef.current[card1.playerId] = aiMemoryRef.current[card1.playerId] || [];
      if (!aiMemoryRef.current[card1.playerId].includes(idx1)) aiMemoryRef.current[card1.playerId].push(idx1);
      aiMemoryRef.current[card2.playerId] = aiMemoryRef.current[card2.playerId] || [];
      if (!aiMemoryRef.current[card2.playerId].includes(idx2)) aiMemoryRef.current[card2.playerId].push(idx2);

      setTimeout(() => {
        if (isMatch) {
          sounds.playMatch();
          setDeck(prev => {
            const next = [...prev];
            next[idx1] = { ...next[idx1], matched: true, matchedBy: currentTurnId };
            next[idx2] = { ...next[idx2], matched: true, matchedBy: currentTurnId };
            return next;
          });

          // Award score
          setScores(prev => ({
            ...prev,
            [currentTurnId]: (prev[currentTurnId] || 0) + 100
          }));
          setFlippedIndices([]);

          // Check if all matched
          setTimeout(() => {
            setDeck(currentLiveDeck => {
              const allMatched = currentLiveDeck.every(c => c.matched);
              if (allMatched) {
                handleGameOverLocal();
              } else if (gameMode === 'ai' && currentTurnId === 'BOT-AI') {
                // AI gets another turn!
                triggerAiTurn();
              }
              return currentLiveDeck;
            });
          }, 300);

        } else {
          // Mismatch
          sounds.playMismatch();
          setShakingIndices([idx1, idx2]);

          setTimeout(() => {
            setShakingIndices([]);
            setDeck(prev => {
              const next = [...prev];
              next[idx1] = { ...next[idx1], flipped: false };
              next[idx2] = { ...next[idx2], flipped: false };
              return next;
            });
            setFlippedIndices([]);

            // Switch turns in 2-player modes
            if (gameMode === 'pass_and_play') {
              const nextTurn = currentTurnId === player1.playerId ? player2.playerId : player1.playerId;
              setCurrentTurnId(nextTurn);
              sounds.playTurn();
            } else if (gameMode === 'ai') {
              const nextTurn = currentTurnId === player1.playerId ? 'BOT-AI' : player1.playerId;
              setCurrentTurnId(nextTurn);
              if (nextTurn === 'BOT-AI') {
                triggerAiTurn();
              } else {
                sounds.playTurn();
              }
            }
          }, 800);
        }
      }, 600);
    }
  };

  // AI Turn simulation
  const triggerAiTurn = () => {
    setTimeout(() => {
      setDeck(currentLiveDeck => {
        const unmatchedIndices = currentLiveDeck
          .map((c, i) => (!c.matched && !c.flipped ? i : null))
          .filter(i => i !== null);

        if (unmatchedIndices.length < 2) return currentLiveDeck;

        // Check if AI knows a pair in memory
        let pick1 = null;
        let pick2 = null;

        for (const [pId, indices] of Object.entries(aiMemoryRef.current)) {
          const available = indices.filter(i => !currentLiveDeck[i].matched);
          if (available.length >= 2 && Math.random() < 0.85) {
            pick1 = available[0];
            pick2 = available[1];
            break;
          }
        }

        if (pick1 === null || pick2 === null) {
          // Pick random
          pick1 = unmatchedIndices[Math.floor(Math.random() * unmatchedIndices.length)];
          const remaining = unmatchedIndices.filter(i => i !== pick1);
          pick2 = remaining[Math.floor(Math.random() * remaining.length)];
        }

        // Simulate 1st click
        handleCardClick(pick1);

        // Simulate 2nd click after 0.8s
        setTimeout(() => {
          handleCardClick(pick2);
        }, 800);

        return currentLiveDeck;
      });
    }, 900);
  };

  const handleGameOverLocal = () => {
    setGameOver(true);
    if (gameMode !== 'solo') {
      const p1Score = scores[player1?.playerId] || 0;
      const p2Score = scores[player2?.playerId] || 0;
      if (p1Score > p2Score) {
        setWinnerId(player1.playerId);
      } else if (p2Score > p1Score) {
        setWinnerId(player2.playerId);
      } else {
        setIsDraw(true);
      }
    }
  };

  // Online actions
  const handleCreateOnlineRoom = (difficulty) => {
    socket.emit('create_room', { difficulty });
  };

  const handleJoinOnlineRoom = (roomCode) => {
    socket.emit('join_room', { roomCode });
  };

  const handleToggleReady = () => {
    socket.emit('toggle_ready');
  };

  const handleLeaveRoom = () => {
    setCurrentView('lobby');
    setOnlineRoom(null);
  };

  const handleSendReaction = (emoji) => {
    if (gameMode === 'online') {
      socket.emit('send_reaction', { emoji });
    } else {
      setActiveReaction({ emoji });
      setTimeout(() => setActiveReaction(null), 1500);
    }
  };

  const handleRematch = () => {
    if (gameMode === 'online') {
      socket.emit('request_rematch');
    } else {
      setupLocalGame(gameMode, selectedDifficulty);
    }
  };

  return (
    <div style={{ width: '100%', height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation (Only on Lobby & Waiting screens, so gameplay has 100% full screen zero-scroll) */}
      {currentView !== 'gameplay' && (
        <Navbar
          player={player}
          onUpdatePlayer={handleUpdatePlayer}
          onOpenRules={() => setShowRules(true)}
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Main View Router */}
      <main style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {currentView === 'lobby' && (
          <HomeLobby
            player={player}
            onUpdatePlayer={handleUpdatePlayer}
            onStartSolo={(diff) => setupLocalGame('solo', diff)}
            onStartPassAndPlay={(diff) => setupLocalGame('pass_and_play', diff)}
            onStartVsAi={(diff) => setupLocalGame('ai', diff)}
            onCreateOnlineRoom={handleCreateOnlineRoom}
            onJoinOnlineRoom={handleJoinOnlineRoom}
            onOpenInstallModal={handleOpenInstall}
          />
        )}

        {currentView === 'multiplayer_waiting' && (
          <MultiplayerLobby
            room={onlineRoom}
            currentSocketId={socket.id}
            onToggleReady={handleToggleReady}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {currentView === 'gameplay' && (
          <GameBoard
            mode={gameMode}
            deck={deck}
            isFlashing={isFlashing}
            flashCountdown={flashCountdown}
            player1={player1}
            player2={player2}
            currentTurnPlayerId={currentTurnId}
            scores={scores}
            flippedIndices={flippedIndices}
            shakingIndices={shakingIndices}
            onCardClick={handleCardClick}
            onLeaveGame={() => setCurrentView('lobby')}
            onRestartGame={() => setupLocalGame(gameMode, selectedDifficulty)}
            timerSeconds={timerSeconds}
            movesCount={movesCount}
            activeReaction={activeReaction}
            onSendReaction={handleSendReaction}
          />
        )}
      </main>

      {/* Modals */}
      {gameOver && (
        <GameOverModal
          mode={gameMode}
          winnerId={winnerId}
          isDraw={isDraw}
          player1={player1}
          player2={player2}
          scores={scores}
          timerSeconds={timerSeconds}
          movesCount={movesCount}
          onRematch={handleRematch}
          onHome={() => {
            setGameOver(false);
            setCurrentView('lobby');
          }}
        />
      )}

      {showRules && (
        <RulesModal onClose={() => setShowRules(false)} />
      )}

      {showInstallModal && (
        <InstallModal 
          onClose={() => setShowInstallModal(false)} 
          hasPrompt={!!deferredPrompt}
          onTriggerPrompt={handleOpenInstall}
        />
      )}
    </div>
  );
}
