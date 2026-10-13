import { io } from 'socket.io-client';

// Detect whether we are running in local dev with proxy or direct
const SOCKET_URL = window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});
