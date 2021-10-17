var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "config.env") });

const fetchuser = (req, res, next)=>{
    //Get user details from jwt
    const Token = req.header("authToken") //authToken is name of header
    if (!Token) {
        res.status(401).send("Plz Provide token in header named authToken")
    }
    //try for may be we have token but in case it is not valid catch will show error
    try {
        const data = jwt.verify(Token, process.env.JWTSCREAT)
        req.user = data  //Data is comming from payload provided while login in User.js , 2nd Route
        next(); 
    } catch (error) {
        res.status(500).send(error.message)
    }
}

module.exports = fetchuser;