const { Rooms } = require("../models");
const {
  getStore,
  safeSend,
  broadcastToRoom,
  dbRoomSnapshot,
} = require("./privateRoomStore");

//* Normalize RoomCode
function normalizeRoomCode(input) {
  return (input ?? "").toString().trim();
}

//* Count Players
function countPlayers(dbRoom) {
  let c = 0;
  if (dbRoom.host != null) c++;
  if (dbRoom.player2 != null) c++;
  if (dbRoom.player3 != null) c++;
  if (dbRoom.player4 != null) c++;
  return c;
}

//* Start a Room
async function PrivateStart(ws, payload = {}) {
  const store = getStore();
  const userId = payload.userId;
  const roomCodeFromPayload = normalizeRoomCode(payload.roomCode);
  const roomCode = roomCodeFromPayload || store.codeBySocket.get(ws);

  //* Check if UserID and RoomCode are there
  if (userId === undefined || userId === null || userId === "") {
    safeSend(ws, { type: "error", error: "Missing UserID" });
    return;
  }
  if (!roomCode) {
    safeSend(ws, { type: "error", error: "Missing RoomCode" });
    return;
  }

  //* Find Room in DB
  const dbRoom = await Rooms.findByPk(roomCode);
  if (!dbRoom) {
    safeSend(ws, { type: "error", error: "Room not found", payload: { roomCode } });
    return;
  }

  //* Chekc if User is Host
  if (String(dbRoom.host) !== String(userId)) {
    safeSend(ws, { type: "error", error: "Only Host can start", payload: { roomCode } });
    return;
  }

  //* Check if Room hasnt started
  if (dbRoom.state !== "lobby") {
    safeSend(ws, { type: "error", error: "Room already started", payload: { roomCode } });
    return;
  }

  //* Check if there are enough Players
  if (countPlayers(dbRoom) < 2) {
    safeSend(ws, { type: "error", error: "Not enough players", payload: { roomCode, minPlayers: 2 } });
    return;
  }

  //* Start Room
  dbRoom.state = "started";
  await dbRoom.save();

  //* Broadcast Start
  const snapshot = dbRoomSnapshot(dbRoom);
  broadcastToRoom(store, roomCode, {
    type: "private.started",
    payload: { roomCode, room: snapshot },
  });
}

module.exports = { PrivateStart };
