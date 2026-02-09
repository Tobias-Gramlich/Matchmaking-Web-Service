// Connection event handler
const WebSocketHandler = (ws) => {
  console.log('New client connected');
  
  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');

  // Message event handler
  ws.on('message', (rawMessage) => {
    const message = rawMessage.toString();
    switch (message){
      case "private.create": {console.log("Create"); break}
      case "private.join": {console.log("Join"); break}
      case "private.start": {console.log("Start"); break}
      case "private.leave": {console.log("Leave"); break}

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