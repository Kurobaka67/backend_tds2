const Pool = require('pg').Pool


const pool = new Pool({
    user: 'postgres',
    host: "localhost",
    database: 'tds2',
    password: 'postgres',
    port: 5432
});

const login = (request, response) => {
    const { firstname, lastname, email } = request.body;

    try{
        pool.query('SELECT * FROM users where hash = $1', [request.headers['x-api-key']], (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length > 0){
                pool.query('SELECT * FROM requests WHERE archive = false', (error2, results2) => {
                    if (error2) {
                        throw error2;
                    }
                    response.status(200).json(results2.rows);
                });
            }
            else{
                response.status(401).send('Not authorized');
            }
        });
    }
    catch(error){
        console.error(error);
    }
}

const logout = (request, response) => {
    const { firstname, lastname, email } = request.body;

    try{
        pool.query('SELECT * FROM users where hash = $1', [request.headers['x-api-key']], (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length > 0){
                pool.query('SELECT * FROM requests WHERE archive = false', (error2, results2) => {
                    if (error2) {
                        throw error2;
                    }
                    response.status(200).json(results2.rows);
                });
            }
            else{
                response.status(401).send('Not authorized');
            }
        });
    }
    catch(error){
        console.error(error);
    }
}

const getAllUsers = (request, response) => {
    try{
        pool.query('SELECT * FROM users', (error, results) => {
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

const getUsersByGroup = (request, response) => {
    const groupId = parseInt(request.params.groupId);

    try{
        pool.query('SELECT * FROM users INNER JOIN userGroups ON groups.id = userGroups.groupId where userGroups.groupId = $1', [groupId], (error, results) => {
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

const getUserById = (request, response) => {
    const id = parseInt(request.params.id);

    try{
        pool.query('SELECT * FROM users where id = $1', [id], (error, results) => {
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

const createUser = (request, response) => {
    const { firstname, lastname, email } = request.body;

    try{
        pool.query('INSERT INTO users (firstname, lastname, email) VALUES ($1, $2, $3)', [firstname, lastname, email], (error, results) => {
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

const changeRoleUser = (request, response) => {
    const id = parseInt(request.params.id);
    const { role } = request.body;

    try{
        pool.query('UPDATE users SET role = $1 where id = $2', [role, id], (error, results) => {
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

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id);

    try{
        pool.query('DELETE FROM users where id = $1', [id], (error, results) => {
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
    login,
    logout,
    getAllUsers,
    getUsersByGroup,
    getUserById,
    createUser,
    changeRoleUser,
    deleteUser
}
  