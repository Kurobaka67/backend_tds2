const Pool = require('pg').Pool
const admin = require('firebase-admin');


const pool = new Pool({
    user: 'postgres',
    host: "localhost",
    database: 'tds2',
    password: 'postgres',
    port: 5432
});

const SELECT_ALL_MESSAGES = 'SELECT * FROM messages';
const SELECT_USERS_GROUP_FROM_ID = 'SELECT * FROM users INNER JOIN user_groups ON users.id = user_groups.user_id where users.id = $1 AND user_groups.group_role <= $2';
const SELECT_MESSAGES_GROUP = 'SELECT * FROM messages INNER JOIN message_groups ON messages.id = message_groups.message_id INNER JOIN users ON users.id = messages.user_id INNER JOIN user_groups ON users.id = user_groups.user_id where message_groups.group_id = $1 AND messages.sent_role >= $2';
const SELECT_MESSAGES_USER = 'SELECT * FROM messages where user_id = $1';
const SELECT_PRIVATE_MESSAGES_USER = 'SELECT * FROM messages INNER JOIN private_message ON messages.id = private_message.message_id where private_message.sender_id = $1 AND private_message.receiver_id = $2';
const INSERT_MESSAGES = 'INSERT INTO messages (content, user_id) VALUES ($1, $2) RETURNING *';
const INSERT_PRIVATE_MESSAGES = 'INSERT INTO privates_messages (message_id, receiver_id, sender_id) VALUES ($1, $2, $3)';
const INSERT_MESSAGES_GROUP = 'INSERT INTO message_groups (group_id, message_id) VALUES ($1, $2)';
const SELECT_USER_GROUP_FROM_GROUP_ID = 'SELECT * FROM users INNER JOIN user_groups ON users.id = user_groups.user_id WHERE user_groups.group_id = $1';
const newLocal = 'SELECT * FROM users WHERE id = $1';

const getAllMessage = (request, response) => {
    try{
        pool.query(SELECT_ALL_MESSAGES, (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    }
    catch(error){
        console.error(error);
    }
}

const getMessagesByGroup = (request, response) => {
    const groupId = parseInt(request.params.groupId);
    const { userId, groupRole } = request.body;

    try{
        pool.query(SELECT_USERS_GROUP_FROM_ID, [userId, groupRole], (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length > 0){
                pool.query(SELECT_MESSAGES_GROUP, [groupId, results.rows[0].group_role], (error2, results2) => {
                    if (error2) {
                        throw error2;
                    }
                    response.status(200).json(results2.rows);
                });
            }
            else{
                response.status(401).send(`Couldn't get messages`);
            }
        });
    }
    catch(error){
        console.error(error);
    }
}

const getMessagesByUser = (request, response) => {
    const userId = parseInt(request.params.userId);

    try{
        pool.query(SELECT_MESSAGES_USER, [userId], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    }
    catch(error){
        console.error(error);
    }
}

const getPrivateMessage = (request, response) => {
    const { receiverId, senderId } = request.body;

    try{
        pool.query(SELECT_PRIVATE_MESSAGES_USER, [senderId, receiverId], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    }
    catch(error){
        console.error(error);
    }
}

const createPrivateMessage = (request, response) => {
    const { content, receiverId, senderId } = request.body;

    try{
        pool.query(INSERT_MESSAGES, [content, userId], (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length > 0){
                pool.query(INSERT_PRIVATE_MESSAGES, [results.rows[0].id, receiverId, senderId], (error2, results2) => {
                    if (error2) {
                        throw error2;
                    }
                    sendPushPrivateMessage('Message', content, receiverId, senderId)
                    response.status(200).send(`Message added with succes`);
                });
            }
            else{
                response.status(401).send(`Couldn\'t create message`);
            }
        });
    }
    catch(error){
        console.error(error);
    }
}

const createMessageToGroup = (request, response) => {
    const { content, userId, groupId } = request.body;

    try{
        pool.query(INSERT_MESSAGES, [content, userId], (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length > 0){
                pool.query(INSERT_MESSAGES_GROUP, [groupId, results.rows[0].id], (error2, results2) => {
                    if (error2) {
                        throw error2;
                    }
                    sendPushGroupMessage('Message', content, groupId, userId)
                    response.status(200).send(`Message added with succes`);
                });
            }
            else{
                response.status(401).send(`Couldn\'t create message`);
            }
        });
    }
    catch(error){
        console.error(error);
    }
}

async function getUsersGroup(groupId){
    try{
        return await new Promise(function(resolve,reject){
            pool.query(SELECT_USER_GROUP_FROM_GROUP_ID, [groupId], (error, results) => {
                if (error) {
                    reject(error);
                }
                if(results.rows.length > 0){
                    resolve(results.rows);
                }
                else{
                    resolve();
                }
            });
        });
    }
    catch(error){
        console.error(error);
    } 
}

async function getUsersById(userId){
    try{
        return await new Promise(function(resolve,reject){
            pool.query(newLocal, [userId], (error, results) => {
                if (error) {
                    reject(error);
                }
                if(results.rows.length > 0){
                    resolve(results.rows);
                }
                else{
                    resolve();
                }
            });
        });
    }
    catch(error){
        console.error(error);
    } 
}

async function sendPushGroupMessage(title, body, groupId, userId){
    let users = await getUsersGroup(groupId);
    console.log(users);
    const tokens = [];

    if(users != null || users != undefined){
        for(const user of users){
            if((user.token != null || user.token != undefined) && !tokens.includes(user.token) && user.is_notified){
                tokens.push(user.token);
            }
        }
    }
    
    const message = {
        notification: {
            title,
            body,
        },
        data: {
            "userId": userId
        },
        tokens,
    };

    console.log(message);
  
    if(tokens.length > 0){
        await admin.messaging().sendEachForMulticast(message);
    }
}

async function sendPushPrivateMessage(title, body, receiverId, senderId){
    let user = await getUsersById(receiverId);
    let token = user.token;

    const message = {
        notification: {
            title,
            body,
        },
        data: {
            "userId": senderId
        },
        token,
    };
  
    if(user.is_notified && token != null){
        await admin.messaging().send(message);
    }
}

module.exports = {
    getAllMessage,
    getMessagesByGroup,
    getMessagesByUser,
    createPrivateMessage,
    createMessageToGroup,
    getPrivateMessage
}
  