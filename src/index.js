const path = require("path");
const http = require("http");

const express = require("express");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on("connection", socket => {
 console.log("New websocket connection");
 socket.on("join", ({ username, room }, callback) => {
  const { error, user } = addUser({
   id: socket.id,
   username: username,
   room: room
  });
  if (error) {
   return callback(error);
  }
  socket.join(user.room);

  socket.emit("message", generateMessage("Admin", "Welcome"));
  socket.broadcast
   .to(user.room)
   .emit("message", generateMessage("Admin", `${user.username} has joined!`));
  //
  io.to(user.room).emit("roomData", {
   room: user.room,
   users: getUsersInRoom(user.room)
  });
  callback();
  //io.to.emit:send message in a particular room not everyone;
  //socket.broadcast.to.emit
 });

 socket.on("sendMessage", (message, callback) => {
  const user = getUser(socket.id);

  const filter = new Filter();
  if (filter.isProfane(message)) {
   return callback("Profanity is not allowed");
  }

  io.to(user.room).emit("message", generateMessage(user.username, message));
  callback("delivered");
 });
 socket.on("disconnect", () => {
  const user = removeUser(socket.id);
  if (user) {
   io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left`));
   io.to(user.room).emit("roomData", {
    room: user.room,
    users: getUsersInRoom(user.room)
   });
  }
 });
 /**
 |--------------------------------------------------
 | receive user location and send it out
 |--------------------------------------------------
 */
 socket.on("sendLocation", (position, callback) => {
  const user = getUser(socket.id);
  io
   .to(user.room)
   .emit(
    "locationMessage",
    generateMessage(user.username, `https://google.com/maps?q=${position.lat},${position.long}`)
   );
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
