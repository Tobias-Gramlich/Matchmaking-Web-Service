const { Rooms } = require("../models");
const {
  getStore,
  safeSend,
  addSocketToRoom,
  broadcastToRoom,
  dbRoomSnapshot,
} = require("./privateRoomStore");

//* Normalize RoomCode
function normalizeRoomCode(input) {
  return (input ?? "").toString().trim();
}

//* Returns list of Player IDs
function listPlayerIds(dbRoom) {
  return [dbRoom.host, dbRoom.player2, dbRoom.player3, dbRoom.player4].filter(
    (v) => v !== null && v !== undefined
  );
}

//* Join private Room
async function PrivateJoin(ws, payload = {}) {
  const store = getStore();
  const userId = payload.userId;
  const roomCode = normalizeRoomCode(payload.roomCode);

  //* Check for UserID and RoomCode
  if (userId === undefined || userId === null || userId === "") {
    safeSend(ws, { type: "error", error: "Missing UserID" });
    return;
  }
  if (!roomCode) {
    safeSend(ws, { type: "error", error: "Missing RoomCode" });
    return;
  }

  //* Check if Client is already in a Room
  const existingCode = store.codeBySocket.get(ws);
  if (existingCode) {
    safeSend(ws, {
      type: "error",
      error: "User already in Room",
      payload: { roomCode: existingCode },
    });
    return;
  }

  //* Search for Room in Database
  const dbRoom = await Rooms.findByPk(roomCode);
  if (!dbRoom) {
    safeSend(ws, { type: "error", error: "Room not found", payload: { roomCode } });
    return;
  }

  //* Check if Room is open
  if (dbRoom.state !== "lobby") {
    safeSend(ws, {
      type: "error",
      error: "Room already started",
      payload: { roomCode },
    });
    return;
  }

  //* Check if Client is already in Room
  const players = listPlayerIds(dbRoom);
  if (players.some((p) => String(p) === String(userId))) {
    safeSend(ws, { type: "error", error: "User already in Room", payload: { roomCode } });
    return;
  }

  //* Check if Room is full
  if (players.length >= 4) {
    safeSend(ws, { type: "error", error: "Room already full", payload: { roomCode } });
    return;
  }

  //* Fill next free slot (player2 -> player4)
  if (dbRoom.player2 == null) dbRoom.player2 = userId;
  else if (dbRoom.player3 == null) dbRoom.player3 = userId;
  else if (dbRoom.player4 == null) dbRoom.player4 = userId;
  await dbRoom.save();

  //* Add Socket to Room
  addSocketToRoom(store, ws, roomCode, userId);
  const snapshot = dbRoomSnapshot(dbRoom);

  //* Send back Success
  safeSend(ws, {
    type: "private.joined",
    payload: { roomCode, room: snapshot },
  });

  //* Broadcast Updates to Room
  broadcastToRoom(store, roomCode, {
    type: "private.room.updated",
    payload: { roomCode, room: snapshot },
  });
}

module.exports = { PrivateJoin };
