import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve static frontend build if it exists
app.use(express.static(path.join(__dirname, 'dist')));

// Helper to get local network IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// In-memory rooms and active players storage
const rooms = new Map();
const players = new Map();

// Helper to shuffle cards
function generateDeck(difficulty = 'medium', customPairs = null) {
  const pairsCount = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 8 : 6;
  const playerIds = [
    'messi', 'ronaldo', 'mbappe', 'haaland', 
    'vinicius', 'salah', 'debruyne', 'bellingham', 
    'neymar', 'modric', 'lewandowski', 'bounou'
  ];

  // Pick pairsCount unique players
  const selected = playerIds.slice(0, pairsCount);
  
  // Create pair items
  let deck = [];
  selected.forEach(playerId => {
    deck.push({ id: `${playerId}-1`, playerId, matched: false, flipped: false, matchedBy: null });
    deck.push({ id: `${playerId}-2`, playerId, matched: false, flipped: false, matchedBy: null });
  });

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck.map((card, idx) => ({ ...card, index: idx }));
}

io.on('connection', (socket) => {
  let currentPlayerId = null;

  // Register player identity
  socket.on('register_player', ({ playerId, name, avatar }) => {
    currentPlayerId = playerId || `PLAYER-${Math.floor(1000 + Math.random() * 9000)}`;
    players.set(socket.id, {
      socketId: socket.id,
      playerId: currentPlayerId,
      name: name || `كابتن ${Math.floor(10 + Math.random() * 90)}`,
      avatar: avatar || '⚽',
      roomId: null
    });

    socket.emit('player_registered', {
      playerId: currentPlayerId,
      player: players.get(socket.id)
    });
  });

  // Create room
  socket.on('create_room', ({ difficulty = 'medium', flashSeconds = 3 }) => {
    const player = players.get(socket.id);
    if (!player) return;

    // Generate 5-digit room code
    const roomCode = Math.floor(10000 + Math.random() * 90000).toString();
    const room = {
      code: roomCode,
      hostId: player.playerId,
      hostSocketId: socket.id,
      players: [player],
      difficulty,
      flashSeconds,
      status: 'waiting', // 'waiting', 'flashing', 'playing', 'finished'
      deck: [],
      currentTurnSocketId: socket.id,
      flippedIndices: [],
      scores: {
        [player.playerId]: 0
      },
      ready: {
        [player.playerId]: false
      }
    };

    rooms.set(roomCode, room);
    player.roomId = roomCode;
    socket.join(roomCode);

    socket.emit('room_created', {
      roomCode,
      room
    });
  });

  // Join room by code or host player ID
  socket.on('join_room', ({ roomCode }) => {
    let player = players.get(socket.id);
    if (!player) {
      const randId = `STAR-${Math.floor(1000 + Math.random() * 9000)}`;
      player = {
        socketId: socket.id,
        playerId: randId,
        name: `كابتن ${randId.slice(-3)}`,
        avatar: '⚽',
        roomId: null
      };
      players.set(socket.id, player);
    }

    let targetRoomCode = roomCode?.trim();
    let room = rooms.get(targetRoomCode);

    // If not found by direct code, search if entered host player ID
    if (!room) {
      for (const [code, r] of rooms.entries()) {
        if (r.hostId.toLowerCase() === targetRoomCode.toLowerCase() && r.players.length < 2) {
          room = r;
          targetRoomCode = code;
          break;
        }
      }
    }

    if (!room) {
      socket.emit('join_error', { message: 'الغرفة غير موجودة أو انتهت صلاحيتها' });
      return;
    }

    if (room.players.length >= 2 && !room.players.some(p => p.socketId === socket.id)) {
      socket.emit('join_error', { message: 'الغرفة ممتلئة بالكامل (لاعبين كحد أقصى)' });
      return;
    }

    // Add player if not already in room
    if (!room.players.some(p => p.socketId === socket.id)) {
      room.players.push(player);
      room.scores[player.playerId] = 0;
      room.ready[player.playerId] = false;
    }

    player.roomId = targetRoomCode;
    socket.join(targetRoomCode);

    io.to(targetRoomCode).emit('room_updated', { room });
  });

  // Player toggle ready
  socket.on('toggle_ready', () => {
    const player = players.get(socket.id);
    if (!player || !player.roomId) return;
    const room = rooms.get(player.roomId);
    if (!room) return;

    room.ready[player.playerId] = !room.ready[player.playerId];

    // Check if both ready and start game
    const allReady = room.players.length === 2 && room.players.every(p => room.ready[p.playerId]);
    if (allReady) {
      room.deck = generateDeck(room.difficulty);
      room.status = 'flashing';
      room.currentTurnSocketId = room.hostSocketId;
      room.flippedIndices = [];
      room.players.forEach(p => room.scores[p.playerId] = 0);

      io.to(room.code).emit('game_started', {
        room,
        flashSeconds: room.flashSeconds
      });

      // After flash phase, start actual play
      setTimeout(() => {
        const liveRoom = rooms.get(room.code);
        if (liveRoom && liveRoom.status === 'flashing') {
          liveRoom.status = 'playing';
          io.to(room.code).emit('flash_ended', { room: liveRoom });
        }
      }, (room.flashSeconds + 0.5) * 1000);
    } else {
      io.to(room.code).emit('room_updated', { room });
    }
  });

  // Card Flip Action
  socket.on('flip_card', ({ index }) => {
    const player = players.get(socket.id);
    if (!player || !player.roomId) return;
    const room = rooms.get(player.roomId);
    if (!room || room.status !== 'playing') return;

    // Verify it's current player's turn
    if (room.currentTurnSocketId !== socket.id) {
      socket.emit('action_denied', { message: 'ليس دورك الآن!' });
      return;
    }

    const card = room.deck[index];
    if (!card || card.matched || card.flipped) return;

    // If already 2 cards flipped awaiting check, ignore
    if (room.flippedIndices.length >= 2) return;

    // Flip card
    card.flipped = true;
    room.flippedIndices.push(index);

    io.to(room.code).emit('card_flipped', {
      index,
      playerId: player.playerId,
      card
    });

    // Check match if 2 cards flipped
    if (room.flippedIndices.length === 2) {
      const [idx1, idx2] = room.flippedIndices;
      const card1 = room.deck[idx1];
      const card2 = room.deck[idx2];

      const isMatch = card1.playerId === card2.playerId;

      setTimeout(() => {
        const liveRoom = rooms.get(room.code);
        if (!liveRoom) return;

        if (isMatch) {
          // Cards matched!
          card1.matched = true;
          card2.matched = true;
          card1.matchedBy = player.playerId;
          card2.matchedBy = player.playerId;

          liveRoom.scores[player.playerId] = (liveRoom.scores[player.playerId] || 0) + 100;
          liveRoom.flippedIndices = [];

          // Check if all cards matched
          const isGameOver = liveRoom.deck.every(c => c.matched);
          if (isGameOver) {
            liveRoom.status = 'finished';
            // Determine winner
            const p1 = liveRoom.players[0];
            const p2 = liveRoom.players[1];
            let winnerId = null;
            if (liveRoom.scores[p1.playerId] > liveRoom.scores[p2.playerId]) {
              winnerId = p1.playerId;
            } else if (liveRoom.scores[p2.playerId] > liveRoom.scores[p1.playerId]) {
              winnerId = p2.playerId;
            } // else draw

            io.to(liveRoom.code).emit('game_over', {
              room: liveRoom,
              winnerId,
              isDraw: !winnerId
            });
          } else {
            // Player keeps turn when matching!
            io.to(liveRoom.code).emit('match_result', {
              isMatch: true,
              matchedIndices: [idx1, idx2],
              playerId: player.playerId,
              scores: liveRoom.scores,
              nextTurnSocketId: liveRoom.currentTurnSocketId
            });
          }
        } else {
          // Mismatch: flip back and switch turn to the other player
          card1.flipped = false;
          card2.flipped = false;
          liveRoom.flippedIndices = [];

          const otherPlayer = liveRoom.players.find(p => p.socketId !== socket.id);
          if (otherPlayer) {
            liveRoom.currentTurnSocketId = otherPlayer.socketId;
          }

          io.to(liveRoom.code).emit('match_result', {
            isMatch: false,
            mismatchedIndices: [idx1, idx2],
            scores: liveRoom.scores,
            nextTurnSocketId: liveRoom.currentTurnSocketId
          });
        }
      }, 1000);
    }
  });

  // Rematch request
  socket.on('request_rematch', () => {
    const player = players.get(socket.id);
    if (!player || !player.roomId) return;
    const room = rooms.get(player.roomId);
    if (!room) return;

    room.deck = generateDeck(room.difficulty);
    room.status = 'flashing';
    room.flippedIndices = [];
    room.players.forEach(p => room.scores[p.playerId] = 0);
    room.ready = { [room.players[0].playerId]: true, [room.players[1].playerId]: true };

    io.to(room.code).emit('game_started', {
      room,
      flashSeconds: room.flashSeconds
    });

    setTimeout(() => {
      const liveRoom = rooms.get(room.code);
      if (liveRoom && liveRoom.status === 'flashing') {
        liveRoom.status = 'playing';
        io.to(room.code).emit('flash_ended', { room: liveRoom });
      }
    }, (room.flashSeconds + 0.5) * 1000);
  });

  // Send quick reaction emoji
  socket.on('send_reaction', ({ emoji }) => {
    const player = players.get(socket.id);
    if (!player || !player.roomId) return;
    io.to(player.roomId).emit('player_reaction', {
      playerId: player.playerId,
      playerName: player.name,
      emoji
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      const room = rooms.get(player.roomId);
      if (room) {
        room.players = room.players.filter(p => p.socketId !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(player.roomId);
        } else {
          io.to(room.code).emit('player_left', {
            message: `${player.name} غادر الغرفة`,
            room
          });
        }
      }
    }
    players.delete(socket.id);
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Server is running. Please run npm run build to generate the frontend, or visit Vite dev server at http://localhost:5173');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`====================================================`);
  console.log(`⚽ Football Memory Battle Server is LIVE!`);
  console.log(`📱 Local access:   http://localhost:${PORT}`);
  console.log(`📶 Mobile WiFi:    http://${localIp}:${PORT}`);
  console.log(`====================================================`);
});
