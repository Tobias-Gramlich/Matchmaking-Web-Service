//* Get Store of Rooms
function getStore() {
  if (!globalThis.__privateRooms) {
    globalThis.__privateRooms = {
      // roomCode (string) -> { sockets: Set<WebSocket> }
      roomSockets: new Map(),
      // ws -> roomCode
      codeBySocket: new Map(),
      // ws -> userId
      userIdBySocket: new Map(),
    };
  }
  return globalThis.__privateRooms;
}

//* Safe send
function safeSend(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch (error) {
    console.log(error);
  }
}

//* Give back Room associated with code
function ensureRoomSockets(store, roomCode) {
  const code = String(roomCode);
  if (!store.roomSockets.has(code)) {
    store.roomSockets.set(code, { sockets: new Set() });
  }
  return store.roomSockets.get(code);
}

//* Add Socket to Room
function addSocketToRoom(store, ws, roomCode, userId) {
  const code = String(roomCode);
  const entry = ensureRoomSockets(store, code);
  entry.sockets.add(ws);
  store.codeBySocket.set(ws, code);
  store.userIdBySocket.set(ws, userId);
}

//* Remove Socket from Store
function removeSocketFromRoom(store, ws) {
  const roomCode = store.codeBySocket.get(ws);
  if (!roomCode) return null;
  const entry = store.roomSockets.get(roomCode);
  if (entry) {
    entry.sockets.delete(ws);
    if (entry.sockets.size === 0) store.roomSockets.delete(roomCode);
  }
  store.codeBySocket.delete(ws);
  store.userIdBySocket.delete(ws);
  return roomCode;
}

//* Broadcast to Room
function broadcastToRoom(store, roomCode, obj) {
  const code = String(roomCode);
  const entry = store.roomSockets.get(code);
  if (!entry) return;
  for (const ws of entry.sockets) safeSend(ws, obj);
}

//* Cleanup Room
function cleanupRoom(store, roomCode) {
  const code = String(roomCode);
  const entry = store.roomSockets.get(code);
  if (entry) {
    for (const ws of entry.sockets) {
      store.codeBySocket.delete(ws);
      store.userIdBySocket.delete(ws);
    }
  }
  store.roomSockets.delete(code);
}

//* Create Room Snapshot
function dbRoomSnapshot(dbRoom) {
  const players = [];
  if (dbRoom.host != null) players.push({ userId: dbRoom.host, isHost: true });
  if (dbRoom.player2 != null) players.push({ userId: dbRoom.player2, isHost: false });
  if (dbRoom.player3 != null) players.push({ userId: dbRoom.player3, isHost: false });
  if (dbRoom.player4 != null) players.push({ userId: dbRoom.player4, isHost: false });

  return {
    roomCode: String(dbRoom.id),
    hostId: dbRoom.host,
    state: dbRoom.state,
    players,
    maxPlayers: 4,
  };
}

module.exports = {
  getStore,
  safeSend,
  addSocketToRoom,
  removeSocketFromRoom,
  broadcastToRoom,
  cleanupRoom,
  dbRoomSnapshot,
};