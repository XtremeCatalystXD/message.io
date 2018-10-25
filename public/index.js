var socket = io();
var username;
var lastUserMsg = "";
var onlineUserList = [];
var currentUserList = [];
//document.getElementById('chat').style.display = 'none';

function setUsername() {
    username = document.getElementById('username').value;
    socket.emit('send-username', username);
}

function sendMessage() {
    var message = document.getElementById('message');

    if (message.value != ""){
        socket.emit('send-message', message.value);
        message.value = "";
    }
}

socket.on('valid-username', function(currentUsers) {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('content').style.display = 'flex';
    document.getElementById('userFormMessage').style.display = 'none';
    document.getElementsByTagName('header')[0].innerHTML = "Welcome, <b>" + username + "</b>!";
    document.getElementsByTagName('footer')[0].innerHTML = "<form id='messageForm' onsubmit='sendMessage(); return false'><input type='text' class='form-control' id='message' placeholder='Enter message...'><button type='submit' class='btn btn-primary btn-success'><i class='fas fa-envelope'></i> Send</button></form>";
    onlineUserList = currentUsers;
});

socket.on('invalid-username', function(data) {
    document.getElementById('userFormMessage').innerHTML = data + " is already in use. Try another username.";
});

socket.on('newMessage', function(msg, userId) {
    var chat = document.getElementById('chatMessages');
    
    if ((lastUserMsg != userId)||(lastUserMsg=="")) {
        chat.innerHTML += "<b>" + userId + ":</b><br><span id='msg'>" + msg + "</span><br>";
    } else {
        chat.innerHTML += "<span id='msg'>" + msg + "</span><br>";
    }
    lastUserMsg = userId;
});

socket.on('userConnect', function(userId) {
    var chat = document.getElementById('chatMessages');
    chat.innerHTML += "<b>" + userId + "</b> has connected.<br>";
    onlineUserList.push(userId);
    updateUsers();
    lastUserMsg = userId;
});

socket.on('userDisconnect', function(userId) {
    var chat = document.getElementById('chatMessages');
    chat.innerHTML += "<b>" + userId + "</b> has disconnected.<br>";
    onlineUserList.splice(onlineUserList.indexOf(userId), 1);
    updateUsers();
    lastUserMsg = userId;
});

function updateUsers() {
    var userList = document.getElementById('onlineUsers');

    for (var i = 0, len = onlineUserList.length; i < len; i++) {
        if (!currentUserList.includes(onlineUserList[i])) {
            userList.innerHTML += onlineUserList[i];
            currentUserList += onlineUserList[i];
        }
    }
}