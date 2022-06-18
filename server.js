const express = require("express");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");
const app = express();
const connectDB = require("./server/database/database_connection");
const cors = require("cors");
const error = require("./server/Middleware/error");
const bodyParser = require("body-parser");
var admin = require("firebase-admin");
var serviceAccount = require("./firebase.json");

//Handling uncaught Exception
//***To Do **/ 1:21 min in video

app.use(cors());
app.use(error);

dotenv.config({ path: path.join(__dirname, "config.env") });

connectDB();

const port = process.env.PORT;

app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/", require("./server/routes/Guildroute"));
app.use("/", require("./server/routes/tournament"));
app.use("/", require("./server/routes/userdata"));
app.use("/", require("./server/routes/Payment"));
app.use("/", require("./server/routes/Notification"));
app.use("/", require("./server/routes/Withdrawls"));

const server = app.listen(port, () => {
  console.log("The server is running at port 8000");
});

//Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server because of unhendled rejection error");
  server.close(() => {
    process.exit(1);
  });
});
