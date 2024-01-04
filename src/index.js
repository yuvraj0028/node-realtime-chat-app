// emit events
// socket.emit, io.emit, socket.broadcast.emit

// emit to a specific room
// io.to(room).emit, socket.broadcast.to(room).emit

const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/user");

// initialize express
const app = express();
// initialize http server
const server = http.createServer(app);
// initialize socketio
const io = socketio(server);

const port = process.env.PORT || 3000;
// define paths for express config
const publicDirectoryPath = path.join(__dirname, "../public");

// setup static directory to serve
app.use(express.static(publicDirectoryPath));

// let count = 0;

// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

// let's listen for new connections
io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  // socket.emit("message", generateMessage("Welcome!"));
  // socket.broadcast.emit("message", "A new user has joined!");

  socket.on("join", ({ username, room }, callback) => {
    // specifically emit event according to room name eg: no one can check whats going on in another room
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    const user = getUser(socket.id);

    if (!user) {
      return callback("You are not authenticated");
    }

    // if (filter.isProfane(message)) {
    //   return callback("Profanity is not allowed!");
    // }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  //   socket.emit("countUpdated", count);

  //   socket.on("increment", () => {
  //     count++;
  // notify only the current connection
  // socket.emit("countUpdated", count);

  // notify all connections
  //     io.emit("countUpdated", count);
  //   });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    if (!user) {
      return callback("You are not authenticated");
    }

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.Latitude},${coords.Longitude}`
      )
    );
    callback();
  });
});

// start the server
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
