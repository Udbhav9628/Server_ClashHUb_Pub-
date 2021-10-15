const express = require("express");
const route = express.Router();
const path = require("path");
const dotenv = require("dotenv");
const Userlogin = require("../model/Userlogin");
const Notes = require("../model/Notes");
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
            console.log("User Id" , Newuser.id);
            const Auth_Token = jwt.sign(Jwtdata, Jwt_screat);
            console.log("Jwt Data" , Auth_Token);
            res.json({Auth_Token});
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

module.exports = route;
