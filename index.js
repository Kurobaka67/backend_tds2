const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const userdb = require('./routes/users');
const groupdb = require('./routes/groups');
const messagedb = require('./routes/messages');
const port = 3000;


app.use(bodyParser.json());
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
app.get('/user/:id', userdb.getUserById);
app.post('/user', userdb.createAccount);
app.post('/login', userdb.login);
app.post('/logout', userdb.logout);
app.put('/user/role/:id', userdb.changeRoleUser);
app.delete('/user/:id', userdb.deleteUser);

app.get('/messages', messagedb.getAllMessage);
app.get('/messages/group/:groupId', messagedb.getMessagesByGroup);
app.get('/message/:id', messagedb.getMessagesByUser);
app.post('/message', messagedb.createMessage);

app.get('/groups', groupdb.getAllGroups);
app.get('/groups/user/:userEmail', groupdb.getGroupsByUser);
app.post('/group', groupdb.createGroup);
app.delete('/group/:groupId', groupdb.deleteGroup);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});