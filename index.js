const express = require('express');
require("dotenv").config()
const bodyParser = require('body-parser');
const app = express();
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

app.get('/users', tk.validateToken, userdb.getAllUsers);
app.get('/users/group/:groupId', tk.validateToken, userdb.getUsersByGroup);
app.get('/user/:userEmail', tk.validateToken, userdb.getUserByEmail);
app.post('/user', tk.validateToken, userdb.createAccount);
app.post('/login', tk.validateToken, userdb.login);
app.post('/logout', tk.validateToken, userdb.logout);
app.put('/user', tk.validateToken, userdb.changeUserData);
app.put('/user/role/:id', tk.validateToken, userdb.changeRoleUser);
app.put('/user/enable-notif/:id', tk.validateToken, userdb.enableNotifForUser);
app.put('/user/disable-notif/:id', tk.validateToken, userdb.disableNotifForUser);
app.delete('/user/:id', tk.validateToken, userdb.deleteUser);

app.get('/messages', tk.validateToken, messagedb.getAllMessage);
app.get('/message/:id', tk.validateToken, messagedb.getMessagesByUser);
app.post('/messages/group/:groupId', tk.validateToken, messagedb.getMessagesByGroup);
app.post('/messages/private', tk.validateToken, messagedb.getPrivateMessage);
app.post('/message', tk.validateToken, messagedb.createPrivateMessage);
app.post('/message/group', tk.validateToken, messagedb.createMessageToGroup);

app.get('/groups', tk.validateToken, groupdb.getAllGroups);
app.get('/groups/user/:userEmail', tk.validateToken, groupdb.getGroupsByUser);
app.post('/group/user', tk.validateToken, groupdb.addUserToGroup);
app.post('/group', tk.validateToken, groupdb.createGroup);
app.put('/group/user/role/:id', tk.validateToken, groupdb.changeGroupUserRole);
app.delete('/group/:groupId', tk.validateToken, groupdb.deleteGroup);

app.get('/contacts', tk.validateToken, contactdb.getAllContacts);
app.get('/contacts/:userId', tk.validateToken, contactdb.getContactsByUser);
app.post('/contacts', tk.validateToken, contactdb.addContactToUser);
app.delete('/contacts', tk.validateToken, contactdb.deleteContactToUser);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});