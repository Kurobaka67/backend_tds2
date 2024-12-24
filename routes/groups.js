const Pool = require('pg').Pool


const pool = new Pool({
    user: 'postgres',
    host: "localhost",
    database: 'tds2',
    password: 'postgres',
    port: 5432
});

const SELECT_GROUPS = 'SELECT * FROM groups';
const SELECT_GROUPS_FROM_USER_EMAIL = 'SELECT * FROM groups INNER JOIN user_groups ON groups.id = user_groups.group_id INNER JOIN users ON user_groups.user_id = users.id where users.email = $1';
const UPDATE_USER_GROUPS_ROLE = 'UPDATE user_groups SET group_role = $1 where user_id = $2 AND group_id = $3';
const INSERT_USER_TO_GROUP = 'UPDATE user_groups SET group_role = $1 where user_id = $2';
const INSERT_NEW_GROUP = 'INSERT INTO groups (name) VALUES ($1)';
const DELETE_GROUP = 'DELETE FROM groups where id = $1';

const getAllGroups = (request, response) => {
    try{
        pool.query(SELECT_GROUPS, (error, results) => {
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
        pool.query(SELECT_GROUPS_FROM_USER_EMAIL, [userEmail], (error, results) => {
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
    const { role, groupId } = request.body;

    try{
        pool.query(UPDATE_USER_GROUPS_ROLE, [role, id, groupId], (error, results) => {
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

const addUserToGroup = (request, response) => {
    const { groupId, userId, groupRole } = request.body;
    if(groupRole == null){
        groupRole = 3
    }

    try{
        pool.query(INSERT_USER_TO_GROUP, [role, id], (error, results) => {
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
        pool.query(INSERT_NEW_GROUP, [name], (error, results) => {
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
        pool.query(DELETE_GROUP, [groupId], (error, results) => {
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
    addUserToGroup,
    createGroup,
    deleteGroup
}
  