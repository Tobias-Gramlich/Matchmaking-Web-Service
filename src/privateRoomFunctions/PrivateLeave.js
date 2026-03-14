const { Rooms } = require("../models");
const {
  getStore,
  safeSend,
  removeSocketFromRoom,
  broadcastToRoom,
  cleanupRoom,
  dbRoomSnapshot,
} = require("./privateRoomStore");

//* Normalize RoomCode
function normalizeRoomCode(input) {
  return (input ?? "").toString().trim();
}

//* Leave Private Room
async function PrivateLeave(ws, payload = {}) {
  const store = getStore();
  const roomCodeFromPayload = normalizeRoomCode(payload.roomCode);
  const roomCode = roomCodeFromPayload || store.codeBySocket.get(ws);
  const userId = payload.userId ?? store.userIdBySocket.get(ws);

  //* Check for RoomCode
  if (!roomCode) {
    safeSend(ws, { type: "error", error: "User not in Room" });
    return;
  }

  //* Search for Room in DB
  const dbRoom = await Rooms.findByPk(roomCode);

  //* Remove socket mapping
  removeSocketFromRoom(store, ws);

  //* Check if Room exists
  if (!dbRoom) {
    safeSend(ws, { type: "error", error: "Room not found", payload: { roomCode } });
    return;
  }

  //* Check if User is Host
  const isHost = String(dbRoom.host) === String(userId);
  if (isHost) {
    //* Close Room
    await dbRoom.destroy();

    //* Broadcast that Host left
    broadcastToRoom(store, roomCode, {
      type: "private.room.closed",
      payload: { roomCode, reason: "HOST_LEFT" },
    });

    //* Cleanup Room
    cleanupRoom(store, roomCode);

    //* Send back left
    safeSend(ws, { type: "private.left", payload: { roomCode, closed: true } });
    return;
  }

  //* Remove player from its slot (if present)
  let removed = false;
  if (String(dbRoom.player2) === String(userId)) {
    dbRoom.player2 = null;
    removed = true;
  } else if (String(dbRoom.player3) === String(userId)) {
    dbRoom.player3 = null;
    removed = true;
  } else if (String(dbRoom.player4) === String(userId)) {
    dbRoom.player4 = null;
    removed = true;
  }

  //* Check if User was removed
  if (!removed) {
    safeSend(ws, { type: "error", error: "User not in Room" });
    return;
  }

  //* Save DB and create Snapshot
  await dbRoom.save();
  const snapshot = dbRoomSnapshot(dbRoom);

  //* Broadcast Updates
  broadcastToRoom(store, roomCode, {
    type: "private.room.updated",
    payload: { roomCode, room: snapshot },
  });

  //* Send Success back
  safeSend(ws, {
    type: "private.left",
    payload: { roomCode, closed: false },
  });
}

module.exports = { PrivateLeave };
