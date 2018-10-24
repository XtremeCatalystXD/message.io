var socket = io();
var username;
var lastUserMsg = "";
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

socket.on('valid-username', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('content').style.display = 'flex';
    //document.getElementById('chat').style.display = '';
    document.getElementById('userFormMessage').style.display = 'none';
    document.getElementsByTagName('header')[0].innerHTML = "Welcome, <b>" + username + "</b>!";
    document.getElementsByTagName('footer')[0].innerHTML = "<form id='messageForm' onsubmit='sendMessage(); return false'><input type='text' class='form-control' id='message' placeholder='Enter message...'><button type='submit' class='btn btn-primary btn-success'><i class='fas fa-envelope'></i> Send</button></form>";
});

socket.on('invalid-username', function(data) {
    document.getElementById('userFormMessage').innerHTML = data + " is already in use. Try another username.";
});

socket.on('newMessage', function(msg, userId) {
    var chat = document.getElementById('chatMessages');
    
    if ((lastUserMsg != userId)||(lastUserMsg=="")) {
        chat.innerHTML += "<b>" + userId + ":</b><br><span id='msg'>" + msg + "</span><br>";
        //chat.scrollTop = chat.scrollHeight;
    } else {
        chat.innerHTML += "<span id='msg'>" + msg + "</span><br>";
    }
    lastUserMsg = userId;
});

socket.on('userConnect', function(userId) {
    var chat = document.getElementById('chatMessages');
    chat.innerHTML += "<b>" + userId + "</b> has connected.<br>";
    chat.scrollTop = chat.scrollHeight;
    lastUserMsg = userId;
});

socket.on('userDisconnect', function(userId) {
    var chat = document.getElementById('chatMessages');
    chat.innerHTML += "<b>" + userId + "</b> has disconnected.<br>";
    chat.scrollTop = chat.scrollHeight;
    lastUserMsg = userId;
});