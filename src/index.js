const path = require("path");
const http = require("http");

const express = require("express");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const Filter = require("bad-words");

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on("connection", socket => {
 console.log("New websocket connection");
 socket.emit("message", "welcome");
 socket.broadcast.emit("message", "A new user has joined");
 socket.on("sendMessage", (message, callback) => {
  const filter = new Filter();
  if (filter.isProfane(message)) {
   return callback("Profanity is not allowed");
  }
  io.emit("sendMessage", message);
  callback("delivered");
 });
 socket.on("disconnect", () => {
  io.emit("message", "a use has left");
 });
 /**
 |--------------------------------------------------
 | receive user location and send it out
 |--------------------------------------------------
 */
 socket.on("sendLocation", (position, callback) => {
  io.emit("sendLocation", `https://google.com/maps?q=${position.lat},${position.long}`);
  callback("Location is shared");
 });
});
server.listen(port, () => {
 console.log(`app started and is listening at ${port}`);
});
/**
|--------------------------------------------------
| 
|--------------------------------------------------
*/
