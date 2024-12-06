const Pool = require('pg').Pool


const pool = new Pool({
    user: 'postgres',
    host: "localhost",
    database: 'tds2',
    password: 'postgres',
    port: 5432
});

const getAllGroups = (request, response) => {
    try{
        pool.query('SELECT * FROM groups', (error, results) => {
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

const getGroupsByUser = (request, response) => {
    const userId = parseInt(request.params.userId);

    try{
        pool.query('SELECT * FROM groups INNER JOIN userGroups ON groups.id = userGroups.groupId where userGroups.userId = $1', [userId], (error, results) => {
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

const createGroup = (request, response) => {
    const { name, lastname, email } = request.body;

    try{
        pool.query('SELECT * FROM groups INNER JOIN userGroups ON groups.id = userGroups.groupId where userGroups.userId = $1', [userId], (error, results) => {
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

const deleteGroup = (request, response) => {
    const groupId = parseInt(request.params.groupId);

    try{
        pool.query('DELETE FROM groups where id = $1', [groupId], (error, results) => {
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
    getAllGroups,
    getGroupsByUser,
    createGroup
}
  