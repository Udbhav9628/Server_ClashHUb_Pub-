const express = require("express");
const route = express.Router();
const userschema = require("../model/userdata");
const { body, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
const Get_User_id = require("../Middleware/getuserid");

//Create User
route.post(
  "/Register",
  [
    body("Name").isLength({ min: 3 }),
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
        res.status(500).send("user already Existed");
        return;
      }
      const new_user = new userschema({
        Name: req.body.Name,
        Email: req.body.Email,
        Password: req.body.Password,
      });
      new_user.save().then((data) => {
        res.send(data);
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

route.post(
  "/Login",
  [body("Email").isEmail(), body("Password").isLength({ min: 5 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await userschema.findOne({ Email: req.body.Email });
      if (!user) {
        return res.status(200).send("Login With Correct Credientals Please");
      } else if (user.Password === req.body.Password) {
        const PayLoad = {
          //this is the data will recevive when verify jwt token provided in header - user id
          //TO Do --Save in Hashed with salt and then reverse engineer it when need to use
          id: user.id, //Logged User id is saved in authtoken
          Name: user.Name, //Logged User Name is saved in authtoken   TO --Save in Hashed with salt
        };
        const Auth_Token = jwt.sign(PayLoad, process.env.JWTSCREAT);
        res.json({
          User: user.Name,
          Joined_Date: user.Date,
          Wallet: user.Wallet_Coins,
          Auth_Token,
        });
      } else {
        return res
          .status(500)
          .json({ Message: "Login With Correct Credientals Please" });
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//Geting Logged in User Details
route.get("/getUserDetails", Get_User_id, async (req, res) => {
  try {
    let user = await userschema.findById(req.user.id);
    if (!user) {
      return res.status(500).send("User Not Exist May be");
    } else {
      return res.status(200).send(user);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = route;
