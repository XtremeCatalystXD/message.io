const port = 3000;

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];
var Connection = require('tedious').Connection;
var config = {
    userName: 'messageio',  
    password: 'password',  
    // server: <ip address>
};
var Request = require('tedious').Request;
var connection = new Connection(config);
connection.on('connect', function(err) {
    console.log(err);
});

http.listen(port, function() {
    console.log("Node socket server has started successfully.");
});

app.use(express.static('public'));

io.on('connection', function(socket) {
    console.log(socket.id);

    socket.on('login', function(username, password) {
        var loginTestStatement = "SELECT UserExtendedInfo.UserId FROM UserExtendedInfo INNER JOIN Users ON UserExtendedInfo.UserId = Users.UserId WHERE Users.Username = '" + username + "' AND UserExtendedInfo.Password = HASHBYTES('SHA2_256','" + password +  "');";

        request = new Request(loginTestStatement, function(err) {  
            if (err) {
                console.log(err);
            }
        });
        
        request.on('row', function(columns) {
                console.log(column.metadata.colName.UserId.value);
        });

        connection.execSql(request);
        
        if (username != "") {
            socket.username = username;
            users.push(socket.username);
            console.log(users);
            io.emit('userConnect', socket.username);
            socket.emit('valid-username', users);
        } else {
            socket.emit('invalid-username');
        }
    });

    socket.on('send-message', function(msgData) {
        io.emit('newMessage', msgData, socket.username);
        console.log(socket.username + " sent: " + msgData + " - from " + socket.id);
    });

    socket.on('disconnect', function() {
        if (socket.username != null){
            io.emit('userDisconnect', socket.username);
            console.log(socket.username + ' disconnected.');
            users.splice(users.indexOf(socket.username), 1);
        }
    });
});