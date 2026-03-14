const { PrivateCreate } = require('../privateRoomFunctions/PrivateCreate');
const { PrivateJoin } = require('../privateRoomFunctions/PrivateJoin');
const { PrivateLeave } = require('../privateRoomFunctions/PrivateLeave');
const { PrivateStart } = require('../privateRoomFunctions/PrivateStart');

const {UserAuthenticationHandler} = require('./UserAuthenticationHandler');

//* Function to safely send an Object
function safeSend(ws, obj) {
  try {
    ws.send(typeof obj === 'string' ? obj : JSON.stringify(obj));
  } catch (error) {
    console.log(error);
  }
}

//* Function to parse Message to JSON
function messageToJson(ws, rawMessage){
    try {
      let message = JSON.parse(rawMessage.toString());
      return message;
    }
    catch {
      safeSend(ws, { type: 'error', error: 'Invalid JSON' });
      return;
    }
}

//* Connection event handler
const WebSocketHandler = (ws) => {
  //* Initialize User
  let User = {};

  //* Send a welcome message to the client
  ws.send('Welcome to Skyjo!');

  //* Message event handler
  ws.on('message', async (rawMessage) => {
    //* Parse Message to JSON
    let message = messageToJson(ws, rawMessage);

    //* Destruct Message
    const {type, payload = {}} = message;

    //* Check if everything is there
    if (!type) safeSend(ws, { type: 'error', error: 'Missing Type' });
    if (!payload) safeSend(ws, { type: 'error', error: 'Missing Payload' });

    //* Check if User wants to authenticate
    if (!User.userId && type === "user.authenticate"){
      //* Authenticate User
      const response = await UserAuthenticationHandler(payload);
      if (response.error){
        ws.send(response.error);
      }
      else {
        User.userId = response.userId;
        User.userName = response.userName;
        ws.send("Logged in as: " + User.userName);
      };
    };

    //* Check if User wants to do an action without being logged in
    if (!User.userId && type !== "user.authenticate"){
      safeSend(ws, { type: 'error', error: 'Must log in first' });
    };

    //* Check if User is logged in
    if (User.userId){
      //* Differentiate between types
      switch (type){
        //* Create Private Room
        case "private.create":
          const p1 = { ...payload, userId: User.userId, userName: User.userName };
          {
            Promise.resolve(PrivateCreate(ws, p1)).catch((err) => {
              console.error(err);
              safeSend(ws, { type: 'error', error: 'INTERNAL_ERROR' });
            });
            break;
          }

        //* Join Private Room
        case "private.join":
          const p2 = { ...payload, userId: User.userId, userName: User.userName };
          {
            Promise.resolve(PrivateJoin(ws, p2)).catch((err) => {
              console.error(err);
              safeSend(ws, { type: 'error', error: 'INTERNAL_ERROR' });
            });
            break;
          }

        //* Start Private Room
        case "private.start":
          const p3 = { ...payload, userId: User.userId, userName: User.userName };
          {
            Promise.resolve(PrivateStart(ws, p3)).catch((err) => {
              console.error(err);
              safeSend(ws, { type: 'error', error: 'INTERNAL_ERROR' });
            });
            break;
          }

        //* Leave Private Room
        case "private.leave":
          const p4 = { ...payload, userId: User.userId, userName: User.userName };
          {
            Promise.resolve(PrivateLeave(ws, p4)).catch((err) => {
              console.error(err);
              safeSend(ws, { type: 'error', error: 'INTERNAL_ERROR' });
            });
            break;
          }

        //* Default
        default:
          safeSend(ws, { type: 'error', error: 'Invalid Action Type' });
        
      };
    };
  });

  //* Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');

    //* If the socket was still in a room, leave gracefully and update DB.
    Promise.resolve(PrivateLeave(ws, { userId: User.userId })).catch((err) => {
      console.error(err);
    });
  });
};

module.exports = { WebSocketHandler };
