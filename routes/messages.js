const Pool = require('pg').Pool


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



module.exports = {
    getAllMessage,
    getMessagesByGroup,
    getMessagesByUser,
    createMessage
}
  