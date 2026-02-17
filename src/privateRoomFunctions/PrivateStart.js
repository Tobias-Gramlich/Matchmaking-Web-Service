const { Rooms } = require("../models");
const {
  getStore,
  safeSend,
  broadcastToRoom,
  dbRoomSnapshot,
} = require("./privateRoomStore");

function normalizeRoomCode(input) {
  return (input ?? "").toString().trim();
}

function countPlayers(dbRoom) {
  let c = 0;
  if (dbRoom.host != null) c++;
  if (dbRoom.player2 != null) c++;
  if (dbRoom.player3 != null) c++;
  if (dbRoom.player4 != null) c++;
  return c;
}

async function PrivateStart(ws, payload = {}) {
  const store = getStore();
  const userId = payload.userId;
  const roomCodeFromPayload = normalizeRoomCode(payload.roomCode);
  const roomCode = roomCodeFromPayload || store.codeBySocket.get(ws);

  if (userId === undefined || userId === null || userId === "") {
    safeSend(ws, { type: "error", error: "MISSING_USER_ID" });
    return;
  }
  if (!roomCode) {
    safeSend(ws, { type: "error", error: "MISSING_ROOM_CODE" });
    return;
  }

  const dbRoom = await Rooms.findByPk(roomCode);
  if (!dbRoom) {
    safeSend(ws, { type: "error", error: "ROOM_NOT_FOUND", payload: { roomCode } });
    return;
  }

  if (String(dbRoom.host) !== String(userId)) {
    safeSend(ws, { type: "error", error: "ONLY_HOST_CAN_START", payload: { roomCode } });
    return;
  }

  if (dbRoom.state !== "lobby") {
    safeSend(ws, { type: "error", error: "ROOM_ALREADY_STARTED", payload: { roomCode } });
    return;
  }

  if (countPlayers(dbRoom) < 2) {
    safeSend(ws, { type: "error", error: "NOT_ENOUGH_PLAYERS", payload: { roomCode, minPlayers: 2 } });
    return;
  }

  dbRoom.state = "started";
  await dbRoom.save();

  const snapshot = dbRoomSnapshot(dbRoom);
  broadcastToRoom(store, roomCode, {
    type: "private.started",
    payload: { roomCode, room: snapshot },
  });
}

module.exports = { PrivateStart };
