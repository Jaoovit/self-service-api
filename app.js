const express = require("express");
const http = require("http"); // Required for upgrading WebSocket connections
const cookieParser = require("cookie-parser");
const initializeSession = require("./config/session");
require("dotenv").config();

const app = express();
const server = http.createServer(app); // Create an HTTP server to handle both Express and WebSocket

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Prisma session configuration
initializeSession(app);

// WebSocket setup
const { wss, broadcastToClients } = require("./config/websocket");

// Handle WebSocket connection upgrades
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// Routes
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const tableRoute = require("./routes/tableRoute");
const orderRoute = require("./routes/orderRoute");

app.use(userRoute);
app.use(productRoute);
app.use(tableRoute);
app.use(orderRoute);

// Starting the server
const PORT = process.env.PORT || 7500;
server.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
