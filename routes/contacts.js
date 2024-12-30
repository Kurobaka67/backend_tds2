const Pool = require('pg').Pool


const pool = new Pool({
    user: 'postgres',
    host: "localhost",
    database: 'tds2',
    password: 'postgres',
    port: 5432
});

const SELECT_CONTACTS = 'SELECT * FROM contacts';
const SELECT_CONTACTS_FROM_USER_ID = 'SELECT * FROM contacts where sender_id = $1';
const INSERT_NEW_CONTACT_FOR_USER = 'INSERT INTO contacts (sender_id, receiver_id) VALUES ($1, $2)';
const DELETE_CONTACT_TO_USER = 'DELETE FROM contacts where sender_id = $1';

const getAllContacts = (request, response) => {
    try{
        pool.query(SELECT_CONTACTS, (error, results) => {
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

const getContactsByUser = (request, response) => {
    const userId = request.params.userId;

    try{
        pool.query(SELECT_CONTACTS_FROM_USER_ID, [userId], (error, results) => {
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

const addContactToUser = (request, response) => {
    const { senderId, receiverId } = request.body;

    try{
        pool.query(INSERT_NEW_CONTACT_FOR_USER, [senderId, receiverId], (error, results) => {
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

const deleteContactToUser = (request, response) => {
    const { senderId } = request.body;

    try{
        pool.query(DELETE_CONTACT_TO_USER, [senderId], (error, results) => {
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

module.exports = {
    getAllContacts,
    getContactsByUser,
    addContactToUser,
    deleteContactToUser
}