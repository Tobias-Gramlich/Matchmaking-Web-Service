const MAX_PLAYERS = 4;

function getStore() {
  if (!globalThis.__privateRooms) {
    globalThis.__privateRooms = {
      roomsByCode: new Map(), // code -> room
      codeBySocket: new Map(), // ws -> code
      userIdBySocket: new Map(), // ws -> userId
    };
  }
  return globalThis.__privateRooms;
}

function randomCode(length = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function createUniqueCode(store) {
  let code = randomCode(6);
  while (store.roomsByCode.has(code)) code = randomCode(6);
  return code;
}

function safeSend(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch (_) {
  }
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

function PrivateCreate(ws, payload = {}) {
  const store = getStore();
  const userId = payload.userId;

  if (userId === undefined || userId === null || userId === "") {
    safeSend(ws, { type: "error", error: "MISSING_USER_ID" });
    return;
  }

  const existingCode = store.codeBySocket.get(ws);
  if (existingCode) {
    safeSend(ws, { type: "error", error: "ALREADY_IN_ROOM", payload: { roomCode: existingCode } });
    return;
  }

  const roomCode = createUniqueCode(store);

  const room = {
    roomCode,
    hostId: userId,
    state: "lobby", // lobby | started
    maxPlayers: MAX_PLAYERS,
    createdAt: Date.now(),
    players: [
      {
        userId,
        ws,
        isHost: true,
        joinedAt: Date.now(),
      },
    ],
  };

  store.roomsByCode.set(roomCode, room);
  store.codeBySocket.set(ws, roomCode);
  store.userIdBySocket.set(ws, userId);

  safeSend(ws, {
    type: "private.created",
    payload: {
      roomCode,
      room: roomSnapshot(room),
    },
  });
}

module.exports = { PrivateCreate };