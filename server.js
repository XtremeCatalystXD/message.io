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
    // server: <ip address>,
    options:{
        database: "messageio"
    }
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

    socket.on('createUser', function(username, password, email, name, age) {

        var testEmailStatement = "SELECT * FROM dbo.Users WHERE Username='" + username + "';";
        testEmailRequest = new Request(testEmailStatement, function(err, rowCount) {  
            if (err) {
                console.log(err);
            } else {
                if (rowCount == 0) {
                    var userCreateStatement = "INSERT INTO dbo.Users VALUES ('" + username + "', 1, '" + email + "')";
                    createUserRequest = new Request(userCreateStatement, function(err) {  
                        if (err) {
                            console.log(err);
                            break;
                        } else {
                        }
                    });

                    connection.execSql(createUserRequest);

                    var getUserId = "SELECT userId FROM dbo.Users WHERE username='" + username + "'";
                    getUserIdRequest = new Request(getUserId, function(err) {  
                        if (err) {
                            console.log(err);
                            break;
                        } else {
                            
                        }
                    });

                    getUserIdRequest.on('row', function(columns) {
                        var databaseUserId = columns[0].value;
                        console.log(databaseUserId);
                        var userExtendedInfoStatement = "INSERT INTO dbo.UserExtendedInfo VALUES (" + databaseUserId + ", HASHBYTES('SHA2_256','" + password + "'), '" + email + "', " + name + "," + age + ", null, null)";
                        addExtendedInfoStatement = new Request(userExtendedInfoStatement, function(err) {  
                            if (err) {
                                console.log(err);
                                socket.emit('userCreationFailed');
                            } else {
                                socket.emit('valid-username', users);
                            }
                        });
                        connection.execSql(addExtendedInfoStatement);
                    });
        	    }
            }
        });

        connection.execSql(testEmailRequest);
    });

    socket.on('login', function(username, password) {
        var userId = '';
        var loginTestStatement = "SELECT UserExtendedInfo.UserId FROM UserExtendedInfo INNER JOIN Users ON UserExtendedInfo.UserId = Users.UserId WHERE Users.Username = '" + username + "' AND UserExtendedInfo.Password = HASHBYTES('SHA2_256','" + password +  "');";

        loginRequest = new Request(loginTestStatement, function(err, rowCount, rows) {  
            if (err) {
                console.log(err);
            } else {
                if (userId != "") {
            	    socket.username = username;
            	    users.push(socket.username);
            	    console.log(users);
            	    io.emit('userConnect', socket.username);
            	    socket.emit('valid-username', users);
        	    } else {
            	    socket.emit('invalid-username');
        	    }
            }
        });
        
        loginRequest.on('row', function(columns) {
            columns.forEach(column => {
                userId = column.value;
            });
        });

        connection.execSql(loginRequest);
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