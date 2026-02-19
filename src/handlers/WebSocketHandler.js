const { PrivateCreate } = require('../privateRoomFunctions/PrivateCreate');
const { PrivateJoin } = require('../privateRoomFunctions/PrivateJoin');
const { PrivateLeave } = require('../privateRoomFunctions/PrivateLeave');
const { PrivateStart } = require('../privateRoomFunctions/PrivateStart');

const {PublicJoin} = require('../publicRoomFunctions/PublicJoin');
const {PublicLeave} = require('../publicRoomFunctions/PublicLeave');
const {UserAuthenticationHandler} = require('./UserAuthenticationHandler');

// Connection event handler
const WebSocketHandler = (ws) => {
  console.log('New client connected');

  let User = {"userId" : null, "userName" : null};
  
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
        case "private.create": {PrivateCreate; break}
        case "private.join": {PrivateJoin; break}
        case "private.start": {PrivateStart; break}
        case "private.leave": {PrivateLeave; break}

        case "public.join": {PublicJoin(payload); break}
        case "public.leave": {PublicLeave; break}
      };
    };
  });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
};

module.exports = { WebSocketHandler };