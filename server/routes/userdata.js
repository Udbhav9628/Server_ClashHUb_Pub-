const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const route = express.Router();
const userschema = require("../model/userdata");
const { getAuth } = require("firebase-admin/auth");
var jwt = require("jsonwebtoken");
const Get_User_id = require("../Middleware/getuserid");

dotenv.config({ path: path.join(__dirname, "config.env") });

//Create User
route.post("/Register", async (req, res) => {
  try {
    const Firebase_Token = req.header("Firebase_Auth_Token");
    if (!Firebase_Token) {
      return res.status(404).send("Something went wrong");
    }
    const decodedToken = await getAuth().verifyIdToken(Firebase_Token);
    const uid = decodedToken.uid;

    let Newuser = await userschema.findOne({ User_Uid: uid });
    if (Newuser) {
      return res.status(200).send({
        Registration_Fail: true,
        Message: "Allready Registered, You Can Login",
      });
    }
    const isUserNameExist = await userschema.findOne({
      UserName: req.body.UserName,
    });
    if (isUserNameExist) {
      return res.status(200).send({
        Registration_Fail: true,
        Message: "Registeration Failed , UserName Existed , Choose Another",
      });
    } else {
      const user = new userschema({
        Name: req.body.Name,
        Email: req.body.Email,
        UserName: req.body.UserName,
        PhotoUrl: req.body.PhotoUrl,
        FCMToken: req.body.FCMToken,
        User_Uid: uid,
      });
      const NewUser = await user.save();
      const PayLoad = {
        id: NewUser._id,
        Name: NewUser.Name,
      };
      const Auth_Token = jwt.sign(PayLoad, process.env.JWTSCREAT);
      return res.status(200).json({
        id: NewUser._id,
        User: NewUser.Name,
        UserName: NewUser.UserName,
        PhotoUrl: NewUser.PhotoUrl,
        Joined_Date: NewUser.Date,
        Auth_Token,
      });
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//Normal Login
route.put("/Login", async (req, res) => {
  try {
    //FireBase
    const Firebase_Token = req.header("Firebase_Auth_Token");
    if (!Firebase_Token) {
      return res.status(404).send("something Went wrong");
    }

    const decodedToken = await getAuth().verifyIdToken(Firebase_Token);
    const uid = decodedToken.uid;

    let user = await userschema.findOneAndUpdate(
      { User_Uid: uid },
      { FCMToken: req.body.Msgtoken }
    );
    if (user) {
      const PayLoad = {
        id: user._id,
        Name: user.Name,
      };
      const Auth_Token = jwt.sign(PayLoad, process.env.JWTSCREAT);
      return res.status(200).json({
        id: user._id,
        User: user.Name,
        UserName: user.UserName,
        PhotoUrl: user.PhotoUrl,
        Joined_Date: user.Date,
        Auth_Token,
      });
    } else {
      return res.status(200).send({
        Login_Fail: true,
        Message: "You Don't Have an Account, Register Yourself First",
      });
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

//Geting Specific User Details by id
route.get("/getSpecificUserDetails/:id", Get_User_id, async (req, res) => {
  try {
    let user = await userschema.findById(req.params.id);
    if (!user) {
      return res.status(500).send("User Not Exist May be");
    } else {
      return res.status(200).json({
        Name: user.Name,
        Joined: user.Date,
        UserName: user.UserName,
        PhotoUrl: user.PhotoUrl,
      });
    }
  } catch (error) {
    return res.status(500).send("Something Goes Wrong");
  }
});

module.exports = route;
