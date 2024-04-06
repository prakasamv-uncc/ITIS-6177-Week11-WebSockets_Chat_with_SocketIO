const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const userList = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('Enter User name', (userName) => {
    // Store userName along with socket ID
    userList[socket.id] = userName;
    // Notify other users about new user joining with userName
    socket.broadcast.emit('user connected', userName);
  });

  // Handle chat message event
  socket.on('chat message', (msg) => {
    // Retrieve userName of sender
    const userName = userList[socket.id];
    // Broadcast message with userName to other users
    socket.broadcast.emit('chat message', { userName, msg });
  });

  // Handle typing event
  socket.on('typing', () => {
    const typingUserName = userList[socket.id];
    socket.broadcast.emit( typingUserName + 'is typing',);
  });

  // Handle stop typing event
  socket.on('stop typing', () => {
    socket.broadcast.emit('user stop typing');
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    const userName = userList[socket.id];
    // Remove user from userList object
    delete userList[socket.id];
    // Notify connected users when someone disconnects, with userName
    socket.broadcast.emit('user disconnected', userName);
  });
});

server.listen(3000, () => {
  console.log('listening on http://localhost:3000/');
});