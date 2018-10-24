var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];

const port = 3000;

http.listen(port, function() {
    console.log("Node socket server has started successfully.");
});

app.use(express.static('public'));

io.on('connection', function(socket) {
    console.log(socket.id);
    
    socket.on('send-username', function(username) {
        if (users.includes(username)) {
            socket.emit('invalid-username', username);
        } else {
            socket.username = username;
            users.push(socket.username);
            console.log(users);
            socket.emit('valid-username');
        }
    });

    socket.on('send-message', function(msgData) {
        io.emit('newMessage', msgData, socket.username);
        console.log(socket.username + " sent: " + msgData + " - from " + socket.id);
    });

    socket.on('disconnect', function() {
        console.log(socket.username + ' disconnected.');
        users.pop(socket.username);
    });
});