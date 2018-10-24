var socket = io();
var username;
//document.getElementById('chat').style.display = 'none';

function setUsername() {
    username = document.getElementById('username').value;
    socket.emit('send-username', username);
}

function sendMessage() {
    var message = document.getElementById('message').value;
    socket.emit('send-message', message);
    document.getElementById('message').value = "";
}

socket.on('valid-username', function() {
    document.getElementById('userForm').style.display = 'none';
    //document.getElementById('chat').style.display = '';
    document.getElementById('userFormMessage').style.display = 'none';
    document.getElementsByTagName('header')[0].innerHTML = "Welcome, <b>" + username + "</b>!";
    document.getElementsByTagName('footer')[0].innerHTML = "<form id='messageForm' onsubmit='sendMessage(); return false'><label for='message'>Enter a message: </label><input type='text' id='message'><input type='submit' value='Send'></form>";
});

socket.on('invalid-username', function(data) {
    document.getElementById('userFormMessage').innerHTML = data + " is already in use. Try another username.";
});

socket.on('newMessage', function(msg, userId) {
    var chat = document.getElementById('chatMessages');
    chat.innerHTML += "<b>" + userId + ":</b> " + msg + "<br>";
    chat.scrollTop = chat.scrollHeight;
});