const express = require("express");
const cookieParser = require("cookie-parser");
const initializeSession = require("./config/session");
require("dotenv").config();

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Prisma session configuration
initializeSession(app);

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
app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
