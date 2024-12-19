const Pool = require('pg').Pool
const admin = require('firebase-admin');


const pool = new Pool({
    user: 'postgres',
    host: "localhost",
    database: 'tds2',
    password: 'postgres',
    port: 5432
});

const getAllMessage = (request, response) => {
    try{
        pool.query('SELECT * FROM messages', (error, results) => {
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

    try{
        pool.query('SELECT * FROM messages INNER JOIN message_groups ON messages.id = message_groups.message_id INNER JOIN users ON users.id = messages.user_id where message_groups.group_id = $1', [groupId], (error, results) => {
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

const getMessagesByUser = (request, response) => {
    const userId = parseInt(request.params.userId);

    try{
        pool.query('SELECT * FROM messages where user_id = $1', [userId], (error, results) => {
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

const createMessage = (request, response) => {
    const { content, userId } = request.body;

    try{
        pool.query('INSERT INTO messages (content, user_id) VALUES ($1, $2)', [content, userId], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`Message added with succes`);
        });
    }
    catch(error){
        console.error(error);
    }
}

const createMessageToGroup = (request, response) => {
    const { content, userId, groupId } = request.body;

    try{
        pool.query('INSERT INTO messages (content, user_id) VALUES ($1, $2) RETURNING *', [content, userId], (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length > 0){
                pool.query('INSERT INTO message_groups (group_id, message_id) VALUES ($1, $2)', [groupId, results.rows[0].id], (error2, results2) => {
                    if (error2) {
                        throw error2;
                    }
                    sendPushMessage('Message', content, groupId, userId)
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
            pool.query('SELECT * FROM users INNER JOIN user_groups ON users.id = user_groups.user_id WHERE user_groups.group_id = $1', [groupId], (error, results) => {
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

async function sendPushMessage(title, body, groupId, userId){
    var users = await getUsersGroup(groupId);
    console.log(users);
    const tokens = [];

    if(users != null || users != undefined){
        for(const user of users){
            if((user.token != null || user.token != undefined) && !tokens.includes(user.token)){
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

module.exports = {
    getAllMessage,
    getMessagesByGroup,
    getMessagesByUser,
    createMessage,
    createMessageToGroup
}
  