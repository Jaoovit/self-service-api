const WebSocket = require("ws");

// Create WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

// Function to broadcast data to all connected clients
const broadcastToClients = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = {
  wss,
  broadcastToClients,
};
