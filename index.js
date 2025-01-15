const express = require('express');
require("dotenv").config()
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const userdb = require('./routes/users');
const groupdb = require('./routes/groups');
const messagedb = require('./routes/messages');
const contactdb = require('./routes/contacts');
const tk = require('./validateToken');
const port = process.env.TOKEN_SERVER_PORT
const admin = require('firebase-admin');
const serviceAccount = require('./tds2-cf434-firebase-adminsdk-k7hc9-4b723bda40.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tds2.firebaseio.com',
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
});

app.get('/users', userdb.getAllUsers);
app.get('/users/group/:groupId', userdb.getUsersByGroup);
app.get('/user/:userEmail', userdb.getUserByEmail);
app.post('/user', userdb.createAccount);
app.post('/login', userdb.login);
app.post('/logout', userdb.logout);
app.put('/user', userdb.changeUserData);
app.put('/user/role/:id', userdb.changeRoleUser);
app.put('/user/enable-notif/:id', userdb.enableNotifForUser);
app.put('/user/disable-notif/:id', userdb.disableNotifForUser);
app.delete('/user/:id', userdb.deleteUser);

app.get('/messages', messagedb.getAllMessage);
app.get('/message/:id', messagedb.getMessagesByUser);
app.post('/messages/group/:groupId', messagedb.getMessagesByGroup);
app.post('/messages/private', messagedb.getPrivateMessage);
app.post('/message', messagedb.createPrivateMessage);
app.post('/message/group', messagedb.createMessageToGroup);

app.get('/groups', groupdb.getAllGroups);
app.get('/groups/user/:userEmail', groupdb.getGroupsByUser);
app.post('/group/user', groupdb.addUserToGroup);
app.post('/group', groupdb.createGroup);
app.put('/group/user/role/:id', groupdb.changeGroupUserRole);
app.delete('/group/:groupId', groupdb.deleteGroup);

app.get('/contacts', contactdb.getAllContacts);
app.get('/contacts/:userId', contactdb.getContactsByUser);
app.post('/contacts', contactdb.addContactToUser);
app.delete('/contacts', contactdb.deleteContactToUser);

app.get('/file/download/:id', contactdb.addContactToUser);
app.post('/file/upload', contactdb.deleteContactToUser);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});