var express = require('express');
var socket = require('socket.io');
var mongoose = require('mongoose');
var Chat = require('./model');

// App setup
var app = express();
var server = app.listen(process.env.PORT || 9000, function(){
    console.log('listening for requests on port 9000,');
});

// mongoose  stuff
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// connection to mongo
const url = "mongodb://localhost:27017/chat"
mongoose.connect(process.env.MONGODB_URI || url)
.then(() => {
    console.log("Connected to DB");
})
// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {
    console.log("Connection :", socket.id);
    // check db for room
    socket.on('checkCreds', (data, userName) => {
        Chat.findOne({name : data.name})
        .then((result) => {
            if(result !== null){
                // when matched
                if(result.password === data.password){
                    socket.emit('matched',true);
                    // join room
                    socket.join(data.name, () => {
                        socket.in(data.name).emit('user joined', userName);
                    });
                }
                // when password is wrong
                else{
                    socket.emit('matched', false);
                }
            }
            else{
                // create room
                Chat.create(data)
                .then((result) => {
                    socket.emit('newRoom', true)

                    // join room
                    socket.join(data.name, () => {
                        socket.in(data.name).emit('user joined', userName);
                    });
                })
                .catch(err => console.log(err))
            }
        })
        .catch(err =>  console.log(err));
    })

    // print message in console and send it back
    socket.on('msg', (data, roomName) => {
        io.in(roomName).emit('receiveChat', data);
        
    })

    // send if a user is typing
    socket.on('typing', (name, roomName) => {
        socket.in(roomName).emit('isTyping', name);
    })

    // if typing stopped
    socket.on('stoppedTyping', (roomName) => {
        socket.in(roomName).emit('typeStop');
    })
    // remove from room logic
    // delete room
});