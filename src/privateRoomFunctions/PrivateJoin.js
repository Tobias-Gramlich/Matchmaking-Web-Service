const { Rooms } = require("../models");
const {
  getStore,
  safeSend,
  addSocketToRoom,
  broadcastToRoom,
  dbRoomSnapshot,
} = require("./privateRoomStore");

function normalizeRoomCode(input) {
  // roomCode is the DB id => must be numeric-ish. Keep as string.
  return (input ?? "").toString().trim();
}

function listPlayerIds(dbRoom) {
  return [dbRoom.host, dbRoom.player2, dbRoom.player3, dbRoom.player4].filter(
    (v) => v !== null && v !== undefined
  );
}

async function PrivateJoin(ws, payload = {}) {
  const store = getStore();
  const userId = payload.userId;
  const roomCode = normalizeRoomCode(payload.roomCode);

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
    safeSend(ws, {
      type: "error",
      error: "ALREADY_IN_ROOM",
      payload: { roomCode: existingCode },
    });
    return;
  }

  const dbRoom = await Rooms.findByPk(roomCode);
  if (!dbRoom) {
    safeSend(ws, { type: "error", error: "ROOM_NOT_FOUND", payload: { roomCode } });
    return;
  }

  if (dbRoom.state !== "lobby") {
    safeSend(ws, {
      type: "error",
      error: "ROOM_ALREADY_STARTED",
      payload: { roomCode },
    });
    return;
  }

  const players = listPlayerIds(dbRoom);
  if (players.some((p) => String(p) === String(userId))) {
    safeSend(ws, { type: "error", error: "USER_ALREADY_IN_ROOM", payload: { roomCode } });
    return;
  }

  if (players.length >= 4) {
    safeSend(ws, { type: "error", error: "ROOM_FULL", payload: { roomCode } });
    return;
  }

  // Fill next free slot (player2 -> player4)
  if (dbRoom.player2 == null) dbRoom.player2 = userId;
  else if (dbRoom.player3 == null) dbRoom.player3 = userId;
  else if (dbRoom.player4 == null) dbRoom.player4 = userId;
  await dbRoom.save();

  addSocketToRoom(store, ws, roomCode, userId);
  const snapshot = dbRoomSnapshot(dbRoom);

  safeSend(ws, {
    type: "private.joined",
    payload: { roomCode, room: snapshot },
  });

  broadcastToRoom(store, roomCode, {
    type: "private.room.updated",
    payload: { roomCode, room: snapshot },
  });
}

module.exports = { PrivateJoin };
