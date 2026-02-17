const { Rooms } = require("../models");
const {
  getStore,
  safeSend,
  removeSocketFromRoom,
  broadcastToRoom,
  cleanupRoom,
  dbRoomSnapshot,
} = require("./privateRoomStore");

function normalizeRoomCode(input) {
  return (input ?? "").toString().trim();
}

async function PrivateLeave(ws, payload = {}) {
  const store = getStore();

  const roomCodeFromPayload = normalizeRoomCode(payload.roomCode);
  const roomCode = roomCodeFromPayload || store.codeBySocket.get(ws);
  const userId = payload.userId ?? store.userIdBySocket.get(ws);

  if (!roomCode) {
    safeSend(ws, { type: "error", error: "NOT_IN_ROOM" });
    return;
  }

  const dbRoom = await Rooms.findByPk(roomCode);
  // Always remove socket mapping, even if DB room is gone
  removeSocketFromRoom(store, ws);

  if (!dbRoom) {
    safeSend(ws, { type: "error", error: "ROOM_NOT_FOUND", payload: { roomCode } });
    return;
  }

  const isHost = String(dbRoom.host) === String(userId);
  if (isHost) {
    // Closing room: remove from DB and inform connected sockets
    await dbRoom.destroy();

    broadcastToRoom(store, roomCode, {
      type: "private.room.closed",
      payload: { roomCode, reason: "HOST_LEFT" },
    });

    cleanupRoom(store, roomCode);

    safeSend(ws, { type: "private.left", payload: { roomCode, closed: true } });
    return;
  }

  // Remove player from its slot (if present)
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

  if (!removed) {
    safeSend(ws, { type: "error", error: "NOT_IN_ROOM" });
    return;
  }

  await dbRoom.save();
  const snapshot = dbRoomSnapshot(dbRoom);

  broadcastToRoom(store, roomCode, {
    type: "private.room.updated",
    payload: { roomCode, room: snapshot },
  });

  safeSend(ws, {
    type: "private.left",
    payload: { roomCode, closed: false },
  });
}

module.exports = { PrivateLeave };
