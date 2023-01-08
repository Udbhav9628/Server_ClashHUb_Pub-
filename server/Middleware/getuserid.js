const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "config.env") });

const Get_User_id = (req, res, next) => {
  const Token = req.header("authToken");
  if (!Token) {
    return res.status(401).send("You Can,t access this resource");
  }
  try {
    const data = jwt.verify(Token, process.env.JWTSCREAT);
    req.user = data; //Data is comming from payload provided while login User
    next();
  } catch (error) {
    res.status(500).send(error.message);
  }
};
module.exports = Get_User_id;
