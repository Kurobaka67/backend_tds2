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
    const userEmail = request.params.userEmail;

    try{
        pool.query('SELECT * FROM groups INNER JOIN user_groups ON groups.id = user_groups.group_id INNER JOIN users ON user_groups.user_id = users.id where users.email = $1', [userEmail], (error, results) => {
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

const changeGroupUserRole = (request, response) => {
    const id = parseInt(request.params.id);
    const { role } = request.body;

    try{
        pool.query('UPDATE user_groups SET group_role = $1 where user_id = $2', [role, id], (error, results) => {
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
    const { name } = request.body;

    try{
        pool.query('INSERT INTO groups (name) VALUES ($1)', [name], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`Group added with succes`);
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
            response.status(200).send(`Group ID : ${id} deleted with succes`);
        });
    }
    catch(error){
        console.error(error);
    }
}

module.exports = {
    getAllGroups,
    getGroupsByUser,
    changeGroupUserRole,
    createGroup,
    deleteGroup
}
  