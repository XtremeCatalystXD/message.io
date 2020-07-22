//Contains all functions interacting with the database for authentication purposes
// -
// -
var Request = require('tedious').Request;
var Connection = require('tedious').Connection;

var config = {
    userName: process.env.DB_SERVER_USRNME,  
    password: process.env.DB_SERVER_PSWD,  
    server: process.env.DB_SERVER_IP,
    options:{
        database: process.env.DB_SERVER_NAME
    }
};
var connection = new Connection(config);

//Function intitial socket connection
let initialConnection = () => {
    connection.on('connect', (err) => {console.log(err);});
}

//Function for registering a new user to the application
let userRegistration = (username, password, email, name, age) => {
    var registrationQuery = `SELECT * FROM UserExtendedInfo WHERE Email = '${email}'; IF @@ROWCOUNT = 0 BEGIN INSERT INTO Users VALUES ('${username}', 0, 'www.avatarurl.com');
    INSERT INTO UserExtendedInfo VALUES ((SELECT UserId FROM Users WHERE Username = '${username}'), '${email}', '${name}', ${age}, '3', '1', HASHBYTES('SHA2_256', '${password}')) END;`
    
    var registrationQueryRequest = new Request(registrationQuery, (err, rowCount) => {
        if(err) {
            //I tihnk nothing is inserted, if something fails everything fails.
            console.log(err);
            console.log('Something in the script failed');
        } else {
            //If query succeeds, check for existence (return canont create) and check for non existant (user can created).
            if(rowCount === 1) {
                console.log('User with the same email already exists. Rowcount ' + rowCount);
            } else if(rowCount > 1) {
                console.log('New user has been added');
            }
        }
    });
    connection.execSql(registrationQueryRequest);
}

//Function for logging in a user, authenticating against their credentials
let userLogin = (username, password) => {
    var validation = false;
    var userId = "";
    var loginQuery = `SELECT UserExtendedInfo.UserId from UserExtendedInfo INNER JOIN Users ON UserExtendedInfo.UserId = Users.UserId 
    WHERE Users.Username = '${username}' AND UserExtendedInfo.Password = HASHBYTES('SHA2_256', '${password}');`;

    var loginQueryRequest = new Request(loginQuery, (err) => {
        if(err) {
            console.log(err);
        } else {
            if(userId != "") {
                console.log('Reached');
                validation = true;
            }
        }
    });

    loginQueryRequest.on('row', (columns) => {
        columns.forEach(id => {
            userId = id.value;
        });
    });
    connection.execSql(loginQueryRequest);

    console.log(validation);
    return validation;
}

//List of functions to export for future use
module.exports = { initialConnection, userLogin, userRegistration};