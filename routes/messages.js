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
        pool.query('SELECT * FROM messages INNER JOIN message_groups ON messages.id = message_groups.message_id where message_groups.group_id = $1', [groupId], (error, results) => {
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

const addMessageToGroup = (request, response) => {
    const { messageId, groupId } = request.body;

    try{
        pool.query('INSERT INTO message_group (group_id, message_id) VALUES ($1, $2)', [groupId, messageId], (error2, results) => {
            if (error2) {
                throw error2;
            }
            if(results.rows.length > 0){
                pool.query('SELECT * FROM users INNER JOIN user_groups ON users.id = user_groups.user_id WHERE user_groups.group_id = $1', [groupId], (error2, results2) => {
                    if (error2) {
                        throw error2;
                    }
                    sendPushMessage("Titre", "Test", results2.rows);
                    response.status(200).send(`Message added with succes`);
                });
            }
            else{
                response.status(401).send('Not authorized');
            }
            sendPushMessage("Titre", "Test", results2.rows);
            response.status(200).send(`Message added with succes`);
        });
    }
    catch(error){
        console.error(error);
    }

        
}

async function sendPushMessage(title, body, users){
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
        tokens,
    };
    console.log(tokens);
    console.log(message);
  
    if(tokens.length > 0){
        //await admin.messaging().sendEachForMulticast(message);
    }
}

module.exports = {
    getAllMessage,
    getMessagesByGroup,
    getMessagesByUser,
    createMessage
}
  