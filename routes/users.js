const Pool = require('pg').Pool
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

const pool = new Pool({
    user: 'postgres',
    host: "localhost",
    database: 'tds2',
    password: 'postgres',
    port: 5432
});

const workFactor = 10;
let refreshTokens = []

const SELECT_USER_BY_EMAIL = 'SELECT * FROM users where email = $1';
const UPDATE_USER_WHEN_LOGIN_LOGOUT = 'UPDATE users SET status = $1, token = $2 WHERE email = $3';
const SELECT_ALL_USERS = 'SELECT * FROM users';
const SELECT_USER_BY_GROUP = 'SELECT * FROM users INNER JOIN user_groups ON users.id = user_groups.user_id where user_groups.group_id = $1';
const INSERT_NEW_USER = 'INSERT INTO users (firstname, lastname, email, role, password, status) VALUES ($1, $2, $3, $4, $5, $6)';
const UPDATE_USER_ROLE = 'UPDATE users SET role = $1 where id = $2';
const UPDATE_USER_DATA = 'UPDATE users SET firstname = $2, lastname = $3, picture = $4 where email = $1';
const UPDATE_NOTIF_USER = 'UPDATE users SET is_notified = $1 where id = $2';
const DELETE_USER = 'DELETE FROM users where id = $1';

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
}

    
function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"});
    refreshTokens.push(refreshToken);
    return refreshToken;
}

const login = (request, response) => {
    const { email, password, token } = request.body;

    try{
        pool.query(SELECT_USER_BY_EMAIL, [email], (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length > 0){
                bcrypt.compare(password, results.rows[0].password, function(err, result) {
                    // Password matched
                    if (result) {
                        //const accessToken = generateAccessToken ({user: email})
                        //const refreshToken = generateRefreshToken ({user: email})
                        //console.log("Password verified");
                        pool.query(UPDATE_USER_WHEN_LOGIN_LOGOUT, ['connected', token, email], (error2, results2) => {
                            if (error2) {
                                throw error2;
                            }
                            response.status(200).json(results.rows);
                    });
                    }
                    // Password not matched
                    else {
                    console.log("Password not verified");
                    response.status(401).send('Password not verified');
                    }
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
    const { email, token } = request.body;

    try{
        pool.query(UPDATE_USER_WHEN_LOGIN_LOGOUT, ['disconnected', null, email], (error, results) => {
            if (error) {
                throw error;
            }
            //refreshTokens = refreshTokens.filter( (c) => c != token)
            response.status(204).send("User logged out");
        });
    }
    catch(error){
        console.error(error);
    }
}

const refreshUserToken = (request, response) => {
    const { token, email } = request.body;
    
    if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid");

    refreshTokens = refreshTokens.filter( (c) => c != token)
    //remove the old refreshToken from the refreshTokens list
    const accessToken = generateAccessToken ({user: email})
    const refreshToken = generateRefreshToken ({user: email})
    //generate new accessToken and refreshTokens
    res.json ({accessToken: accessToken, refreshToken: refreshToken})
}

const getAllUsers = (request, response) => {
    try{
        pool.query(SELECT_ALL_USERS, (error, results) => {
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
    console.log(groupId);

    try{
        pool.query(SELECT_USER_BY_GROUP, [groupId], (error, results) => {
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
        pool.query(SELECT_USER_BY_EMAIL, [userEmail], (error, results) => {
            if (error) {
                throw error;
            }
            console.log(response);
            response.status(200).json(results.rows);
        });
    }
    catch(error){
        console.error(error);
    }
}

const createAccount = (request, response) => {
    const { firstname, lastname, email, password } = request.body;
    var hash;
    bcrypt.hash(password, 10, function(err, hash) {
        hash = hash;
        console.log(`Hash: ${hash}`);
    });

    /*const hash = crypto.createHash('sha256');
    hash.update(password);
    const digest = hash.digest('hex');*/

    try{
        pool.query(INSERT_NEW_USER, [firstname, lastname, email, 'client', hash, 'disconnected'], (error, results) => {
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
        pool.query(UPDATE_USER_ROLE, [role, id], (error, results) => {
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
        pool.query(UPDATE_USER_DATA, [email, firstname, lastname, picture], (error, results) => {
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
    const { token } = request.body;

    try{
        pool.query(DELETE_USER, [id], (error, results) => {
            if (error) {
                throw error;
            }
            refreshTokens = refreshTokens.filter( (c) => c != req.body.token)
            response.status(204).send(`User ID : ${id} deleted with succes`);
        });
    }
    catch(error){
        console.error(error);
    }
}

const enableNotifForUser = (request, response) => {
    const id = parseInt(request.params.id);

    try{
        pool.query(UPDATE_NOTIF_USER, [true, id], (error, results) => {
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

const disableNotifForUser = (request, response) => {
    const id = parseInt(request.params.id);

    try{
        pool.query(UPDATE_NOTIF_USER, [false, id], (error, results) => {
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
    enableNotifForUser,
    disableNotifForUser,
    deleteUser
}
  