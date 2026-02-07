// Websocket import
const WebSocket = require('ws');

// Express Configuration
const express = require('express');
const app = express();
app.use(express.json());

// Cors Configuration
const cors = require('cors');
app.use(cors());

// Models import
const database = require('./models');
const {Rooms} = require('./models');

// Initializing Database Connection
database.sequelize.sync().then(() => {
    app.listen(3001, () => {
        console.log("Server Running");
    });
}).catch((error) => {
    console.log(error);
});

//TODO: Maybe seperate file
// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server is running on ws://localhost:8080');

// Connection event handler
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Creates a Dummy in Database
  //TODO: Delete later
  Rooms.create({host: 123, player2: 123, state: "Test"});
  
  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');

  // Message event handler
  ws.on('message', (message) => {
    //TODO: Change from Plain Text to Objects
    if (message == "Open Private Room"){
        //TODO: Logic
    };

    if (message == "Connect to Private Room"){
        //TODO: Logic
    };
  });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});