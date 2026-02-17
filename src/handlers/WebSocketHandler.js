const { PrivateCreate } = require('../privateRoomFunctions/PrivateCreate');
const { PrivateJoin } = require('../privateRoomFunctions/PrivateJoin');
const { PrivateLeave } = require('../privateRoomFunctions/PrivateLeave');
const { PrivateStart } = require('../privateRoomFunctions/PrivateStart');
const {UserAuthenticationHandler} = require('./UserAuthenticationHandler');

function safeSend(ws, obj) {
  try {
    ws.send(typeof obj === 'string' ? obj : JSON.stringify(obj));
  } catch (_) {}
}

// Connection event handler
const WebSocketHandler = (ws) => {
  console.log('New client connected');

  let User = {"userId" : 1, "userName" : "Test"};

  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');

  // Message event handler
  ws.on('message', (rawMessage) => {
    let message;
    try {
      message = JSON.parse(rawMessage.toString());
    }
    catch {
      ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
      return;
    }

    const {type, payload = {}} = message;

    if (!User.userId && type === "user.authenticate"){
      const response = UserAuthenticationHandler(payload);
      if (response.error){
        ws.send(response.error);
      }
      else {
        User.userId = response.userId;
        User.userName = response.userName;
        ws.send("Logged in as: " + User.userName);
      };
    };

    if (!User.userId && type !== "user.authenticate"){
      ws.send("Must log in first");
    };

    if (User.userId){
      switch (type){
        case "private.create":
        const p1 = { ...payload, userId: User.userId, userName: User.userName };
        {
          Promise.resolve(PrivateCreate(ws, p1)).catch((err) => {
            console.error(err);
            safeSend(ws, { type: 'error', error: 'INTERNAL_ERROR' });
          });
          break;
        }

        case "private.join":
        const p2 = { ...payload, userId: User.userId, userName: User.userName };
        {
          Promise.resolve(PrivateJoin(ws, p2)).catch((err) => {
            console.error(err);
            safeSend(ws, { type: 'error', error: 'INTERNAL_ERROR' });
          });
          break;
        }

        case "private.start":
        const p3 = { ...payload, userId: User.userId, userName: User.userName };
        {
          Promise.resolve(PrivateStart(ws, p3)).catch((err) => {
            console.error(err);
            safeSend(ws, { type: 'error', error: 'INTERNAL_ERROR' });
          });
          break;
        }

        case "private.leave":
        const p4 = { ...payload, userId: User.userId, userName: User.userName };
        {
          Promise.resolve(PrivateLeave(ws, p4)).catch((err) => {
            console.error(err);
            safeSend(ws, { type: 'error', error: 'INTERNAL_ERROR' });
          });
          break;
        }

        case "public.join": {console.log("Join"); break}
        case "public.leave": {console.log("Leave"); break}
      };
    };
  });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');

    // If the socket was still in a room, leave gracefully and update DB.
    Promise.resolve(PrivateLeave(ws, { userId: User.userId })).catch((err) => {
      console.error(err);
    });
  });
};

module.exports = { WebSocketHandler };
