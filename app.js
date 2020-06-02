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
let androidDevice;
let iOSDevice;
androidDevice = {
  deviceToken:undefined,
  socket:undefined
};
iOSDevice = {
  deviceToken:undefined,
  socket:undefined
};
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
  if (socket.handshake.query.device){
    if(socket.handshake.query.device==='android'){
      socket.deviceType = 'android';
      androidDevice.socket = socket;
      console.log('------android socket.id---------');
      console.log(androidDevice.socket.id);
    }
    if(socket.handshake.query.device==='iOS'){
      iOSDevice.socket = socket;
      socket.deviceType = 'iOS';
      console.log('------iOS socket.id---------');
      console.log(iOSDevice.socket.id);
    }
  }
  
  
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
    io.of('/').in(name).clients((error, clients) => {
      if (error) throw error;
      //console.log("---return socket ids are---");
      console.log(clients);
      socket.emit('joinResponse', clients);
    })
    
    socket.join(name);
    socket.room = name;
  });
  socket.on('prepareCall', function(){
    if (socket.deviceType === 'android') {
      console.log('------try to call iOS---------');
      socket.emit('startCall', iOSDevice.socket);
      console.log('------iOS socket.id---------');
      console.log(iOSDevice.socket.id);
    }
    if (socket.deviceType === 'iOS') {
      console.log('------try to call android---------');
      console.log('------android socket.id---------');
      console.log(androidDevice.socket.id);
      socket.emit('startCall', androidDevice.socket);
    }
  });


  socket.on('exchange', function(data){
    //console.log('exchange', data);
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