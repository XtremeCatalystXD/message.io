//Package Declarations
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('dotenv').config();

//Passed in functions
const { initialConnection ,userLogin, userRegistration } = require('./src/sql_functions/authentication');

//Global Variable Instantiation 
var users = [];
const port = process.env.PORT || 3000;

//Socket IO Initial Connection
initialConnection();

//Open the Port to Listen on for Socket Server
http.listen(port, function() {
    console.log("Node socket server has started successfully.");
});

app.use(express.static('public'));

io.on('connection', function(socket) {
    console.log(socket.id);

    //Authentication: User Requests
    socket.on('createUser', (username, password, email, name, age) => {userRegistration(username, password, email, name, age)});
    socket.on('login', (username, password) => {
        if(userLogin(username, password)) {
            socket.username = username;
            users.push(socket.username);
            console.log(users);
            io.emit('userConnect', socket.username);
            socket.emit('valid-username', users);
        } else {socket.emit('invalid-username');}
    });

    //Message sending Request
    socket.on('send-message', function(msgData) {
        io.emit('newMessage', msgData, socket.username);
        console.log(socket.username + " sent: " + msgData + " - from " + socket.id);
    });

    //Disconnection Request
    socket.on('disconnect', function() {
        if (socket.username != null){
            io.emit('userDisconnect', socket.username);
            console.log(socket.username + ' disconnected.');
            users.splice(users.indexOf(socket.username), 1);
        }
    });
});
