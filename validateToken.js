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
console.log(req.user.user)
res.send(`${req.user.user} successfully accessed post`)
})

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