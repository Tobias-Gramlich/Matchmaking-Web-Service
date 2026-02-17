const { PrivateCreate } = require('../privateRoomFunctions/PrivateCreate');
const { PrivateJoin } = require('../privateRoomFunctions/PrivateJoin');
const { PrivateLeave } = require('../privateRoomFunctions/PrivateLeave');
const { PrivateStart } = require('../privateRoomFunctions/PrivateStart');
const {UserAuthenticationHandler} = require('./UserAuthenticationHandler');

// Connection event handler
const WebSocketHandler = (ws) => {
  console.log('New client connected');
  
  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');

  // Message event handler
  ws.on('message', (rawMessage) => {
    let message;
    try {
      message = JSON.parse(rawMessage.toString());
    }
    catch {
      ws.send(JSON.stringify({ type: "error", error: "INVALID_JSON" }));
      return;
    }

    const {type, payload = {}} = message;

    switch (type){
      case "user.authenticate": {UserAuthenticationHandler(payload); break}

      case "private.create": {PrivateCreate; break}
      case "private.join": {PrivateJoin; break}
      case "private.start": {PrivateStart; break}
      case "private.leave": {PrivateLeave; break}

      case "public.join": {console.log("Join"); break}
      case "public.leave": {console.log("Leave"); break}
    };
  });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
};

module.exports = { WebSocketHandler };