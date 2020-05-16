var express = require('express');
var socket = require('socket.io');
var mongoose = require('mongoose');
var Chat = require('./model');

// App setup
var app = express();
var server = app.listen(9000, function(){
    console.log('listening for requests on port 9000,');
});
mongoose.connect("mongodb://localhost:27017/chat")
.then(() => {
    console.log("Connected to DB");
})
// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    // confirm connection to client
    socket.emit('connected',"online", socket.id);
    

    // check db for room
    socket.on('checkCreds', (data) => {
        Chat.findOne({name : data.name})
        .then((result) => {
            if(result !== null){
                // when matched
                if(result.password === data.password){
                    socket.emit('matched',true);
                    // join room

                    socket.join(data.name);
                    socket.emit('joined','you joined');
                    console.log(`Joined ${data.name} room by ${socket.id}`)
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
                    socket.join(data.name);
                    console.log(`Joined ${data.name} room by ${socket.id}`)
                })
                .catch(err => console.log(err))
            }
        })
        .catch(err =>  console.log(err));
    })

    // get old chat data and emit
    // Chat.find({}).sort({createdAt : -1}).exec((err, docs) => {
    //     if(err) return console.log(err)
    //     socket.emit('oldChat', docs);
    // })

    // print client in console
    console.log('made socket connection', socket.id );

    // print message in console and send it back
    socket.on('msg', (data, roomName) => {
        console.log("Data recived : ", data, "by : ", socket.id, roomName);
        io.in(roomName).emit('receiveChat', data);
        
    })

});