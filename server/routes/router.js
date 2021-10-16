const express = require("express");
const route = express.Router();
const path = require("path");
const dotenv = require("dotenv");
const Userlogin = require("../model/Userlogin");
// const Notes = require("../model/Notes");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

dotenv.config({ path: path.join(__dirname, "config.env") });
Jwt_screat = process.env.JWTSCREAT;

//Home Route
route.get("/", (req, res) => {
  res.send("Home Route");
});

//Creating user, Does not require autentication
route.post(
  "/createuser",
  [
    body("Name", "Name can only be Letters").isAlpha(),
    body("Email").isEmail(),
    body("Password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let Newuser = await Userlogin.findOne({ Email: req.body.Email });
      if (Newuser) {
        res.status(404).send("user already Existed");
        return;
      } else {
        //Creating User
        const salt = await bcrypt.genSalt(10);
        const secured_password = await bcrypt.hash(req.body.Password, salt);
        Newuser = new Userlogin({
          Name: req.body.Name,
          Email: req.body.Email,
          Password: secured_password,
        });
        Newuser.save()
          .then(() => {
            const Jwtdata = {
              id: Newuser.id,
            };
            const Auth_Token = jwt.sign(Jwtdata, Jwt_screat);
            res.json({ Auth_Token });
          })
          .catch((error) => {
            res.send({ Message: error.message });
          });
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//Login User EndPoint
route.post(
  "/Loginuser",
  [
    body("Email", "Enter a valid Email").isEmail(), // Express-validator
    body("Password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await Userlogin.findOne({ Email: req.body.Email });
      if (!user) {
        return res
          .status(500)
          .json({ Message: "Login With Correct Credientals Please" });
      } else {
        const PassWord_comp = await bcrypt.compare(
          req.body.Password,
          user.Password
        );
        if (!PassWord_comp) {
          res
            .status(500)
            .json({ Message: "Login With Correct Credientals Please" });
          return;
        } else {
          //Giving PayLoad To Jwt
          const PayLoad = {
            id: user.id,
          };
          const Auth_Token = jwt.sign(PayLoad, Jwt_screat);
          res.json({ Auth_Token });
        }
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

module.exports = route;
