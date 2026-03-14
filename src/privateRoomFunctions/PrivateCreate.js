const { Rooms } = require("../models");
const {
  getStore,
  safeSend,
  addSocketToRoom,
  broadcastToRoom,
  dbRoomSnapshot,
} = require("./privateRoomStore");

//* Create a private Room
async function PrivateCreate(ws, payload = {}) {
  const store = getStore();
  const userId = payload.userId;

  //* Check for existing UserID
  if (userId === undefined || userId === null || userId === "") {
    safeSend(ws, { type: "error", error: "Missing UserID" });
    return;
  }

  //* Check if User is already in Room
  const existingCode = store.codeBySocket.get(ws);
  if (existingCode) {
    safeSend(ws, {
      type: "error",
      error: "User already in Room",
      payload: { roomCode: existingCode },
    });
    return;
  }

  //* Create Room in Database
  const dbRoom = await Rooms.create({
    host: userId,
    player2: null,
    player3: null,
    player4: null,
    state: "lobby",
  });

  //* Get RoomCode
  const roomCode = String(dbRoom.id);
  addSocketToRoom(store, ws, roomCode, userId);

  //* Create a snapshot
  const snapshot = dbRoomSnapshot(dbRoom);

  //* Send back RoomCode and Snapshot
  safeSend(ws, {
    type: "private.created",
    payload: { roomCode, room: snapshot },
  });

  //* Broadcast Update to Room
  broadcastToRoom(store, roomCode, {
    type: "private.room.updated",
    payload: { roomCode, room: snapshot },
  });
}

module.exports = { PrivateCreate };
