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
database.sequelize.sync({ alter: true }).then(() => {
    app.listen(3001, () => {
        console.log("Server Running");
    });
}).catch((error) => {
    console.log(error);
});

// Websocket import
const WebSocket = require('ws');
const { WebSocketHandler } = require('./handlers/WebSocketHandler');

// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server is running on ws://localhost:8080');

wss.on('connection', WebSocketHandler);