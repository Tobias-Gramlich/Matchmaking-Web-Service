const { Rooms } = require("../models");
const {
  getStore,
  safeSend,
  addSocketToRoom,
  broadcastToRoom,
  dbRoomSnapshot,
} = require("./privateRoomStore");

/**
 * Creates a private room and persists it in the database.
 * The roomCode is the DB primary key (index/id).
 */
async function PrivateCreate(ws, payload = {}) {
  const store = getStore();
  const userId = payload.userId;

  if (userId === undefined || userId === null || userId === "") {
    safeSend(ws, { type: "error", error: "MISSING_USER_ID" });
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

  // Persist in DB first so we can use the ID as roomCode
  const dbRoom = await Rooms.create({
    host: userId,
    player2: null,
    player3: null,
    player4: null,
    state: "lobby", // lobby | started
  });

  const roomCode = String(dbRoom.id);
  addSocketToRoom(store, ws, roomCode, userId);

  const snapshot = dbRoomSnapshot(dbRoom);

  safeSend(ws, {
    type: "private.created",
    payload: { roomCode, room: snapshot },
  });

  // For completeness (only the creator is connected right now)
  broadcastToRoom(store, roomCode, {
    type: "private.room.updated",
    payload: { roomCode, room: snapshot },
  });
}

module.exports = { PrivateCreate };
