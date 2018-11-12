var socket = io();
var username;
var lastUserMsg = "";
var onlineUserList = [];
var offlineUserList = [];
var currentUserList = [];

function login() {
    username = document.getElementById('username').value;
    password = document.getElementById('password').value;
    socket.emit('login', username, password);
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
    document.getElementById('onlineUsers').style.display = 'flex';
    document.getElementById('userFormMessage').style.display = 'none';
    document.getElementsByTagName('header')[0].innerHTML = "Welcome, <b>" + username + "</b>!";
    document.getElementsByTagName('footer')[0].innerHTML = "<form id='messageForm' onsubmit='sendMessage(); return false'><input type='text' class='form-control' id='message' placeholder='Enter message...' autocomplete='off'><button type='submit' class='btn btn-primary btn-success'><i class='fas fa-envelope'></i> Send</button></form>";
    onlineUserList = currentUsers;
    updateUsers();
});

socket.on('invalid-username', function() {
    document.getElementById('userFormMessage').innerHTML = "Please ensure you have entered the correct details.";
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
    if (offlineUserList.includes(userId)) {
        offlineUserList.splice(offlineUserList.indexOf(userId), 1);
    }
    updateUsers();
    lastUserMsg = userId;
});

socket.on('userDisconnect', function(userId) {
    var chat = document.getElementById('chatMessages');
    chat.innerHTML += "<b>" + userId + "</b> has disconnected.<br>";
    onlineUserList.splice(onlineUserList.indexOf(userId), 1);
    offlineUserList.push(userId);
    updateUsers();
    lastUserMsg = userId;
});

function updateUsers() {
    var userList = document.getElementById('onlineUsers');
    userList.innerHTML = "<span id='usersTitle'>Users (" + onlineUserList.length + "): </span>"

    for (var i = 0, len = onlineUserList.length; i < len; i++) {
        userList.innerHTML += userTemplate(onlineUserList[i], "online");
    }

    for (var i = 0, len = offlineUserList.length; i < len; i++) {
        userList.innerHTML += userTemplate(offlineUserList[i], "offline");
    }
}

function userTemplate(userId, status) {
    if (status == "online") {
        return "<span id='user'><i class='fas fa-circle'></i> " + userId + "</span>"
    } else {
        return "<span id='user'><i class='fas fa-circle' id='offline'></i> " + userId + "</span>"    
    }
}