var socket = io();
var username;
document.getElementById('chat').style.display = 'none';

function setUsername() {
    username = document.getElementById('username').value;
    socket.emit('send-username', username);
}

function sendMessage() {
    var message = document.getElementById('message').value;
    socket.emit('send-message', message);
}

socket.on('valid-username', function() {
    document.getElementById('userForm').style.display = 'none';
    document.getElementById('chat').style.display = '';
    document.getElementById('header').innerHTML = "Welcome, " + username + "!";
});

socket.on('invalid-username', function(data) {
    document.getElementById('userFormMessage').innerHTML = data + " is already in use. Try another username.";
});

socket.on('newMessage', function(msg, userId) {
    var chat = document.getElementById('chatMessages');
    chat.innerHTML += userId + ": " + msg + "<br>";
    chat.scrollTop = chat.scrollHeight;
});