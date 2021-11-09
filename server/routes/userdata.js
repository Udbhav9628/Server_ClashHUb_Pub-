const express = require("express");
const route = express.Router();
const userschema = require("../model/userdata");
const { body, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");

//Create User
route.post(
  "/Register",
  [
    body("Email").isEmail(),
    body("Password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let Newuser = await userschema.findOne({ Email: req.body.Email });
      if (Newuser) {
        res.status(500).send({ Message: "user already Existed" });
        return;
      }
      const new_tournament = new userschema({
        Email: req.body.Email,
        Password: req.body.Password,
      });
      new_tournament.save().then((data) => {
        res.send(data);
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

route.post(
  "/Login",
  [
    body("Email").isEmail(),
    body("Password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await userschema.findOne({ Email: req.body.Email });
      if (!user) {
        return res
          .status(500)
          .json({ Message: "Login With Correct Credientals Please" });
      }else if(user.Password===req.body.Password){
        const PayLoad = { //this is the data will recevive when verify jwt token provided in header - user id
          id: user.id,
        };
        const Auth_Token = jwt.sign(PayLoad, process.env.JWTSCREAT);
        res.json({ Auth_Token });
      }else{
        return res
          .status(500)
          .json({sucess, Message: "Login With Correct Credientals Please" });
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

module.exports = route;
