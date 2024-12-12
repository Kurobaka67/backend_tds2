const Pool = require('pg').Pool
const crypto = require('crypto');


const pool = new Pool({
    user: 'postgres',
    host: "localhost",
    database: 'tds2',
    password: 'postgres',
    port: 5432
});

const login = (request, response) => {
    const { email, password } = request.body;
    const hash = crypto.createHash('sha256');
    hash.update(password);
    const digest = hash.digest('hex');

    try{
        pool.query('SELECT * FROM users where email = $1 and password = $2', [email, digest], (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length > 0){
                pool.query('UPDATE users SET status = $1 WHERE email = $2', ['connected', email], (error2, results2) => {
                    if (error2) {
                        throw error2;
                    }
                    response.status(200).json(results.rows);
                });
            }
            else{
                response.status(401).send('No user found');
            }
        });
    }
    catch(error){
        console.error(error);
    }
}

const logout = (request, response) => {
    const { email } = request.body;

    try{
        pool.query('UPDATE users SET status = $1 WHERE email = $2', ['disconnected', email], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send("User logged out");
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
        pool.query('SELECT * FROM users INNER JOIN user_groups ON users.id = user_groups.user_id where user_groups.group_id = $1', [groupId], (error, results) => {
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

const getUserByEmail = (request, response) => {
    const userEmail = request.params.userEmail;

    try{
        pool.query('SELECT * FROM users where email = $1', [userEmail], (error, results) => {
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

const createAccount = (request, response) => {
    const { firstname, lastname, email, password } = request.body;
    const hash = crypto.createHash('sha256');
    hash.update(password);
    const digest = hash.digest('hex');

    try{
        pool.query('INSERT INTO users (firstname, lastname, email, role, password, status) VALUES ($1, $2, $3, $4, $5, $6)', [firstname, lastname, email, 'client', digest, 'disconnected'], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`User added with succes`);
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
            response.status(200).send(`User ID : ${id} role changed with succes`);
        });
    }
    catch(error){
        console.error(error);
    }
}

const changeUserData = (request, response) => {
    const { email, firstname, lastname, picture } = request.body;

    try{
        pool.query('UPDATE users SET firstname = $2, lastname = $3, picture = $4 where email = $1', [email, firstname, lastname, picture], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`User data changed with succes`);
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
            response.status(200).send(`User ID : ${id} deleted with succes`);
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
    getUserByEmail,
    createAccount,
    changeUserData,
    changeRoleUser,
    deleteUser
}
  