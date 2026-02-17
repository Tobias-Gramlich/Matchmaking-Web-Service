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

function PrivateStart(ws, payload = {}) {
  const store = getStore();
  const userId = payload.userId;
  const roomCodeFromPayload = (payload.roomCode || "").toString().trim().toUpperCase();
  const roomCode = roomCodeFromPayload || store.codeBySocket.get(ws);

  if (userId === undefined || userId === null || userId === "") {
    safeSend(ws, { type: "error", error: "MISSING_USER_ID" });
    return;
  }
  if (!roomCode) {
    safeSend(ws, { type: "error", error: "MISSING_ROOM_CODE" });
    return;
  }

  const room = store.roomsByCode.get(roomCode);
  if (!room) {
    safeSend(ws, { type: "error", error: "ROOM_NOT_FOUND", payload: { roomCode } });
    return;
  }

  if (String(room.hostId) !== String(userId)) {
    safeSend(ws, { type: "error", error: "ONLY_HOST_CAN_START", payload: { roomCode } });
    return;
  }

  if (room.state !== "lobby") {
    safeSend(ws, { type: "error", error: "ROOM_ALREADY_STARTED", payload: { roomCode } });
    return;
  }

  if (room.players.length < 2) {
    safeSend(ws, { type: "error", error: "NOT_ENOUGH_PLAYERS", payload: { roomCode, minPlayers: 2 } });
    return;
  }

  room.state = "started";
  room.startedAt = Date.now();

  broadcast(room, {
    type: "private.started",
    payload: { roomCode, room: roomSnapshot(room) },
  });
}

module.exports = { PrivateStart };
