const {UserAuthenticationHandler} = require('./UserAuthenticationHandler');

// Connection event handler
const WebSocketHandler = (ws) => {
  console.log('New client connected');

  let authState = false;
  
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

    if (!authState && type === "user.authenticate"){
      const response = UserAuthenticationHandler(payload);
      if (response.error){
        ws.send(response.error);
      }
      else {
        authState = true;
      };
    };

    if (!authState && type !== "user.authenticate"){
      ws.send("Must log in first");
    };

    if (authState){
      switch (type){
        case "private.create": {console.log("Create"); break}
        case "private.join": {console.log("Join"); break}
        case "private.start": {console.log("Start"); break}
        case "private.leave": {console.log("Leave"); break}

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