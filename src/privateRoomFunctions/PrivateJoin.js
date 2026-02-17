const MAX_PLAYERS = 4;

function getStore() {
  if (!globalThis.__privateRooms) {
    globalThis.__privateRooms = {
      roomsByCode: new Map(),
      codeBySocket: new Map(),
      userIdBySocket: new Map(),
    };
  }
  return globalThis.__privateRooms;
}

function safeSend(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch (_) {}
}

function broadcast(room, obj) {
  for (const p of room.players) safeSend(p.ws, obj);
}

function roomSnapshot(room) {
  return {
    roomCode: room.roomCode,
    hostId: room.hostId,
    state: room.state,
    players: room.players.map((p) => ({ userId: p.userId, isHost: p.isHost })),
    maxPlayers: room.maxPlayers,
  };
}

function PrivateJoin(ws, payload = {}) {
  const store = getStore();
  const userId = payload.userId;
  const roomCode = (payload.roomCode || "").toString().trim().toUpperCase();

  if (userId === undefined || userId === null || userId === "") {
    safeSend(ws, { type: "error", error: "MISSING_USER_ID" });
    return;
  }
  if (!roomCode) {
    safeSend(ws, { type: "error", error: "MISSING_ROOM_CODE" });
    return;
  }

  const existingCode = store.codeBySocket.get(ws);
  if (existingCode) {
    safeSend(ws, { type: "error", error: "ALREADY_IN_ROOM", payload: { roomCode: existingCode } });
    return;
  }

  const room = store.roomsByCode.get(roomCode);
  if (!room) {
    safeSend(ws, { type: "error", error: "ROOM_NOT_FOUND", payload: { roomCode } });
    return;
  }

  if (room.state !== "lobby") {
    safeSend(ws, { type: "error", error: "ROOM_ALREADY_STARTED", payload: { roomCode } });
    return;
  }

  if (room.players.length >= (room.maxPlayers || MAX_PLAYERS)) {
    safeSend(ws, { type: "error", error: "ROOM_FULL", payload: { roomCode } });
    return;
  }

  if (room.players.some((p) => String(p.userId) === String(userId))) {
    safeSend(ws, { type: "error", error: "USER_ALREADY_IN_ROOM", payload: { roomCode } });
    return;
  }

  room.players.push({
    userId,
    ws,
    isHost: false,
    joinedAt: Date.now(),
  });

  store.codeBySocket.set(ws, roomCode);
  store.userIdBySocket.set(ws, userId);

  safeSend(ws, {
    type: "private.joined",
    payload: { roomCode, room: roomSnapshot(room) },
  });

  broadcast(room, {
    type: "private.room.updated",
    payload: { roomCode, room: roomSnapshot(room) },
  });
}

module.exports = { PrivateJoin };
