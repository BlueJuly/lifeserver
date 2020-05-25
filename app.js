const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);
let interval;
function socketIdsInRoom(name) {
  console.log("------");
  console.log(io.sockets.adapter.rooms[name]);
  io.of('/').in(name).clients((error, clients) => {
    if (error) throw error;
    var socketIds = clients;
    return socketIds;
    // if (socketIds) {
    //   var collection = [];
    //   for (var key in socketIds) {
    //     collection.push(key);
    //   }
    //   return collection;
    // } else {
    //   return [];
    // }
  });
    
  }
io.on("connection", (socket) => {
  console.log("New client connected");
  // if (interval) {
  //   clearInterval(interval);
  // }
  // interval = setInterval(() => getApiAndEmit(socket), 1000);
  
  socket.on('disconnect', function(){
    console.log('disconnect');
    //clearInterval(interval);
    if (socket.room) {
      var room = socket.room;
      io.to(room).emit('leave', socket.id);
      socket.leave(room);
    }
  });

  socket.on('join', function(name, callback){
    console.log('join', name);
    var socketIds = socketIdsInRoom(name);
    callback(socketIds);
    socket.join(name);
    socket.room = name;
  });


  socket.on('exchange', function(data){
    console.log('exchange', data);
    data.from = socket.id;
    var to = io.sockets.connected[data.to];
    to.emit('exchange', data);
  });
});

const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));