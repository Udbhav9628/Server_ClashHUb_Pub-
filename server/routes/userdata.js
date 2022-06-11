const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const route = express.Router();
const userschema = require("../model/userdata");
const { body, validationResult } = require("express-validator");
const { getAuth } = require("firebase-admin/auth");
var jwt = require("jsonwebtoken");
const Get_User_id = require("../Middleware/getuserid");

dotenv.config({ path: path.join(__dirname, "config.env") });
const stripe = require("stripe")(process.env.STRIPE_SECREAT_KEY);

//Create User
route.post(
  "/Register",
  [
    body("Name").isLength({ min: 3 }),
    body("UserName").isLength({ min: 3 }),
    body("Phone_No").isLength({ min: 10 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const Firebase_Token = req.header("Firebase_Auth_Token");
      if (!Firebase_Token) {
        return res.status(404).send("No Firebase Auth Token");
      }
      const decodedToken = await getAuth().verifyIdToken(Firebase_Token);
      const uid = decodedToken.uid;

      let Newuser = await userschema.findOne({ User_Uid: uid });
      if (Newuser) {
        res.status(200).send("User Existed You Can Login Now");
        return;
      }
      const user = new userschema({
        Name: req.body.Name,
        UserName: req.body.UserName,
        Phone_No: req.body.Phone_No,
        FCMToken: req.body.FCMToken,
        User_Uid: uid,
      });
      const NewUser = await user.save();
      res.status(200).send(NewUser);
      // const Fire = await getAuth().createUser({
      //   uid: NewUser._id.toString(),
      //   // phoneNumber: `+${NewUser.Phone_No}`,
      //   displayName: NewUser.Name,
      // });
      // console.log(Fire);
    } catch (error) {
      res.status(500).send(error.message);
      console.log(error.message);
    }
  }
);

//Normal Login
route.get("/Login", async (req, res) => {
  try {
    //FireBase
    const Firebase_Token = req.header("Firebase_Auth_Token");
    if (!Firebase_Token) {
      return res.status(404).send("No Firebase Auth Token");
    }

    const decodedToken = await getAuth().verifyIdToken(Firebase_Token);
    const uid = decodedToken.uid;
    console.log(uid);

    //FireBase
    // let user = await userschema.findOne({ Phone_No: req.body.Phone_No });
    // if (!user) {
    //   return res
    //     .status(500)
    //     .send("Look like you don't have account, Create Your account first");
    // } else if (user) {
    //   const PayLoad = {
    //     //this is the data will recevive when verify jwt token provided in header - user id
    //     //TO Do --Save in Hashed with salt and then reverse engineer it when need to use
    //     id: user.id, //Logged User id is saved in authtoken
    //     Name: user.Name, //Logged User Name is saved in authtoken   TO Do --Save in Hashed with salt
    //   };
    //   const Auth_Token = jwt.sign(PayLoad, process.env.JWTSCREAT);
    //   return res.status(200).json({
    //     id: user._id,
    //     User: user.Name,
    //     Joined_Date: user.Date,
    //     Wallet: user.Wallet_Coins,
    //     Role: user.Role,
    //     Auth_Token,
    //   });
    // } else {
    //   return res
    //     .status(500)
    //     .json({ Message: "Login With Correct Credientals Please" });
    // }
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

//Login with Google Route
//Need to check for security Purpose
route.post("/Loginwithgoogle", [body("Email").isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let user = await userschema.findOne({ Email: req.body.Email });
    if (!user) {
      return res
        .status(500)
        .send("Look like you don't have account, Create Your account first");
    } else {
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
        Role: user.Role,
        Auth_Token,
      });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

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

//Geting Specific User Details by id
route.get("/getSpecificUserDetails/:id", async (req, res) => {
  try {
    let user = await userschema.findById(req.params.id);
    if (!user) {
      return res.status(500).send("User Not Exist May be");
    } else {
      return res.status(200).json({ Name: user.Name, Joined: user.Date });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = route;
