const { PrivateCreate } = require('../privateRoomFunctions/PrivateCreate');
const { PrivateJoin } = require('../privateRoomFunctions/PrivateJoin');
const { PrivateLeave } = require('../privateRoomFunctions/PrivateLeave');
const { PrivateStart } = require('../privateRoomFunctions/PrivateStart');
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
        case "private.create": 
        const p1 = { ...payload, userId: User.userId, userName: User.userName };
        {PrivateCreate(ws, p1); 
          break}
        case "private.join": 
        const p2 = { ...payload, userId: User.userId, userName: User.userName };
        {PrivateJoin(ws, p2); 
          break}
        case "private.start": 
        const p3 = { ...payload, userId: User.userId, userName: User.userName };
        {PrivateStart(ws, p3); 
          break}
        case "private.leave": 
        const p4 = { ...payload, userId: User.userId, userName: User.userName };
        {PrivateLeave(ws, p4); 
          break}

        case "public.join": {console.log("Join"); break}
        case "public.leave": {console.log("Leave"); break}
      };
    };
  });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
};

module.exports = { WebSocketHandler };