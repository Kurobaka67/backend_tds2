require("dotenv").config()
const express = require("express")
const app = express()
app.use (express.json())
const jwt = require("jsonwebtoken")
const port = process.env.PORT

app.listen(port,()=> {
    console.log(`Validation server running on ${port}...`)
})

app.get("/posts", validateToken, (req, res)=>{
    console.log("Token is valid")
    console.log(req.user.firstname)
    res.send(`${req.user.firstname} successfully accessed post`)
})

app.get('/users', validateRequest('admin'), (req, res) => {
    res.send(JSON.stringify({ users }))
});
   
  
app.get('/users/:userId', validateRequest('admin'), (req, res) => {
    const { params } = req;
    const { userId } = params;

    console.log({ userId });
    const user = users.find((user) => user.id === userId);

    if (!user) {
        res.sendStatus(404)
        return;
    }
    res.send({ user })
});

function validateToken(req, res, next) {

    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]

    if (token == null) res.sendStatus(400).send("Token not present")
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) { 
     res.status(403).send("Token invalid")
     }
     else {
     req.user = user
     next()
     }
    }) 
} 

const validateRequest = (requiredRole) => {
    return (req, res, next) => {
        const { authorization } = req.headers
        const token = authorization.substring('Bearer '.length);
        try {
            const { exp, iss, role } = jwt.verify(token, tokenSecret);

            if (iss === 'my-api' && exp < Date.now() && role === requiredRole) {
                next();
                return;
            }
        } catch (err) {
            res.sendStatus(403);
            return;
        }
    }
}

module.exports = {
    validateToken
}
  