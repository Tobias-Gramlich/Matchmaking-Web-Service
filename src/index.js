// .env Import
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Express Configuration
const express = require('express');
const app = express();
app.use(express.json());

// Cors Configuration
const cors = require('cors');
app.use(cors());

// Models import
const database = require('./models');

// Initializing Database Connection
database.sequelize.sync({ alter: true }).then(() => {
    app.listen(process.env.MATCHMAKING_PORT || 3001, () => {
        console.log(`----------------------------------------------------`);
        console.log(`-----Matchmaking Server is running on Port ${process.env.MATCHMAKING_PORT}-----`);
        console.log(`----------------------------------------------------`);
    });
}).catch((error) => {
    console.log(error);
});

// Websocket import
const WebSocket = require('ws');
const { WebSocketHandler } = require('./handlers/WebSocketHandler');

// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: parseInt(process.env.MATCHMAKING_WS_PORT, 10) || 8080 });
console.log(`-------------------------------------------------------`);
console.log(`-----Matchmaking Websocket is running on Port ${process.env.MATCHMAKING_WS_PORT}-----`);
console.log(`-------------------------------------------------------`);

wss.on('connection', WebSocketHandler);