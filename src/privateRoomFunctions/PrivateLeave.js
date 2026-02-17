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

function removeSocketFromRoom(room, ws) {
  const idx = room.players.findIndex((p) => p.ws === ws);
  if (idx === -1) return null;
  const [removed] = room.players.splice(idx, 1);
  return removed;
}

function PrivateLeave(ws, payload = {}) {
  const store = getStore();
  const roomCodeFromPayload = (payload.roomCode || "").toString().trim().toUpperCase();
  const roomCode = roomCodeFromPayload || store.codeBySocket.get(ws);

  if (!roomCode) {
    safeSend(ws, { type: "error", error: "NOT_IN_ROOM" });
    return;
  }

  const room = store.roomsByCode.get(roomCode);
  if (!room) {
    store.codeBySocket.delete(ws);
    store.userIdBySocket.delete(ws);
    safeSend(ws, { type: "error", error: "ROOM_NOT_FOUND", payload: { roomCode } });
    return;
  }

  const removed = removeSocketFromRoom(room, ws);
  store.codeBySocket.delete(ws);
  store.userIdBySocket.delete(ws);

  if (!removed) {
    safeSend(ws, { type: "error", error: "NOT_IN_ROOM" });
    return;
  }

  const hostLeft = removed.isHost === true;

  if (hostLeft) {
    broadcast(room, {
      type: "private.room.closed",
      payload: { roomCode, reason: "HOST_LEFT" },
    });

    for (const p of room.players) {
      store.codeBySocket.delete(p.ws);
      store.userIdBySocket.delete(p.ws);
    }

    store.roomsByCode.delete(roomCode);

    safeSend(ws, { type: "private.left", payload: { roomCode, closed: true } });
    return;
  }

  if (room.players.length === 0) {
    store.roomsByCode.delete(roomCode);
    safeSend(ws, { type: "private.left", payload: { roomCode, closed: true } });
    return;
  }

  broadcast(room, {
    type: "private.room.updated",
    payload: { roomCode, room: roomSnapshot(room) },
  });

  safeSend(ws, {
    type: "private.left",
    payload: { roomCode, closed: false },
  });
}

module.exports = { PrivateLeave };
